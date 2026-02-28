import { connectMongoose } from '@/util/database'
import User from '@/app/models/User'
import ResetToken from '@/app/models/ResetToken'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request) {
    try {
        await connectMongoose()
        const { userId, token, newPassword } = await request.json()

        if (!userId || !token || !newPassword) {
            return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
        }
        if (newPassword.length < 6) {
            return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 })
        }

        const resetTokenDoc = await ResetToken.findOne({ userId })
        if (!resetTokenDoc) {
            return NextResponse.json({ error: '유효하지 않거나 만료된 링크입니다.' }, { status: 400 })
        }

        const isValid = await bcrypt.compare(token, resetTokenDoc.token)
        if (!isValid) {
            return NextResponse.json({ error: '유효하지 않거나 만료된 링크입니다.' }, { status: 400 })
        }

        // Update password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12)
        await User.findByIdAndUpdate(userId, { password: hashedNewPassword })

        // Remove token
        await ResetToken.deleteOne({ _id: resetTokenDoc._id })

        return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다.' }, { status: 200 })
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}
