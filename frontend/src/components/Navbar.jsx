import React, { useState, useRef, useEffect } from 'react';
import {
    HiOutlineBell,
    HiOutlineUser,
    HiOutlineArrowRightOnRectangle,
    HiOutlineCog6Tooth,
    HiChevronDown,
    HiOutlineMagnifyingGlass,
    HiOutlineSparkles,
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from './Breadcrumbs';

const Navbar = ({ sidebarCollapsed }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
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

    const navbarStyles = {
        position: 'fixed',
        top: 0,
        right: 0,
        left: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        height: 'var(--navbar-height)',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
        zIndex: 40,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const searchWrapperStyles = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    };

    const searchInputStyles = {
        width: searchFocused ? 280 : 200,
        padding: '0.625rem 1rem 0.625rem 2.75rem',
        fontSize: '0.875rem',
        background: searchFocused ? 'white' : 'var(--gray-50)',
        border: `1.5px solid ${searchFocused ? 'var(--primary-400)' : 'var(--gray-200)'}`,
        borderRadius: '0.75rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        color: 'var(--gray-700)',
        boxShadow: searchFocused ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none',
    };

    const iconButtonStyles = {
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.75rem',
        color: 'var(--gray-500)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.15s ease',
    };

    const avatarStyles = {
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary-500) 0%, #a855f7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: '0.9375rem',
        boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.3)',
        border: '2px solid white',
    };

    const dropdownStyles = {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.75rem',
        minWidth: 240,
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
        border: '1px solid var(--gray-100)',
        overflow: 'hidden',
        zIndex: 50,
        animation: 'dropdownSlide 0.2s ease-out',
    };

    return (
        <header style={navbarStyles}>
            {/* Left Section - Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Breadcrumbs />
            </div>

            {/* Right Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Search */}
                <div style={searchWrapperStyles}>
                    <HiOutlineMagnifyingGlass
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            color: searchFocused ? 'var(--primary-500)' : 'var(--gray-400)',
                            transition: 'color 0.15s ease',
                            zIndex: 1,
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        style={searchInputStyles}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                </div>

                {/* Divider */}
                <div style={{
                    width: 1,
                    height: 32,
                    background: 'var(--gray-200)',
                    margin: '0 0.5rem',
                }} />

                {/* Notifications */}
                <button
                    style={iconButtonStyles}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--gray-100)';
                        e.currentTarget.style.color = 'var(--gray-700)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--gray-500)';
                    }}
                >
                    <HiOutlineBell size={22} />
                    {/* Notification Badge */}
                    <span
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)',
                            border: '2px solid white',
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
                            gap: '0.875rem',
                            padding: '0.5rem 0.875rem 0.5rem 0.5rem',
                            borderRadius: '0.875rem',
                            background: profileOpen ? 'var(--gray-100)' : 'transparent',
                            border: `1.5px solid ${profileOpen ? 'var(--gray-200)' : 'transparent'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            if (!profileOpen) {
                                e.currentTarget.style.background = 'var(--gray-50)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!profileOpen) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <div style={avatarStyles}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{ textAlign: 'left', minWidth: 0 }}>
                            <div style={{
                                fontWeight: 600,
                                color: 'var(--gray-800)',
                                fontSize: '0.9375rem',
                                letterSpacing: '-0.01em',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 120,
                            }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--gray-500)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                            }}>
                                {isAdmin() && <HiOutlineSparkles size={10} />}
                                {isAdmin() ? 'Administrator' : 'Employee'}
                            </div>
                        </div>
                        <HiChevronDown
                            size={16}
                            style={{
                                color: 'var(--gray-400)',
                                transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                            }}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {profileOpen && (
                        <div style={dropdownStyles}>
                            {/* User Info Header */}
                            <div style={{
                                padding: '1.25rem 1.25rem 1rem',
                                background: 'linear-gradient(180deg, var(--gray-50) 0%, white 100%)',
                                borderBottom: '1px solid var(--gray-100)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                    <div style={{
                                        ...avatarStyles,
                                        width: 48,
                                        height: 48,
                                        fontSize: '1.125rem',
                                    }}>
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{
                                            fontWeight: 700,
                                            color: 'var(--gray-900)',
                                            fontSize: '1rem',
                                            letterSpacing: '-0.01em',
                                        }}>
                                            {user?.name}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8125rem',
                                            color: 'var(--gray-500)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {user?.email}
                                        </div>
                                    </div>
                                </div>
                                {isAdmin() && (
                                    <div style={{
                                        marginTop: '0.875rem',
                                        padding: '0.375rem 0.75rem',
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: 'var(--primary-600)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                    }}>
                                        <HiOutlineSparkles size={12} />
                                        Admin Access
                                    </div>
                                )}
                            </div>

                            {/* Menu Items */}
                            <div style={{ padding: '0.5rem' }}>
                                <button
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.625rem',
                                        color: 'var(--gray-700)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        textAlign: 'left',
                                        fontSize: '0.9375rem',
                                        fontWeight: 500,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--gray-50)';
                                        e.currentTarget.style.color = 'var(--gray-900)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--gray-700)';
                                    }}
                                >
                                    <div style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '0.5rem',
                                        background: 'var(--gray-100)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--gray-600)',
                                    }}>
                                        <HiOutlineUser size={18} />
                                    </div>
                                    <span>Profile Settings</span>
                                </button>

                                <button
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.625rem',
                                        color: 'var(--gray-700)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        textAlign: 'left',
                                        fontSize: '0.9375rem',
                                        fontWeight: 500,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--gray-50)';
                                        e.currentTarget.style.color = 'var(--gray-900)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--gray-700)';
                                    }}
                                >
                                    <div style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '0.5rem',
                                        background: 'var(--gray-100)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--gray-600)',
                                    }}>
                                        <HiOutlineCog6Tooth size={18} />
                                    </div>
                                    <span>Preferences</span>
                                </button>
                            </div>

                            {/* Logout */}
                            <div style={{
                                padding: '0.5rem',
                                borderTop: '1px solid var(--gray-100)',
                                background: 'var(--gray-50)',
                            }}>
                                <button
                                    onClick={logout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.875rem',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.625rem',
                                        color: 'var(--error-600)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        textAlign: 'left',
                                        fontSize: '0.9375rem',
                                        fontWeight: 500,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--error-50)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <div style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '0.5rem',
                                        background: 'var(--error-100)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--error-600)',
                                    }}>
                                        <HiOutlineArrowRightOnRectangle size={18} />
                                    </div>
                                    <span>Sign Out</span>
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
