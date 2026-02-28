'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: '14px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--text)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s, background 0.3s',
}

export default function LoginPage() {
    const { theme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    const router = useRouter()
    const [tab, setTab] = useState('login') // 'login' | 'register'
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')

    const [email, setEmail] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleCredentialsLogin = async (e) => {
        e.preventDefault()
        setError(''); setLoading(true)
        const res = await signIn('credentials', {
            redirect: false,
            username: username.trim(),
            password,
        })
        setLoading(false)
        if (res?.ok) {
            router.push('/')
            router.refresh()
        } else {
            setError('아이디 또는 비밀번호가 올바르지 않습니다.')
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(''); setSuccess('')
        if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password, email: email.trim() }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            setSuccess('가입 완료! 로그인해주세요.')
            setTab('login')
            setEmail(''); setPasswordConfirm('')
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <img
                        src="/logo.png"
                        alt="Logo"
                        style={{
                            width: '48px', height: '48px', borderRadius: '12px', marginBottom: '12px'
                        }}
                    />
                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.4px', marginBottom: '4px' }}>
                        Habit Tracker
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>작은 습관이 큰 변화를 만듭니다</p>
                </div>

                {/* 구글 로그인 */}
                <button
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        padding: '12px 20px', borderRadius: '12px',
                        background: '#FFFFFF', color: '#3C4043',
                        border: '1px solid #DADCE0', fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer', transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google로 계속하기
                </button>

                {/* 구분선 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>또는</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                {/* 탭 */}
                <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: '10px', padding: '4px', width: '100%', border: '1px solid var(--border)' }}>
                    {[['login', '로그인'], ['register', '회원가입']].map(([key, label]) => (
                        <button key={key} onClick={() => { setTab(key); setError(''); setSuccess('') }} style={{
                            flex: 1, padding: '8px', fontSize: '13px', fontWeight: tab === key ? 600 : 400,
                            background: tab === key ? 'var(--surface-hover)' : 'transparent',
                            color: tab === key ? 'var(--text)' : 'var(--text-secondary)',
                            border: tab === key ? '1px solid var(--border)' : '1px solid transparent',
                            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                        }}>{label}</button>
                    ))}
                </div>

                {/* 폼 */}
                <form onSubmit={tab === 'login' ? handleCredentialsLogin : handleRegister}
                    style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>

                    {tab === 'register' && (
                        <>

                            <input
                                type="email"
                                placeholder="이메일 (필수)"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </>
                    )}

                    <input
                        placeholder="아이디 (3자 이상)"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required minLength={3} maxLength={30}
                        autoComplete="username"
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호 (6자 이상)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required minLength={6}
                        autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />

                    {tab === 'register' && (
                        <>
                            <input
                                type="password"
                                placeholder="비밀번호 확인"
                                value={passwordConfirm}
                                onChange={e => setPasswordConfirm(e.target.value)}
                                required
                                autoComplete="new-password"
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
                        </>
                    )}

                    {error && (
                        <p style={{ fontSize: '13px', color: 'var(--red)', textAlign: 'center', padding: '8px 12px', background: 'var(--red-light)', borderRadius: '8px' }}>
                            {error}
                        </p>
                    )}
                    {success && (
                        <p style={{ fontSize: '13px', color: '#10B981', textAlign: 'center', padding: '8px 12px', background: '#10B98110', borderRadius: '8px' }}>
                            {success}
                        </p>
                    )}

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '12px', borderRadius: '12px',
                        background: loading ? 'var(--border)' : 'var(--accent)',
                        color: '#FFFFFF', border: 'none',
                        fontSize: '14px', fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
                    }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
                    </button>

                    {tab === 'login' && (
                        <div style={{ textAlign: 'center', marginTop: '4px' }}>
                            <Link href="/forgot-password" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                                비밀번호를 잊으셨나요?
                            </Link>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
