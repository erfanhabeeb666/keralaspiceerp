import React, { useState, useEffect } from 'react';
import {
    HiChevronLeft,
    HiChevronRight,
    HiOutlineCalendarDays,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiOutlineSparkles,
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
    isSunday,
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

    const goToToday = () => {
        setCurrentMonth(new Date());
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = getDaysInMonth();

    const selectedEmployeeData = employees.find(e => e.id == selectedEmployee);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Attendance Calendar</h1>
                    <p className="page-subtitle">Track and view attendance records</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                flexWrap: 'wrap',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4) var(--space-5)',
                    background: 'linear-gradient(135deg, var(--success-50) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--success-200)',
                }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-lg)',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--success-600)',
                        boxShadow: 'var(--shadow-xs)',
                    }}>
                        <HiOutlineCheckCircle size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-700)' }}>
                            {summary.presentDays || 0}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--success-600)' }}>Days Present</div>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4) var(--space-5)',
                    background: 'linear-gradient(135deg, var(--warning-50) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--warning-200)',
                }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-lg)',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--warning-600)',
                        boxShadow: 'var(--shadow-xs)',
                    }}>
                        <HiOutlineClock size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-700)' }}>
                            {summary.leaveDays || 0}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--warning-600)' }}>Days on Leave</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div
                    className="card-header"
                    style={{
                        flexWrap: 'wrap',
                        gap: 'var(--space-4)',
                        background: 'linear-gradient(135deg, var(--gray-50) 0%, white 100%)',
                    }}
                >
                    {/* Employee Selector (Admin only) */}
                    {isAdmin() && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <label style={{ fontWeight: 600, color: 'var(--gray-600)', fontSize: '0.875rem' }}>Employee:</label>
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                style={{
                                    width: 240,
                                    padding: 'var(--space-2-5) var(--space-4)',
                                    fontSize: '0.875rem',
                                    background: 'white',
                                    border: '1.5px solid var(--gray-200)',
                                    borderRadius: 'var(--radius-lg)',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' }}>
                        <button
                            onClick={goToToday}
                            style={{
                                padding: 'var(--space-2) var(--space-3)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--primary-200)',
                                background: 'var(--primary-50)',
                                color: 'var(--primary-600)',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => navigateMonth('prev')}
                            style={{
                                width: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--gray-200)',
                                background: 'white',
                                color: 'var(--gray-600)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <HiChevronLeft size={18} />
                        </button>
                        <span style={{
                            fontWeight: 700,
                            minWidth: 140,
                            textAlign: 'center',
                            color: 'var(--gray-800)',
                            fontSize: '1rem',
                        }}>
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button
                            onClick={() => navigateMonth('next')}
                            style={{
                                width: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--gray-200)',
                                background: 'white',
                                color: 'var(--gray-600)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <HiChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="card-body">
                    {loading ? (
                        <div className="loading-overlay" style={{ minHeight: 400 }}>
                            <div className="spinner spinner-lg" />
                            <span className="loading-text">Loading attendance...</span>
                        </div>
                    ) : (
                        <div>
                            {/* Calendar Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gap: '1px',
                                background: 'var(--gray-200)',
                                borderRadius: 'var(--radius-xl)',
                                overflow: 'hidden',
                            }}>
                                {/* Week Day Headers */}
                                {weekDays.map((day, idx) => (
                                    <div
                                        key={day}
                                        style={{
                                            padding: 'var(--space-3) var(--space-2)',
                                            background: 'var(--gray-100)',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            color: idx === 0 ? 'var(--error-500)' : 'var(--gray-600)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        {day}
                                    </div>
                                ))}

                                {/* Calendar Days */}
                                {days.map((day, idx) => {
                                    const attendanceRecord = getAttendanceForDate(day);
                                    const isCurrentMonth = isSameMonth(day, currentMonth);
                                    const isCurrentDay = isToday(day);
                                    const isSundayDay = isSunday(day);

                                    let bgColor = 'white';
                                    let statusBadge = null;

                                    if (isCurrentMonth && attendanceRecord) {
                                        if (attendanceRecord.status === 'PRESENT') {
                                            bgColor = 'var(--success-50)';
                                            statusBadge = (
                                                <span style={{
                                                    fontSize: '0.625rem',
                                                    fontWeight: 600,
                                                    padding: '0.125rem 0.375rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    background: 'var(--success-500)',
                                                    color: 'white',
                                                }}>
                                                    P
                                                </span>
                                            );
                                        } else if (attendanceRecord.status === 'LEAVE') {
                                            bgColor = 'var(--warning-50)';
                                            statusBadge = (
                                                <span style={{
                                                    fontSize: '0.625rem',
                                                    fontWeight: 600,
                                                    padding: '0.125rem 0.375rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    background: 'var(--warning-500)',
                                                    color: 'white',
                                                }}>
                                                    L
                                                </span>
                                            );
                                        }
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                minHeight: 80,
                                                padding: 'var(--space-2)',
                                                background: !isCurrentMonth ? 'var(--gray-50)' : bgColor,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 'var(--space-1)',
                                                position: 'relative',
                                                transition: 'background 0.15s ease',
                                            }}
                                        >
                                            <span style={{
                                                width: isCurrentDay ? 32 : 'auto',
                                                height: isCurrentDay ? 32 : 'auto',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 'var(--radius-full)',
                                                background: isCurrentDay ? 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)' : 'transparent',
                                                color: !isCurrentMonth ? 'var(--gray-300)' : isCurrentDay ? 'white' : isSundayDay ? 'var(--error-500)' : 'var(--gray-800)',
                                                fontWeight: isCurrentDay ? 700 : 500,
                                                fontSize: '0.9375rem',
                                                boxShadow: isCurrentDay ? '0 4px 12px -2px rgba(99, 102, 241, 0.4)' : 'none',
                                            }}>
                                                {format(day, 'd')}
                                            </span>
                                            {statusBadge}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div style={{
                                display: 'flex',
                                gap: 'var(--space-6)',
                                marginTop: 'var(--space-6)',
                                paddingTop: 'var(--space-5)',
                                borderTop: '1px solid var(--gray-100)',
                                justifyContent: 'center',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--success-50)',
                                        border: '1px solid var(--success-200)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--success-600)' }}>P</span>
                                    </div>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>Present</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--warning-50)',
                                        border: '1px solid var(--warning-200)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--warning-600)' }}>L</span>
                                    </div>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>Leave</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 'var(--radius-full)',
                                        background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                                    }} />
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>Today</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;
