import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineSparkles,
} from 'react-icons/hi2';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            toast.success('Login successful!');
            navigate(from, { replace: true });
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated background elements */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-5%',
                width: '40%',
                height: '60%',
                background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                filter: 'blur(40px)',
                animation: 'pulse 8s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-15%',
                right: '-10%',
                width: '50%',
                height: '70%',
                background: 'radial-gradient(ellipse, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
                filter: 'blur(50px)',
                animation: 'pulse 10s ease-in-out infinite',
                animationDelay: '1s',
            }} />
            <div style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                width: '30%',
                height: '40%',
                background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
                transform: 'translate(-50%, -50%)',
            }} />

            {/* Grid pattern overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                opacity: 0.5,
            }} />

            <div
                style={{
                    width: '100%',
                    maxWidth: 440,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Top gradient bar */}
                <div style={{
                    height: 4,
                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #6366f1 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s ease-in-out infinite',
                }} />

                {/* Header */}
                <div
                    style={{
                        padding: '3rem 2.5rem 2rem',
                        textAlign: 'center',
                        background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0) 100%)',
                    }}
                >
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: '1.25rem',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.75rem',
                            boxShadow: '0 16px 32px -8px rgba(99, 102, 241, 0.4)',
                            position: 'relative',
                        }}
                    >
                        <span style={{
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '1.75rem',
                            letterSpacing: '-0.03em',
                        }}>KS</span>
                        {/* Sparkle decoration */}
                        <div style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            width: 24,
                            height: 24,
                            background: 'white',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}>
                            <HiOutlineSparkles size={14} style={{ color: '#a855f7' }} />
                        </div>
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: 'var(--gray-900)',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.03em',
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{
                        color: 'var(--gray-500)',
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                    }}>
                        Sign in to Kerala Spice ERP
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1rem 2.5rem 3rem' }}>
                    <div className="form-group">
                        <label
                            htmlFor="email"
                            style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: focused === 'email' ? 'var(--primary-600)' : 'var(--gray-700)',
                                marginBottom: '0.625rem',
                                transition: 'color 0.15s ease',
                            }}
                        >
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <HiOutlineEnvelope
                                size={20}
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: focused === 'email' ? 'var(--primary-500)' : 'var(--gray-400)',
                                    transition: 'color 0.15s ease',
                                }}
                            />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocused('email')}
                                onBlur={() => setFocused(null)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                style={{
                                    width: '100%',
                                    padding: '0.9rem 1rem 0.9rem 3rem',
                                    fontSize: '0.9375rem',
                                    background: 'white',
                                    border: `2px solid ${focused === 'email' ? 'var(--primary-400)' : 'var(--gray-200)'}`,
                                    borderRadius: '0.875rem',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    boxShadow: focused === 'email' ? '0 0 0 4px rgba(99, 102, 241, 0.12)' : 'var(--shadow-xs)',
                                    color: 'var(--gray-800)',
                                }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label
                            htmlFor="password"
                            style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: focused === 'password' ? 'var(--primary-600)' : 'var(--gray-700)',
                                marginBottom: '0.625rem',
                                transition: 'color 0.15s ease',
                            }}
                        >
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <HiOutlineLockClosed
                                size={20}
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: focused === 'password' ? 'var(--primary-500)' : 'var(--gray-400)',
                                    transition: 'color 0.15s ease',
                                }}
                            />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocused('password')}
                                onBlur={() => setFocused(null)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                style={{
                                    width: '100%',
                                    padding: '0.9rem 3rem 0.9rem 3rem',
                                    fontSize: '0.9375rem',
                                    background: 'white',
                                    border: `2px solid ${focused === 'password' ? 'var(--primary-400)' : 'var(--gray-200)'}`,
                                    borderRadius: '0.875rem',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    boxShadow: focused === 'password' ? '0 0 0 4px rgba(99, 102, 241, 0.12)' : 'var(--shadow-xs)',
                                    color: 'var(--gray-800)',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.875rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--gray-400)',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '0.375rem',
                                    transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gray-600)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-400)'}
                            >
                                {showPassword ? <HiOutlineEyeSlash size={20} /> : <HiOutlineEye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            marginTop: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            color: 'white',
                            background: loading
                                ? 'var(--primary-400)'
                                : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                            border: 'none',
                            borderRadius: '0.875rem',
                            cursor: loading ? 'wait' : 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: loading ? 'none' : '0 8px 24px -4px rgba(99, 102, 241, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.625rem',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(99, 102, 241, 0.45)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(99, 102, 241, 0.35)';
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2.5 }} />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    padding: '1.25rem 2.5rem',
                    background: 'var(--gray-50)',
                    borderTop: '1px solid var(--gray-100)',
                    textAlign: 'center',
                }}>
                    <p style={{
                        color: 'var(--gray-500)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                    }}>
                        © 2026 Kerala Spice. All rights reserved.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

export default Login;
