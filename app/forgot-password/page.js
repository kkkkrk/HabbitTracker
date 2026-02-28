'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: '14px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--text)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s, background 0.3s',
}

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(''); setSuccess('')

        if (!email.trim()) {
            setError('이메일을 입력해주세요.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || '오류가 발생했습니다.')
                return
            }
            setSuccess(data.message)
            setEmail('')
        } catch {
            setError('네트워크 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg)', transition: 'background 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div className="responsive-login-box" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
            }}>
                {/* 로고 */}
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.4px', marginBottom: '4px' }}>
                        비밀번호 찾기
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>가입하신 이메일로 재설정 링크를 보내드립니다.</p>
                </div>

                {/* 폼 */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>

                    <input
                        type="email"
                        placeholder="이메일 입력"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />

                    {error && (
                        <p style={{ fontSize: '13px', color: 'var(--red)', textAlign: 'center', padding: '8px 12px', background: 'var(--red-light)', borderRadius: '8px' }}>
                            {error}
                        </p>
                    )}
                    {success && (
                        <p style={{ fontSize: '13px', color: '#10B981', textAlign: 'center', padding: '12px', background: '#10B98110', borderRadius: '8px', lineHeight: 1.4 }}>
                            {success}
                        </p>
                    )}

                    <button type="submit" disabled={loading || success} style={{
                        width: '100%', padding: '12px', borderRadius: '12px',
                        background: (loading || success) ? 'var(--border)' : 'var(--accent)',
                        color: '#FFFFFF', border: 'none',
                        fontSize: '14px', fontWeight: 700,
                        cursor: (loading || success) ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
                    }}
                        onMouseEnter={e => { if (!loading && !success) e.currentTarget.style.opacity = '0.88' }}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        {loading ? '전송 중...' : '재설정 링크 받기'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '4px' }}>
                        <Link href="/login" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                            로그인 페이지로 돌아가기
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
