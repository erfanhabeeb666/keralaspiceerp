import React, { useState, useEffect } from 'react';
import {
    HiChevronLeft,
    HiChevronRight,
    HiOutlineCalendarDays,
} from 'react-icons/hi2';
import { useAuth } from '../../../context/AuthContext';
import { attendanceService } from '../../../services/attendanceService';
import { employeeService } from '../../../services/employeeService';
import toast from 'react-hot-toast';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    addMonths,
    subMonths,
    getDay,
    startOfWeek,
    endOfWeek,
} from 'date-fns';

const AttendanceCalendar = () => {
    const { isAdmin, user } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ presentDays: 0, leaveDays: 0 });

    useEffect(() => {
        if (isAdmin()) {
            loadEmployees();
        } else {
            loadMyAttendance();
        }
    }, []);

    useEffect(() => {
        if (selectedEmployee || !isAdmin()) {
            loadAttendance();
        }
    }, [currentMonth, selectedEmployee]);

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

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

            let response;
            if (isAdmin() && selectedEmployee) {
                response = await attendanceService.getEmployeeAttendance(selectedEmployee, startDate, endDate);
                const summaryRes = await attendanceService.getEmployeeAttendanceSummary(selectedEmployee, startDate, endDate);
                setSummary(summaryRes.data || { presentDays: 0, leaveDays: 0 });
            } else {
                response = await attendanceService.getMyAttendanceRange(startDate, endDate);
                const summaryRes = await attendanceService.getMyAttendanceSummary(startDate, endDate);
                setSummary(summaryRes.data || { presentDays: 0, leaveDays: 0 });
            }

            setAttendance(response.data || []);
        } catch (error) {
            console.error('Failed to load attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMyAttendance = async () => {
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

        try {
            setLoading(true);
            const [attendanceRes, summaryRes] = await Promise.all([
                attendanceService.getMyAttendanceRange(startDate, endDate),
                attendanceService.getMyAttendanceSummary(startDate, endDate),
            ]);

            setAttendance(attendanceRes.data || []);
            setSummary(summaryRes.data || { presentDays: 0, leaveDays: 0 });
        } catch (error) {
            console.error('Failed to load attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAttendanceForDate = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return attendance.find(a => a.attendanceDate === dateStr);
    };

    const getDaysInMonth = () => {
        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfWeek(endOfMonth(currentMonth));
        return eachDayOfInterval({ start, end });
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = getDaysInMonth();

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Attendance Calendar</h1>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-5)' }}>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <HiOutlineCalendarDays />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{summary.presentDays || 0}</div>
                        <div className="stat-label">Days Present</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <HiOutlineCalendarDays />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{summary.leaveDays || 0}</div>
                        <div className="stat-label">Days on Leave</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    {/* Employee Selector (Admin only) */}
                    {isAdmin() && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <label style={{ fontWeight: 500, color: 'var(--gray-600)' }}>Employee:</label>
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="form-input form-select"
                                style={{ width: 250 }}
                            >
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.fullName} ({emp.employeeCode})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Month Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <button
                            className="btn btn-ghost"
                            onClick={() => navigateMonth('prev')}
                        >
                            <HiChevronLeft size={20} />
                        </button>
                        <span style={{ fontWeight: 600, minWidth: 150, textAlign: 'center' }}>
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button
                            className="btn btn-ghost"
                            onClick={() => navigateMonth('next')}
                        >
                            <HiChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="card-body">
                    {loading ? (
                        <div className="loading-overlay">
                            <div className="spinner spinner-lg" />
                            <span style={{ color: 'var(--gray-500)' }}>Loading attendance...</span>
                        </div>
                    ) : (
                        <div className="calendar">
                            {/* Week Day Headers */}
                            <div className="calendar-grid">
                                {weekDays.map(day => (
                                    <div key={day} className="calendar-day-header">{day}</div>
                                ))}

                                {/* Calendar Days */}
                                {days.map((day, idx) => {
                                    const attendanceRecord = getAttendanceForDate(day);
                                    const isCurrentMonth = isSameMonth(day, currentMonth);
                                    const isCurrentDay = isToday(day);

                                    let statusClass = '';
                                    let statusLabel = '';

                                    if (attendanceRecord) {
                                        if (attendanceRecord.status === 'PRESENT') {
                                            statusClass = 'present';
                                            statusLabel = 'Present';
                                        } else if (attendanceRecord.status === 'LEAVE') {
                                            statusClass = 'leave';
                                            statusLabel = 'Leave';
                                        }
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            className={`calendar-day ${statusClass} ${isCurrentDay ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                                        >
                                            <span className="calendar-day-number">{format(day, 'd')}</span>
                                            {statusLabel && isCurrentMonth && (
                                                <span
                                                    className="calendar-day-status"
                                                    style={{
                                                        background: statusClass === 'present' ? 'var(--success-500)' : 'var(--warning-500)',
                                                        color: 'white',
                                                    }}
                                                >
                                                    {statusLabel}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-6)',
                        marginTop: 'var(--space-6)',
                        paddingTop: 'var(--space-4)',
                        borderTop: '1px solid var(--gray-200)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div style={{
                                width: 16,
                                height: 16,
                                borderRadius: 4,
                                background: 'var(--success-50)',
                                border: '1px solid var(--success-200)',
                            }} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Present</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div style={{
                                width: 16,
                                height: 16,
                                borderRadius: 4,
                                background: 'var(--warning-50)',
                                border: '1px solid var(--warning-200)',
                            }} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Leave</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div style={{
                                width: 16,
                                height: 16,
                                borderRadius: 4,
                                background: 'var(--primary-50)',
                                border: '1px solid var(--primary-200)',
                            }} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Today</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;
