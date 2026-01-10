import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const DashboardLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar
                isCollapsed={sidebarCollapsed}
                setIsCollapsed={setSidebarCollapsed}
            />
            <Navbar sidebarCollapsed={sidebarCollapsed} />
            <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
