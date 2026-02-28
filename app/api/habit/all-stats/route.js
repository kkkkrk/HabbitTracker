import { connectMongoose } from '@/util/database'
import HabitLog from '@/app/models/HabitLog'
import Habit from '@/app/models/Habit'
import { NextResponse } from 'next/server'

// GET /api/habit/all-stats?userId=xxx
// summary + per-habit stats를 단 2번의 DB 쿼리로 반환
export async function GET(request) {
    try {
        await connectMongoose()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        if (!userId) return NextResponse.json({ error: 'userId 필요' }, { status: 400 })

        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        // 쿼리 1: 습관 목록
        const habits = await Habit.find({ userId }).sort({ order: 1, createdAt: 1 }).lean()

        // 쿼리 2: 전체 로그를 habitName별로 집계 (단 1번의 aggregation)
        const aggResult = await HabitLog.aggregate([
            { $match: { userId, date: { $gte: oneYearAgo } } },
            {
                $group: {
                    _id: {
                        habitName: '$habitName',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: '+09:00' } }
                    },
                    count: { $sum: '$count' }
                }
            },
            { $sort: { '_id.date': 1 } }
        ])

        // habitName → logs 맵 구성
        const logsByHabit = {}
        aggResult.forEach(({ _id, count }) => {
            if (!logsByHabit[_id.habitName]) logsByHabit[_id.habitName] = []
            logsByHabit[_id.habitName].push({ date: _id.date, count })
        })

        // KST 오늘/어제
        const nowUtc = new Date()
        const kstOffset = 9 * 60 * 60 * 1000
        const todayKST = new Date(Math.floor((nowUtc.getTime() + kstOffset) / 86400000) * 86400000 - kstOffset)
        const todayStr = todayKST.toISOString().slice(0, 10)
        const yest = new Date(todayKST)
        yest.setUTCDate(yest.getUTCDate() - 1)
        const yesterdayStr = yest.toISOString().slice(0, 10)

        const summary = habits.map(habit => {
            const logs = logsByHabit[habit.name] || []
            const dateSet = new Set(logs.map(l => l.date))
            const totalCount = logs.reduce((s, l) => s + l.count, 0)

            // 스트릭 계산
            let bestStreak = 0, tempStreak = 0, prevDate = null
            for (const ds of Array.from(dateSet).sort()) {
                if (!prevDate) {
                    tempStreak = 1
                } else {
                    const prev = new Date(prevDate)
                    prev.setDate(prev.getDate() + 1)
                    tempStreak = prev.toISOString().slice(0, 10) === ds ? tempStreak + 1 : 1
                }
                if (tempStreak > bestStreak) bestStreak = tempStreak
                prevDate = ds
            }

            let currentStreak = 0
            if (dateSet.has(todayStr) || dateSet.has(yesterdayStr)) {
                let cursor = new Date(todayKST)
                if (!dateSet.has(todayStr)) cursor = new Date(yest)
                while (true) {
                    const cs = cursor.toISOString().slice(0, 10)
                    if (dateSet.has(cs)) { currentStreak++; cursor.setUTCDate(cursor.getUTCDate() - 1) }
                    else break
                }
            }

            return {
                habitId: habit._id,
                habitName: habit.name,
                totalCount,
                currentStreak,
                bestStreak,
                logs,  // 차트/히트맵용 날짜별 로그
            }
        })

        return NextResponse.json(summary)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}
