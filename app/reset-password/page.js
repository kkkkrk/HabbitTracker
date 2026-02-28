'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: '14px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--text)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s, background 0.3s',
}

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [token, setToken] = useState(null)
    const [userId, setUserId] = useState(null)

    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        const t = searchParams.get('token')
        const u = searchParams.get('userId')
        if (!t || !u) {
            setError('유효하지 않은 접근입니다.')
        } else {
            setToken(t)
            setUserId(u)
        }
    }, [searchParams])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(''); setSuccess('')

        if (!token || !userId) {
            setError('유효하지 않은 접근입니다.')
            return
        }

        if (password.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.')
            return
        }

        if (password !== passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, token, newPassword: password }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || '오류가 발생했습니다.')
                return
            }
            setSuccess('비밀번호가 성공적으로 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.')
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch {
            setError('네트워크 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>

            <input
                type="password"
                placeholder="새 비밀번호 (6자 이상)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required minLength={6}
                disabled={!token || !userId || success}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />

            <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                required
                disabled={!token || !userId || success}
                style={{
                    ...inputStyle,
                    borderColor: passwordConfirm && password !== passwordConfirm ? 'var(--red)' : 'var(--border)',
                }}
                onFocus={e => e.target.style.borderColor = password !== passwordConfirm ? 'var(--red)' : 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = password !== passwordConfirm ? 'var(--red)' : 'var(--border)'}
            />
            {passwordConfirm && password !== passwordConfirm && (
                <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '-4px' }}>비밀번호가 일치하지 않습니다.</p>
            )}

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

            <button type="submit" disabled={loading || success || !token || !userId} style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: (loading || success || !token || !userId) ? 'var(--border)' : 'var(--accent)',
                color: '#FFFFFF', border: 'none',
                fontSize: '14px', fontWeight: 700,
                cursor: (loading || success || !token || !userId) ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
                marginTop: '4px'
            }}
                onMouseEnter={e => { if (!loading && !success && token && userId) e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
                {loading ? '변경 중...' : '비밀번호 변경'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <Link href="/login" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    로그인으로 돌아가기
                </Link>
            </div>
        </form>
    )
}

export default function ResetPasswordPage() {
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
                        새 비밀번호 설정
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>새로운 비밀번호를 입력해주세요.</p>
                </div>

                {/* 폼 */}
                <Suspense fallback={<p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>로딩 중...</p>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
