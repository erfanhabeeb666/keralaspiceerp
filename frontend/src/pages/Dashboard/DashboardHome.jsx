import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineUserGroup,
    HiOutlineCalendarDays,
    HiOutlineClipboardDocumentList,
    HiOutlineClipboardDocumentCheck,
    HiOutlineArrowRight,
    HiOutlineUserPlus,
    HiOutlinePlay,
    HiOutlineSparkles,
    HiOutlineArrowTrendingUp,
    HiOutlineChartBar,
    HiOutlineClock,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/employeeService';
import { leaveService } from '../../services/leaveService';
import { attendanceService } from '../../services/attendanceService';
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
    const [schedulerRunning, setSchedulerRunning] = useState(false);

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
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        },
        {
            label: 'Active Employees',
            value: stats.activeEmployees,
            icon: HiOutlineUserPlus,
            iconClass: 'success',
            link: '/staff',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
        {
            label: 'Pending Requests',
            value: stats.pendingLeaves,
            icon: HiOutlineClipboardDocumentCheck,
            iconClass: 'warning',
            link: '/staff/leave-approval',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        },
    ];

    const employeeStats = [
        {
            label: 'My Pending Leaves',
            value: stats.myPendingLeaves,
            icon: HiOutlineClipboardDocumentList,
            iconClass: 'warning',
            link: '/staff/leave-apply',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        },
    ];

    const quickActions = isAdmin()
        ? [
            { label: 'Add Employee', description: 'Create new employee profile', path: '/staff/create', icon: HiOutlineUserPlus, color: 'primary' },
            { label: 'Approve Leaves', description: 'Review pending requests', path: '/staff/leave-approval', icon: HiOutlineClipboardDocumentCheck, color: 'warning' },
            { label: 'View Attendance', description: 'Check attendance records', path: '/staff/attendance', icon: HiOutlineCalendarDays, color: 'info' },
            { label: 'Attendance Stats', description: 'Analytics & reports', path: '/staff/attendance-stats', icon: HiOutlineChartBar, color: 'success' },
        ]
        : [
            { label: 'Apply for Leave', description: 'Submit leave request', path: '/staff/leave-apply', icon: HiOutlineClipboardDocumentList, color: 'primary' },
            { label: 'View Attendance', description: 'Check your records', path: '/staff/attendance', icon: HiOutlineCalendarDays, color: 'info' },
        ];

    const handleRunScheduler = async () => {
        if (schedulerRunning) return;

        setSchedulerRunning(true);
        try {
            const response = await attendanceService.generateAttendance();
            toast.success(response.message || 'Attendance scheduler ran successfully!');
        } catch (error) {
            console.error('Error running scheduler:', error);
            toast.error(error.response?.data?.message || 'Failed to run scheduler');
        } finally {
            setSchedulerRunning(false);
        }
    };

    const getColorStyles = (color) => {
        const colors = {
            primary: { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)', text: 'var(--primary-600)', iconBg: 'white' },
            success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: 'var(--success-600)', iconBg: 'white' },
            warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: 'var(--warning-600)', iconBg: 'white' },
            info: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: 'var(--info-600)', iconBg: 'white' },
        };
        return colors[color] || colors.primary;
    };

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="page-container">
            {/* Welcome Section */}
            <div style={{
                marginBottom: 'var(--space-8)',
                padding: 'var(--space-8)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                borderRadius: 'var(--radius-2xl)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 300,
                    height: 300,
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: -50,
                    left: '30%',
                    width: 200,
                    height: 200,
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />

                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <HiOutlineSparkles size={20} style={{ color: 'var(--primary-500)' }} />
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--primary-600)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Dashboard
                        </span>
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: 'var(--gray-900)',
                        marginBottom: 'var(--space-2)',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.2,
                    }}>
                        {greeting}, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p style={{
                        color: 'var(--gray-600)',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                    }}>
                        <HiOutlineClock size={16} />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {(isAdmin() ? adminStats : employeeStats).map((stat, idx) => (
                    <Link
                        key={idx}
                        to={stat.link}
                        className="stat-card"
                        style={{ textDecoration: 'none', position: 'relative', overflow: 'hidden' }}
                    >
                        {/* Gradient accent bar */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: stat.gradient,
                        }} />

                        <div className={`stat-icon ${stat.iconClass}`}>
                            <stat.icon size={26} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {loading ? (
                                    <div className="skeleton" style={{ width: 60, height: 36, borderRadius: 8 }} />
                                ) : (
                                    stat.value
                                )}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                            {!loading && (
                                <div className="stat-trend up">
                                    <HiOutlineArrowTrendingUp size={14} />
                                    <span>Active</span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
                <div className="card-header">
                    <h2 className="card-title">
                        <HiOutlineSparkles size={20} style={{ color: 'var(--primary-500)' }} />
                        Quick Actions
                    </h2>
                </div>
                <div className="card-body">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 'var(--space-4)'
                        }}
                    >
                        {quickActions.map((action, idx) => {
                            const colorStyles = getColorStyles(action.color);
                            return (
                                <Link
                                    key={idx}
                                    to={action.path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-4)',
                                        padding: 'var(--space-5)',
                                        background: 'white',
                                        borderRadius: 'var(--radius-xl)',
                                        textDecoration: 'none',
                                        color: 'var(--gray-700)',
                                        border: `1.5px solid var(--gray-200)`,
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = colorStyles.border;
                                        e.currentTarget.style.background = colorStyles.bg;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--gray-200)';
                                        e.currentTarget.style.background = 'white';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 'var(--radius-xl)',
                                            background: colorStyles.bg,
                                            border: `1px solid ${colorStyles.border}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: colorStyles.text,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <action.icon size={22} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 2, color: 'var(--gray-800)' }}>{action.label}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{action.description}</div>
                                    </div>
                                    <HiOutlineArrowRight size={18} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                                </Link>
                            );
                        })}

                        {/* Run Scheduler Button - Admin Only */}
                        {isAdmin() && (
                            <button
                                onClick={handleRunScheduler}
                                disabled={schedulerRunning}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-4)',
                                    padding: 'var(--space-5)',
                                    background: schedulerRunning ? 'var(--success-50)' : 'linear-gradient(135deg, var(--success-50) 0%, rgba(16, 185, 129, 0.1) 100%)',
                                    borderRadius: 'var(--radius-xl)',
                                    textDecoration: 'none',
                                    color: 'var(--success-700)',
                                    border: '1.5px solid var(--success-200)',
                                    transition: 'all 0.2s ease',
                                    cursor: schedulerRunning ? 'wait' : 'pointer',
                                    opacity: schedulerRunning ? 0.7 : 1,
                                    textAlign: 'left',
                                }}
                                onMouseEnter={(e) => {
                                    if (!schedulerRunning) {
                                        e.currentTarget.style.borderColor = 'var(--success-400)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(16, 185, 129, 0.25)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--success-200)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 'var(--radius-xl)',
                                        background: 'white',
                                        border: '1px solid var(--success-200)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--success-600)',
                                        flexShrink: 0,
                                    }}
                                >
                                    <HiOutlinePlay size={22} style={{
                                        animation: schedulerRunning ? 'pulse 1s ease-in-out infinite' : 'none'
                                    }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 2 }}>
                                        {schedulerRunning ? 'Running...' : 'Run Scheduler'}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--success-600)', opacity: 0.8 }}>
                                        Generate attendance records
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        <HiOutlineClipboardDocumentList size={20} style={{ color: 'var(--primary-500)' }} />
                        Recent Activity
                    </h2>
                    <button className="btn btn-secondary btn-sm">View All</button>
                </div>
                <div className="card-body">
                    <div
                        style={{
                            textAlign: 'center',
                            padding: 'var(--space-12)',
                        }}
                    >
                        <div style={{
                            width: 80,
                            height: 80,
                            margin: '0 auto var(--space-5)',
                            borderRadius: 'var(--radius-2xl)',
                            background: 'linear-gradient(135deg, var(--gray-100) 0%, var(--gray-50) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <HiOutlineClipboardDocumentList size={36} style={{ color: 'var(--gray-400)' }} />
                        </div>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--space-2)',
                        }}>
                            Activity feed coming soon
                        </h3>
                        <p style={{
                            color: 'var(--gray-500)',
                            fontSize: '0.9375rem',
                            maxWidth: 300,
                            margin: '0 auto',
                        }}>
                            Track all your recent actions and updates in one place
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
