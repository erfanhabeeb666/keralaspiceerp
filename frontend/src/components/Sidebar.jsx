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
    HiOutlineChevronDoubleLeft,
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
            { label: 'Attendance Stats', path: '/staff/attendance-stats', icon: HiOutlineChartBar, adminOnly: true },
            { label: 'Apply Leave', path: '/staff/leave-apply', icon: HiOutlineDocumentText, employeeOnly: true },
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

    const sidebarStyles = {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px -4px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
    };

    const logoContainerStyles = {
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: isCollapsed ? '0 0.75rem' : '0 1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        gap: '0.625rem',
        flexShrink: 0,
    };

    const logoIconStyles = {
        width: 36,
        height: 36,
        borderRadius: '0.625rem',
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: '0.875rem',
        flexShrink: 0,
        boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.4)',
        transition: 'all 0.3s ease',
        letterSpacing: '-0.02em',
    };

    const renderMenuItem = (item, depth = 0) => {
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus.includes(item.label);
        const isActive = isMenuActive(item);

        const visibleChildren = hasChildren
            ? item.children.filter(child => (!child.adminOnly || isAdmin()) && (!child.employeeOnly || !isAdmin()))
            : [];

        if (item.adminOnly && !isAdmin()) return null;
        if (item.employeeOnly && isAdmin()) return null;

        // Compact item styles
        const itemStyles = {
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            width: '100%',
            padding: isCollapsed ? '0.5rem' : '0.5rem 0.75rem',
            marginBottom: '0.125rem',
            borderRadius: '0.5rem',
            color: isActive ? 'white' : 'rgba(255, 255, 255, 0.65)',
            background: isActive
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)'
                : 'transparent',
            border: isActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            textAlign: 'left',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            opacity: item.disabled ? 0.5 : 1,
            textDecoration: 'none',
            position: 'relative',
            overflow: 'hidden',
            fontSize: '0.8125rem',
        };

        if (item.disabled) {
            return (
                <li key={item.label}>
                    <div style={itemStyles}>
                        <Icon size={18} />
                        {!isCollapsed && (
                            <>
                                <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
                                <span style={{
                                    fontSize: '0.5625rem',
                                    fontWeight: 600,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '9999px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
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
                        style={itemStyles}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.color = 'white';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                            }
                        }}
                    >
                        <Icon size={18} />
                        {!isCollapsed && (
                            <>
                                <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
                                <div style={{
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                }}>
                                    <HiChevronDown size={14} />
                                </div>
                            </>
                        )}
                    </button>
                    {!isCollapsed && isExpanded && (
                        <ul style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: '0.125rem 0 0.25rem 0.625rem',
                            borderLeft: '1px solid rgba(99, 102, 241, 0.25)',
                            marginLeft: '1.25rem',
                        }}>
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
                    style={({ isActive }) => ({
                        ...itemStyles,
                        color: isActive ? 'white' : 'rgba(255, 255, 255, 0.65)',
                        background: isActive
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)'
                            : 'transparent',
                        border: isActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                    })}
                >
                    {({ isActive }) => (
                        <>
                            <Icon size={18} />
                            {!isCollapsed && <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.label}</span>}
                            {isActive && !isCollapsed && (
                                <div style={{
                                    position: 'absolute',
                                    right: 8,
                                    width: 5,
                                    height: 5,
                                    borderRadius: '50%',
                                    background: '#a855f7',
                                    boxShadow: '0 0 6px #a855f7',
                                }} />
                            )}
                        </>
                    )}
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
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 40,
                    }}
                />
            )}

            <aside style={sidebarStyles}>
                {/* Logo */}
                <div style={logoContainerStyles}>
                    <div style={logoIconStyles}>
                        KS
                    </div>
                    {!isCollapsed && (
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{
                                fontWeight: 700,
                                color: 'white',
                                fontSize: '0.9375rem',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.2,
                            }}>
                                Kerala Spice
                            </div>
                            <div style={{
                                fontSize: '0.6875rem',
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontWeight: 500,
                            }}>
                                ERP System
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0.75rem 0.625rem',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
                }}>
                    {!isCollapsed && (
                        <div style={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'rgba(255, 255, 255, 0.3)',
                            padding: '0 0.75rem',
                            marginBottom: '0.5rem',
                        }}>
                            Menu
                        </div>
                    )}
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {menuItems.map(item => renderMenuItem(item))}
                    </ul>
                </nav>

                {/* Collapse Button */}
                <div style={{
                    padding: '0.75rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '0.5rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                        }}
                    >
                        {isCollapsed ? (
                            <HiOutlineBars3 size={16} />
                        ) : (
                            <>
                                <HiOutlineChevronDoubleLeft size={14} />
                                <span>Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
