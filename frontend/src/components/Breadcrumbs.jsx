import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiChevronRight } from 'react-icons/hi2';

const routeLabels = {
    staff: 'Staff',
    create: 'Create',
    edit: 'Edit',
    attendance: 'Attendance',
    'attendance-stats': 'Statistics',
    'leave-apply': 'Apply Leave',
    'leave-approval': 'Leave Approval',
    employees: 'Employees',
    crm: 'CRM',
    orders: 'Orders',
    reports: 'Reports',
};

const routeIcons = {
    staff: '👥',
    attendance: '📅',
    'attendance-stats': '📊',
    'leave-apply': '📝',
    'leave-approval': '✅',
};

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(Boolean);

    const getLabel = (segment) => {
        // Check if it's an ID (numeric or UUID-like)
        if (/^\d+$/.test(segment) || /^[a-f0-9-]{36}$/i.test(segment)) {
            return `#${segment.slice(0, 8)}`;
        }
        return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    };

    if (pathnames.length === 0) {
        return (
            <nav className="breadcrumbs" aria-label="Breadcrumb">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: 'var(--gray-800)',
                }}>
                    <HiOutlineHome size={18} style={{ color: 'var(--primary-500)' }} />
                    <span>Dashboard</span>
                </div>
            </nav>
        );
    }

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                listStyle: 'none',
                margin: 0,
                padding: 0,
                fontSize: '0.875rem',
            }}>
                <li>
                    <Link
                        to="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--gray-500)',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary-50)';
                            e.currentTarget.style.color = 'var(--primary-600)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--gray-500)';
                        }}
                    >
                        <HiOutlineHome size={18} />
                    </Link>
                </li>

                {pathnames.map((segment, index) => {
                    const routeTo = '/' + pathnames.slice(0, index + 1).join('/');
                    const isLast = index === pathnames.length - 1;
                    const label = getLabel(segment);

                    return (
                        <li key={routeTo} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <HiChevronRight
                                size={14}
                                style={{
                                    color: 'var(--gray-300)',
                                    flexShrink: 0,
                                }}
                            />
                            {isLast ? (
                                <span
                                    style={{
                                        fontWeight: 600,
                                        color: 'var(--gray-900)',
                                        padding: '0.375rem 0.75rem',
                                        background: 'linear-gradient(135deg, var(--primary-50) 0%, rgba(168, 85, 247, 0.05) 100%)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    {routeIcons[segment] && <span>{routeIcons[segment]}</span>}
                                    {label}
                                </span>
                            ) : (
                                <Link
                                    to={routeTo}
                                    style={{
                                        color: 'var(--gray-500)',
                                        textDecoration: 'none',
                                        padding: '0.375rem 0.625rem',
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: 500,
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'var(--primary-600)';
                                        e.currentTarget.style.background = 'var(--gray-100)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--gray-500)';
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
