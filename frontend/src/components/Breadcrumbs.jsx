import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiHome } from 'react-icons/hi2';

const routeLabels = {
    staff: 'Staff',
    create: 'Create',
    edit: 'Edit',
    attendance: 'Attendance',
    'leave-apply': 'Apply Leave',
    'leave-approval': 'Leave Approval',
    employees: 'Employees',
    crm: 'CRM',
    orders: 'Orders',
    reports: 'Reports',
};

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(Boolean);

    const getLabel = (segment) => {
        // Check if it's an ID (numeric or UUID-like)
        if (/^\d+$/.test(segment) || /^[a-f0-9-]{36}$/i.test(segment)) {
            return `#${segment}`;
        }
        return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    };

    if (pathnames.length === 0) {
        return null;
    }

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
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
                            gap: '0.25rem',
                            color: 'var(--primary-600)',
                            textDecoration: 'none',
                        }}
                    >
                        <HiHome size={16} />
                        <span>Dashboard</span>
                    </Link>
                </li>
                {pathnames.map((segment, index) => {
                    const routeTo = '/' + pathnames.slice(0, index + 1).join('/');
                    const isLast = index === pathnames.length - 1;
                    const label = getLabel(segment);

                    return (
                        <li key={routeTo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--gray-400)' }}>/</span>
                            {isLast ? (
                                <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{label}</span>
                            ) : (
                                <Link
                                    to={routeTo}
                                    style={{
                                        color: 'var(--primary-600)',
                                        textDecoration: 'none',
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
