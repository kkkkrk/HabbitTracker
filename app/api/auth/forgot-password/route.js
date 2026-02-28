import { connectMongoose } from '@/util/database'
import User from '@/app/models/User'
import ResetToken from '@/app/models/ResetToken'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'

// Initialize with a dummy key during build time if environment variable is missing
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build')

export async function POST(request) {
    try {
        await connectMongoose()
        const { email } = await request.json()

        if (!email?.trim()) {
            return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 })
        }

        const user = await User.findOne({ email: email.trim() })
        if (!user) {
            // Error handling matching generic responses for security (do not reveal if email exists)
            return NextResponse.json({ message: '해당 이메일로 가입된 계정이 있다면, 비밀번호 재설정 링크가 전송되었습니다.' }, { status: 200 })
        }

        // Generate raw token and hash it
        const rawToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = await bcrypt.hash(rawToken, 10)

        // Find and remove any existing tokens for this user
        await ResetToken.deleteMany({ userId: user._id })

        // Save new token
        await ResetToken.create({
            userId: user._id,
            token: hashedToken,
        })

        // Send Email
        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}&userId=${user._id}`

        await resend.emails.send({
            from: 'Habit Tracker <onboarding@resend.dev>', // Change if you have a custom domain on Resend
            to: user.email,
            subject: '[Habit Tracker] 비밀번호 재설정 링크',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #FF6B35;">비밀번호 재설정</h2>
                    <p>안녕하세요, ${user.username}님.</p>
                    <p>아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요. (이 링크는 1시간 동안만 유효합니다)</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #FF6B35; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        비밀번호 재설정하기
                    </a>
                    <p style="font-size: 12px; color: #888;">본인이 요청하지 않았다면, 이 이메일을 무시하셔도 됩니다.</p>
                </div>
            `
        })

        return NextResponse.json({ message: '해당 이메일로 가입된 계정이 있다면, 비밀번호 재설정 링크가 전송되었습니다.' }, { status: 200 })
    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json({ error: '서버 오류' }, { status: 500 })
    }
}
