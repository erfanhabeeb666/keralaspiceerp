import React, { useState, useRef, useEffect } from 'react';
import {
    HiOutlineBell,
    HiOutlineUser,
    HiOutlineArrowRightOnRectangle,
    HiOutlineCog6Tooth,
    HiChevronDown,
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from './Breadcrumbs';

const Navbar = ({ sidebarCollapsed }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                left: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
                height: 'var(--navbar-height)',
                background: 'white',
                borderBottom: '1px solid var(--gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                zIndex: 40,
                transition: 'left 0.2s ease',
            }}
        >
            {/* Breadcrumbs */}
            <Breadcrumbs />

            {/* Right Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Notifications */}
                <button
                    style={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.5rem',
                        color: 'var(--gray-500)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <HiOutlineBell size={22} />
                    {/* Notification Badge */}
                    <span
                        style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--error-500)',
                        }}
                    />
                </button>

                {/* Profile Dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.5rem',
                            background: profileOpen ? 'var(--gray-100)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                        onMouseLeave={(e) => !profileOpen && (e.currentTarget.style.background = 'transparent')}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 500, color: 'var(--gray-800)', fontSize: '0.875rem' }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                {isAdmin() ? 'Administrator' : 'Employee'}
                            </div>
                        </div>
                        <HiChevronDown
                            size={16}
                            style={{
                                color: 'var(--gray-400)',
                                transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.15s ease',
                            }}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {profileOpen && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                minWidth: 200,
                                background: 'white',
                                borderRadius: '0.5rem',
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid var(--gray-200)',
                                overflow: 'hidden',
                                zIndex: 50,
                            }}
                        >
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
                                <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{user?.email}</div>
                            </div>

                            <div style={{ padding: '0.5rem' }}>
                                <button
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '0.375rem',
                                        color: 'var(--gray-700)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s ease',
                                        textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <HiOutlineUser size={18} />
                                    <span>Profile</span>
                                </button>

                                <button
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '0.375rem',
                                        color: 'var(--gray-700)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s ease',
                                        textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <HiOutlineCog6Tooth size={18} />
                                    <span>Settings</span>
                                </button>
                            </div>

                            <div style={{ padding: '0.5rem', borderTop: '1px solid var(--gray-100)' }}>
                                <button
                                    onClick={logout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '0.375rem',
                                        color: 'var(--error-600)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s ease',
                                        textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error-50)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <HiOutlineArrowRightOnRectangle size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
