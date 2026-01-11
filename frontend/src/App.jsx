import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';

// Pages
import Login from './pages/Auth/Login';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import EmployeeList from './pages/Dashboard/Staff/EmployeeList';
import EmployeeForm from './pages/Dashboard/Staff/EmployeeForm';
import AttendanceCalendar from './pages/Dashboard/Staff/AttendanceCalendar';
import AttendanceStats from './pages/Dashboard/Staff/AttendanceStats';
import LeaveApply from './pages/Dashboard/Staff/LeaveApply';
import LeaveApproval from './pages/Dashboard/Staff/LeaveApproval';

// Styles
import './styles/global.css';

// Placeholder components for future modules
const ComingSoon = ({ title }) => (
    <div className="page-container">
        <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>{title}</h2>
                <p style={{ color: 'var(--gray-500)' }}>This module is coming soon!</p>
            </div>
        </div>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                {/* Toast Notifications */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'var(--gray-900)',
                            color: 'white',
                            fontSize: '0.875rem',
                            borderRadius: 'var(--radius-lg)',
                            padding: '0.75rem 1rem',
                        },
                        success: {
                            iconTheme: {
                                primary: 'var(--success-500)',
                                secondary: 'white',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: 'var(--error-500)',
                                secondary: 'white',
                            },
                        },
                    }}
                />

                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <DashboardLayout />
                            </PrivateRoute>
                        }
                    >
                        {/* Dashboard Home */}
                        <Route index element={<DashboardHome />} />

                        {/* Staff Module */}
                        <Route path="staff">
                            {/* Employee Management (Admin only) */}
                            <Route
                                index
                                element={
                                    <PrivateRoute adminOnly>
                                        <EmployeeList />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="create"
                                element={
                                    <PrivateRoute adminOnly>
                                        <EmployeeForm />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="edit/:id"
                                element={
                                    <PrivateRoute adminOnly>
                                        <EmployeeForm />
                                    </PrivateRoute>
                                }
                            />

                            {/* Attendance (All authenticated users) */}
                            <Route path="attendance" element={<AttendanceCalendar />} />

                            {/* Attendance Statistics (Admin only) */}
                            <Route
                                path="attendance-stats"
                                element={
                                    <PrivateRoute adminOnly>
                                        <AttendanceStats />
                                    </PrivateRoute>
                                }
                            />

                            {/* Leave Application (Employee only - not for admin) */}
                            <Route
                                path="leave-apply"
                                element={
                                    <PrivateRoute employeeOnly>
                                        <LeaveApply />
                                    </PrivateRoute>
                                }
                            />

                            {/* Leave Approval (Admin only) */}
                            <Route
                                path="leave-approval"
                                element={
                                    <PrivateRoute adminOnly>
                                        <LeaveApproval />
                                    </PrivateRoute>
                                }
                            />
                        </Route>

                        {/* Future Modules */}
                        <Route path="crm/*" element={<ComingSoon title="CRM Module" />} />
                        <Route path="orders/*" element={<ComingSoon title="Orders Module" />} />
                        <Route path="reports/*" element={<ComingSoon title="Reports Module" />} />
                    </Route>

                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
