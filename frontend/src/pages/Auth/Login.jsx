import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
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
                background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--primary-900) 100%)',
                padding: '1rem',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 420,
                    background: 'white',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-xl)',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '2.5rem 2rem 2rem',
                        textAlign: 'center',
                        background: 'linear-gradient(180deg, var(--gray-50) 0%, white 100%)',
                    }}
                >
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)',
                        }}
                    >
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>KS</span>
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                        Sign in to Kerala Spice ERP
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem 2.5rem' }}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <HiOutlineEnvelope
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '0.875rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--gray-400)',
                                }}
                            />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                placeholder="you@example.com"
                                style={{ paddingLeft: '2.75rem' }}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <HiOutlineLockClosed
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '0.875rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--gray-400)',
                                }}
                            />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="••••••••"
                                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                                autoComplete="current-password"
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
                                    padding: 0,
                                }}
                            >
                                {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            marginTop: '0.5rem',
                            fontSize: '1rem',
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
