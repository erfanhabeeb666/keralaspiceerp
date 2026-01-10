import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineUserGroup,
    HiOutlineCalendarDays,
    HiOutlineClipboardDocumentList,
    HiOutlineClipboardDocumentCheck,
    HiOutlineArrowRight,
    HiOutlineUserPlus,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/employeeService';
import { leaveService } from '../../services/leaveService';
import toast from 'react-hot-toast';

const DashboardHome = () => {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        pendingLeaves: 0,
        myPendingLeaves: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            if (isAdmin()) {
                const [employeesRes, pendingLeavesRes] = await Promise.all([
                    employeeService.getAll(),
                    leaveService.getPending(),
                ]);

                const employees = employeesRes.data || [];
                const pendingLeaves = pendingLeavesRes.data || [];

                setStats({
                    totalEmployees: employees.length,
                    activeEmployees: employees.filter(e => e.status === 'ACTIVE').length,
                    pendingLeaves: pendingLeaves.length,
                    myPendingLeaves: 0,
                });
            } else {
                const myLeavesRes = await leaveService.getMyLeaves();
                const myLeaves = myLeavesRes.data || [];

                setStats({
                    totalEmployees: 0,
                    activeEmployees: 0,
                    pendingLeaves: 0,
                    myPendingLeaves: myLeaves.filter(l => l.status === 'PENDING').length,
                });
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const adminStats = [
        {
            label: 'Total Employees',
            value: stats.totalEmployees,
            icon: HiOutlineUserGroup,
            iconClass: 'primary',
            link: '/staff',
        },
        {
            label: 'Active Employees',
            value: stats.activeEmployees,
            icon: HiOutlineUserPlus,
            iconClass: 'success',
            link: '/staff',
        },
        {
            label: 'Pending Leave Requests',
            value: stats.pendingLeaves,
            icon: HiOutlineClipboardDocumentCheck,
            iconClass: 'warning',
            link: '/staff/leave-approval',
        },
    ];

    const employeeStats = [
        {
            label: 'My Pending Leaves',
            value: stats.myPendingLeaves,
            icon: HiOutlineClipboardDocumentList,
            iconClass: 'warning',
            link: '/staff/leave-apply',
        },
    ];

    const quickActions = isAdmin()
        ? [
            { label: 'Add Employee', path: '/staff/create', icon: HiOutlineUserPlus },
            { label: 'Approve Leaves', path: '/staff/leave-approval', icon: HiOutlineClipboardDocumentCheck },
            { label: 'View Attendance', path: '/staff/attendance', icon: HiOutlineCalendarDays },
        ]
        : [
            { label: 'Apply for Leave', path: '/staff/leave-apply', icon: HiOutlineClipboardDocumentList },
            { label: 'View Attendance', path: '/staff/attendance', icon: HiOutlineCalendarDays },
        ];

    return (
        <div className="page-container">
            {/* Welcome Section */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                    Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p style={{ color: 'var(--gray-500)' }}>
                    Here's what's happening with your ERP today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {(isAdmin() ? adminStats : employeeStats).map((stat, idx) => (
                    <Link
                        key={idx}
                        to={stat.link}
                        className="stat-card"
                        style={{ textDecoration: 'none' }}
                    >
                        <div className={`stat-icon ${stat.iconClass}`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {loading ? '-' : stat.value}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header">
                    <h2 className="card-title">Quick Actions</h2>
                </div>
                <div className="card-body">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 'var(--space-4)'
                        }}
                    >
                        {quickActions.map((action, idx) => (
                            <Link
                                key={idx}
                                to={action.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-4)',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-lg)',
                                    textDecoration: 'none',
                                    color: 'var(--gray-700)',
                                    border: '1px solid var(--gray-200)',
                                    transition: 'all var(--transition-fast)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--primary-300)';
                                    e.currentTarget.style.background = 'var(--primary-50)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                                    e.currentTarget.style.background = 'var(--gray-50)';
                                }}
                            >
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 'var(--radius-lg)',
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--primary-600)',
                                    }}
                                >
                                    <action.icon size={20} />
                                </div>
                                <span style={{ fontWeight: 500, flex: 1 }}>{action.label}</span>
                                <HiOutlineArrowRight size={16} style={{ color: 'var(--gray-400)' }} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Recent Activity</h2>
                </div>
                <div className="card-body">
                    <div
                        style={{
                            textAlign: 'center',
                            padding: 'var(--space-8)',
                            color: 'var(--gray-400)'
                        }}
                    >
                        <HiOutlineClipboardDocumentList size={48} style={{ marginBottom: 'var(--space-3)' }} />
                        <p>Activity feed coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
