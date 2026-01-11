import React, { useState, useEffect } from 'react';
import {
    HiOutlineCalendarDays,
    HiOutlineCheckCircle,
    HiOutlineClipboardDocumentList,
    HiOutlineClock,
    HiOutlineFunnel,
    HiOutlineTableCells,
    HiOutlineChartBar,
} from 'react-icons/hi2';
import { useAuth } from '../../../context/AuthContext';
import { attendanceService } from '../../../services/attendanceService';
import { employeeService } from '../../../services/employeeService';
import toast from 'react-hot-toast';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const AttendanceStats = () => {
    const { isAdmin } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [attendance, setAttendance] = useState([]);
    const [summary, setSummary] = useState({ presentDays: 0, leaveDays: 0 });
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (isAdmin()) {
            loadEmployees();
        }
    }, []);

    const loadEmployees = async () => {
        try {
            const response = await employeeService.getActive();
            setEmployees(response.data || []);
            if (response.data?.length > 0) {
                setSelectedEmployee(response.data[0].id);
            }
        } catch (error) {
            toast.error('Failed to load employees');
        }
    };

    const handleSearch = async () => {
        if (!selectedEmployee) {
            toast.error('Please select an employee');
            return;
        }
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            toast.error('Start date cannot be after end date');
            return;
        }

        try {
            setLoading(true);
            setHasSearched(true);

            const [attendanceRes, summaryRes] = await Promise.all([
                attendanceService.getEmployeeAttendance(selectedEmployee, startDate, endDate),
                attendanceService.getEmployeeAttendanceSummary(selectedEmployee, startDate, endDate),
            ]);

            setAttendance(attendanceRes.data || []);
            setSummary(summaryRes.data || { presentDays: 0, leaveDays: 0 });
        } catch (error) {
            console.error('Failed to load attendance:', error);
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const setQuickDateRange = (range) => {
        const today = new Date();
        let start, end;

        switch (range) {
            case 'thisMonth':
                start = startOfMonth(today);
                end = endOfMonth(today);
                break;
            case 'lastMonth':
                start = startOfMonth(subMonths(today, 1));
                end = endOfMonth(subMonths(today, 1));
                break;
            case 'last3Months':
                start = startOfMonth(subMonths(today, 2));
                end = endOfMonth(today);
                break;
            case 'last6Months':
                start = startOfMonth(subMonths(today, 5));
                end = endOfMonth(today);
                break;
            default:
                return;
        }

        setStartDate(format(start, 'yyyy-MM-dd'));
        setEndDate(format(end, 'yyyy-MM-dd'));
    };

    const getSelectedEmployeeName = () => {
        const emp = employees.find(e => e.id === parseInt(selectedEmployee));
        return emp ? `${emp.fullName} (${emp.employeeCode})` : '';
    };

    const attendanceRate = summary.presentDays + summary.leaveDays > 0
        ? ((summary.presentDays / (summary.presentDays + summary.leaveDays)) * 100).toFixed(1)
        : 0;

    if (!isAdmin()) {
        return (
            <div className="page-container">
                <div className="card">
                    <div className="card-body">
                        <div className="empty-state">
                            <HiOutlineClipboardDocumentList className="empty-state-icon" />
                            <h3 className="empty-state-title">Access Denied</h3>
                            <p className="empty-state-text">This feature is only available for administrators.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    <HiOutlineChartBar style={{ marginRight: 'var(--space-3)', verticalAlign: 'middle' }} />
                    Attendance Statistics
                </h1>
            </div>

            {/* Search Filters Card */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <HiOutlineFunnel size={20} style={{ color: 'var(--primary-600)' }} />
                        <span className="card-title" style={{ fontSize: '1rem' }}>Search Filters</span>
                    </div>
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        {/* Employee Selector */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label required">Select Employee</label>
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="form-input form-select"
                            >
                                <option value="">-- Select Employee --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.fullName} ({emp.employeeCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label required">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        {/* End Date */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label required">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Quick Date Range Buttons */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginRight: 'var(--space-2)' }}>Quick Select:</span>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => setQuickDateRange('thisMonth')}
                        >
                            This Month
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => setQuickDateRange('lastMonth')}
                        >
                            Last Month
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => setQuickDateRange('last3Months')}
                        >
                            Last 3 Months
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => setQuickDateRange('last6Months')}
                        >
                            Last 6 Months
                        </button>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="btn btn-primary"
                        disabled={loading || !selectedEmployee}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 16, height: 16 }} />
                                Searching...
                            </>
                        ) : (
                            <>
                                <HiOutlineTableCells size={18} />
                                View Statistics
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {hasSearched && !loading && (
                <>
                    {/* Summary Stats Cards */}
                    <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="stat-card">
                            <div className="stat-icon success">
                                <HiOutlineCheckCircle />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{summary.presentDays || 0}</div>
                                <div className="stat-label">Days Present</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon warning">
                                <HiOutlineClock />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{summary.leaveDays || 0}</div>
                                <div className="stat-label">Days on Leave</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon primary">
                                <HiOutlineCalendarDays />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{(summary.presentDays || 0) + (summary.leaveDays || 0)}</div>
                                <div className="stat-label">Total Working Days</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon info">
                                <HiOutlineChartBar />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{attendanceRate}%</div>
                                <div className="stat-label">Attendance Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Rate Visual Bar */}
                    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                        <div className="card-header">
                            <span className="card-title">Attendance Overview for {getSelectedEmployeeName()}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                {format(new Date(startDate), 'MMM dd, yyyy')} - {format(new Date(endDate), 'MMM dd, yyyy')}
                            </span>
                        </div>
                        <div className="card-body">
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                    <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Attendance Rate</span>
                                    <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{attendanceRate}%</span>
                                </div>
                                <div style={{
                                    height: 12,
                                    background: 'var(--gray-100)',
                                    borderRadius: 'var(--radius-full)',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${attendanceRate}%`,
                                        background: parseFloat(attendanceRate) >= 80
                                            ? 'linear-gradient(90deg, var(--success-500), var(--success-600))'
                                            : parseFloat(attendanceRate) >= 60
                                                ? 'linear-gradient(90deg, var(--warning-500), var(--warning-600))'
                                                : 'linear-gradient(90deg, var(--error-500), var(--error-600))',
                                        borderRadius: 'var(--radius-full)',
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div style={{
                                display: 'flex',
                                gap: 'var(--space-6)',
                                marginTop: 'var(--space-4)',
                                paddingTop: 'var(--space-4)',
                                borderTop: '1px solid var(--gray-100)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: 4,
                                        background: 'var(--success-500)',
                                    }} />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        Present: {summary.presentDays || 0} days
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: 4,
                                        background: 'var(--warning-500)',
                                    }} />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        Leave: {summary.leaveDays || 0} days
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Records Table */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Detailed Attendance Records</span>
                            <span className="badge badge-info">{attendance.length} Records</span>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {attendance.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Day</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendance.map((record, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 500 }}>
                                                        {format(new Date(record.attendanceDate), 'MMM dd, yyyy')}
                                                    </td>
                                                    <td style={{ color: 'var(--gray-500)' }}>
                                                        {format(new Date(record.attendanceDate), 'EEEE')}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${record.status === 'PRESENT' ? 'badge-success' : 'badge-warning'}`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <HiOutlineCalendarDays className="empty-state-icon" />
                                    <h3 className="empty-state-title">No Attendance Records</h3>
                                    <p className="empty-state-text">
                                        No attendance records found for the selected employee and date range.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Initial State */}
            {!hasSearched && !loading && (
                <div className="card">
                    <div className="card-body">
                        <div className="empty-state">
                            <HiOutlineChartBar className="empty-state-icon" />
                            <h3 className="empty-state-title">Select an Employee</h3>
                            <p className="empty-state-text">
                                Choose an employee and date range above to view their attendance statistics.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="card">
                    <div className="card-body">
                        <div className="loading-overlay">
                            <div className="spinner spinner-lg" />
                            <span style={{ color: 'var(--gray-500)' }}>Loading attendance statistics...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceStats;
