import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    HiOutlineHome,
    HiOutlineUserGroup,
    HiOutlineCalendarDays,
    HiOutlineDocumentText,
    HiOutlineChartBar,
    HiOutlineShoppingCart,
    HiOutlineUsers,
    HiOutlineClipboardDocumentList,
    HiOutlineClipboardDocumentCheck,
    HiChevronDown,
    HiChevronRight,
    HiOutlineBars3,
    HiXMark,
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

const menuItems = [
    {
        label: 'Dashboard',
        path: '/',
        icon: HiOutlineHome,
    },
    {
        label: 'Staff',
        icon: HiOutlineUserGroup,
        children: [
            { label: 'Employees', path: '/staff', icon: HiOutlineUsers, adminOnly: true },
            { label: 'Attendance', path: '/staff/attendance', icon: HiOutlineCalendarDays },
            { label: 'Apply Leave', path: '/staff/leave-apply', icon: HiOutlineDocumentText },
            { label: 'Leave Approval', path: '/staff/leave-approval', icon: HiOutlineClipboardDocumentCheck, adminOnly: true },
        ],
    },
    {
        label: 'CRM',
        icon: HiOutlineUsers,
        path: '/crm',
        disabled: true,
    },
    {
        label: 'Orders',
        icon: HiOutlineShoppingCart,
        path: '/orders',
        disabled: true,
    },
    {
        label: 'Reports',
        icon: HiOutlineChartBar,
        path: '/reports',
        disabled: true,
    },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const [expandedMenus, setExpandedMenus] = useState(['Staff']);
    const location = useLocation();
    const { isAdmin } = useAuth();

    const toggleMenu = (label) => {
        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(m => m !== label)
                : [...prev, label]
        );
    };

    const isMenuActive = (item) => {
        if (item.path) return location.pathname === item.path;
        if (item.children) {
            return item.children.some(child => location.pathname === child.path);
        }
        return false;
    };

    const renderMenuItem = (item, depth = 0) => {
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus.includes(item.label);
        const isActive = isMenuActive(item);

        // Filter children based on adminOnly
        const visibleChildren = hasChildren
            ? item.children.filter(child => !child.adminOnly || isAdmin())
            : [];

        if (item.adminOnly && !isAdmin()) return null;
        if (item.disabled) {
            return (
                <li key={item.label}>
                    <div
                        className="sidebar-item disabled"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: isCollapsed ? '0.75rem' : '0.75rem 1rem',
                            marginBottom: '0.25rem',
                            borderRadius: '0.5rem',
                            color: 'var(--gray-400)',
                            cursor: 'not-allowed',
                            opacity: 0.6,
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                        }}
                    >
                        <Icon size={20} />
                        {!isCollapsed && (
                            <>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                <span style={{
                                    fontSize: '0.625rem',
                                    background: 'var(--gray-100)',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '9999px',
                                }}>
                                    Soon
                                </span>
                            </>
                        )}
                    </div>
                </li>
            );
        }

        if (hasChildren && visibleChildren.length > 0) {
            return (
                <li key={item.label}>
                    <button
                        onClick={() => toggleMenu(item.label)}
                        className="sidebar-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            padding: isCollapsed ? '0.75rem' : '0.75rem 1rem',
                            marginBottom: '0.25rem',
                            borderRadius: '0.5rem',
                            color: isActive ? 'var(--primary-600)' : 'var(--gray-600)',
                            background: isActive ? 'var(--primary-50)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'left',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                        }}
                    >
                        <Icon size={20} />
                        {!isCollapsed && (
                            <>
                                <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
                                {isExpanded ? <HiChevronDown size={16} /> : <HiChevronRight size={16} />}
                            </>
                        )}
                    </button>
                    {!isCollapsed && isExpanded && (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginLeft: '1rem' }}>
                            {visibleChildren.map(child => renderMenuItem(child, depth + 1))}
                        </ul>
                    )}
                </li>
            );
        }

        return (
            <li key={item.label}>
                <NavLink
                    to={item.path}
                    className="sidebar-item"
                    style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: isCollapsed ? '0.75rem' : '0.75rem 1rem',
                        marginBottom: '0.25rem',
                        borderRadius: '0.5rem',
                        color: isActive ? 'var(--primary-600)' : 'var(--gray-600)',
                        background: isActive ? 'var(--primary-50)' : 'transparent',
                        textDecoration: 'none',
                        fontWeight: isActive ? 500 : 400,
                        transition: 'all 0.15s ease',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                    })}
                >
                    <Icon size={20} />
                    {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
            </li>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {!isCollapsed && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsCollapsed(true)}
                    style={{
                        display: 'none',
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 40,
                    }}
                />
            )}

            <aside
                className="sidebar"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
                    background: 'white',
                    borderRight: '1px solid var(--gray-200)',
                    transition: 'width 0.2s ease',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        height: 'var(--navbar-height)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: isCollapsed ? '0 1rem' : '0 1.5rem',
                        borderBottom: '1px solid var(--gray-100)',
                        gap: '0.75rem',
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '0.5rem',
                            background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.125rem',
                        }}
                    >
                        KS
                    </div>
                    {!isCollapsed && (
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1rem' }}>
                                Kerala Spice
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                ERP System
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.75rem' }}>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {menuItems.map(item => renderMenuItem(item))}
                    </ul>
                </nav>

                {/* Collapse Button */}
                <div style={{ padding: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            background: 'var(--gray-50)',
                            border: '1px solid var(--gray-200)',
                            borderRadius: '0.5rem',
                            color: 'var(--gray-600)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        {isCollapsed ? <HiOutlineBars3 size={20} /> : <HiXMark size={20} />}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
