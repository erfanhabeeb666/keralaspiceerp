import React, { useState, useEffect } from 'react';
import {
    HiOutlineDocumentPlus,
    HiOutlineCalendarDays,
    HiOutlineClipboardDocumentList,
    HiOutlineXCircle,
    HiOutlineSparkles,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import FormInput from '../../../components/FormInput';
import Table from '../../../components/Table';
import Modal from '../../../components/Modal';
import { leaveService } from '../../../services/leaveService';
import { useForm } from '../../../hooks/useFetch';
import toast from 'react-hot-toast';
import { format, addDays, differenceInDays } from 'date-fns';

const validateLeave = (values) => {
    const errors = {};
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (!values.leaveType) {
        errors.leaveType = 'Leave type is required';
    }

    if (!values.startDate) {
        errors.startDate = 'Start date is required';
    } else {
        const startDate = new Date(values.startDate + 'T00:00:00');
        if (startDate < tomorrow) {
            errors.startDate = 'Leave request must be submitted at least one day in advance';
        }
    }

    if (!values.endDate) {
        errors.endDate = 'End date is required';
    } else if (values.startDate) {
        const startDate = new Date(values.startDate + 'T00:00:00');
        const endDate = new Date(values.endDate + 'T00:00:00');
        if (endDate < startDate) {
            errors.endDate = 'End date cannot be before start date';
        }
    }

    return errors;
};

const LeaveApply = () => {
    const [myLeaves, setMyLeaves] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [cancelModal, setCancelModal] = useState({ open: false, leave: null });

    const initialState = {
        leaveType: '',
        startDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        reason: '',
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        resetForm,
        validateForm,
    } = useForm(initialState, validateLeave);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [leavesRes, balanceRes] = await Promise.all([
                leaveService.getMyLeaves(),
                leaveService.getMyBalance(),
            ]);
            setMyLeaves(leavesRes.data || []);
            setLeaveBalances(balanceRes.data || []);
        } catch (error) {
            toast.error('Failed to load leave data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        setSubmitting(true);
        try {
            await leaveService.apply(values);
            toast.success('Leave application submitted successfully');
            resetForm(initialState);
            setShowForm(false);
            loadData();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit leave application';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        try {
            await leaveService.cancel(cancelModal.leave.id);
            toast.success('Leave request cancelled');
            setCancelModal({ open: false, leave: null });
            loadData();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to cancel leave';
            toast.error(message);
        }
    };

    const getTotalDays = () => {
        if (values.startDate && values.endDate) {
            const days = differenceInDays(new Date(values.endDate), new Date(values.startDate)) + 1;
            return days > 0 ? days : 0;
        }
        return 0;
    };

    const getStatusBadge = (status) => {
        const configs = {
            PENDING: {
                class: 'badge-warning',
                icon: HiOutlineClock,
                label: 'Pending'
            },
            APPROVED: {
                class: 'badge-success',
                icon: HiOutlineCheckCircle,
                label: 'Approved'
            },
            REJECTED: {
                class: 'badge-error',
                icon: HiOutlineXCircle,
                label: 'Rejected'
            },
            CANCELLED: {
                class: 'badge-gray',
                icon: HiOutlineExclamationCircle,
                label: 'Cancelled'
            },
        };
        const config = configs[status] || configs.CANCELLED;
        const Icon = config.icon;

        return (
            <span className={`badge badge-dot ${config.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Icon size={14} />
                {config.label}
            </span>
        );
    };

    const getLeaveTypeBadge = (type) => {
        const configs = {
            CL: { label: 'Casual Leave', color: 'primary' },
            SL: { label: 'Sick Leave', color: 'warning' },
            LOP: { label: 'Loss of Pay', color: 'gray' },
        };
        const config = configs[type] || { label: type, color: 'gray' };
        return <span className={`badge badge-${config.color === 'primary' ? 'info' : config.color}`}>{config.label}</span>;
    };

    const getLeaveIcon = (type) => {
        return <HiOutlineCalendarDays size={20} />;
    };

    const getLeaveColor = (type) => {
        const colors = {
            CL: { bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', shadow: 'rgba(99, 102, 241, 0.4)' },
            SL: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: 'rgba(245, 158, 11, 0.4)' },
            LOP: { bg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', shadow: 'rgba(100, 116, 139, 0.4)' },
        };
        return colors[type] || colors.LOP;
    };

    const leaveTypeOptions = [
        { value: 'CL', label: 'Casual Leave (CL)' },
        { value: 'SL', label: 'Sick Leave (SL)' },
        { value: 'LOP', label: 'Loss of Pay (LOP)' },
    ];

    const columns = [
        {
            header: 'Leave Type',
            render: (row) => getLeaveTypeBadge(row.leaveType),
        },
        {
            header: 'Duration',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                        {format(new Date(row.startDate), 'dd MMM yyyy')} - {format(new Date(row.endDate), 'dd MMM yyyy')}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: 2 }}>
                        {row.totalDays} day{row.totalDays > 1 ? 's' : ''}
                    </div>
                </div>
            ),
        },
        {
            header: 'Reason',
            render: (row) => (
                <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--gray-600)' }}>
                    {row.reason || '-'}
                </div>
            ),
        },
        {
            header: 'Applied On',
            render: (row) => (
                <span style={{ color: 'var(--gray-600)' }}>
                    {format(new Date(row.appliedAt), 'dd MMM yyyy')}
                </span>
            ),
        },
        {
            header: 'Status',
            render: (row) => getStatusBadge(row.status),
        },
        {
            header: 'Actions',
            width: 100,
            align: 'center',
            render: (row) => {
                const canCancel = row.status === 'PENDING' ||
                    (row.status === 'APPROVED' && new Date(row.startDate) > new Date());

                if (!canCancel) return null;

                return (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setCancelModal({ open: true, leave: row })}
                        title="Cancel"
                        style={{
                            color: 'var(--error-600)',
                            borderRadius: 'var(--radius-lg)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--error-50)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <HiOutlineXCircle size={18} />
                    </button>
                );
            },
        },
    ];

    return (
        <div className="page-container">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Apply for Leave</h1>
                    <p className="page-subtitle">Manage your leave requests and track balances</p>
                </div>
                <div className="page-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            gap: '0.5rem',
                        }}
                    >
                        <HiOutlineDocumentPlus size={20} />
                        {showForm ? 'Close Form' : 'New Leave Request'}
                    </button>
                </div>
            </div>

            {/* Leave Balances */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
                {leaveBalances.map((balance, idx) => {
                    const colors = getLeaveColor(balance.leaveType);
                    const percentage = balance.total > 0 ? (balance.remaining / balance.total) * 100 : 0;

                    return (
                        <div
                            key={idx}
                            className="stat-card"
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            {/* Top accent bar */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: colors.bg,
                            }} />

                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 'var(--radius-xl)',
                                    background: colors.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: `0 8px 24px -4px ${colors.shadow}`,
                                    flexShrink: 0,
                                }}
                            >
                                <HiOutlineCalendarDays size={26} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                    {loading ? (
                                        <div className="skeleton" style={{ width: 60, height: 36, borderRadius: 8 }} />
                                    ) : (
                                        <>
                                            {balance.remaining}
                                            <span style={{
                                                fontSize: '1rem',
                                                fontWeight: 500,
                                                color: 'var(--gray-400)',
                                            }}>
                                                / {balance.total}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="stat-label">
                                    {balance.leaveType === 'CL' ? 'Casual Leave' : balance.leaveType === 'SL' ? 'Sick Leave' : 'Loss of Pay'}
                                </div>
                                {!loading && (
                                    <div style={{ marginTop: 'var(--space-3)' }}>
                                        <div className="progress" style={{ height: 6 }}>
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${percentage}%`,
                                                    background: colors.bg,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Leave Application Form */}
            {showForm && (
                <div
                    className="card"
                    style={{
                        marginBottom: 'var(--space-8)',
                        animation: 'modalSlideUp 0.3s ease-out',
                    }}
                >
                    <div className="card-header" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)' }}>
                        <h2 className="card-title">
                            <HiOutlineSparkles size={20} style={{ color: 'var(--primary-500)' }} />
                            New Leave Application
                        </h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <FormInput
                                    label="Leave Type"
                                    name="leaveType"
                                    type="select"
                                    value={values.leaveType}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.leaveType}
                                    touched={touched.leaveType}
                                    options={leaveTypeOptions}
                                    required
                                />
                                <div>
                                    <label className="form-label">Total Days</label>
                                    <div
                                        style={{
                                            padding: 'var(--space-4)',
                                            background: 'linear-gradient(135deg, var(--primary-50) 0%, rgba(168, 85, 247, 0.05) 100%)',
                                            borderRadius: 'var(--radius-xl)',
                                            fontWeight: 700,
                                            fontSize: '1.5rem',
                                            color: 'var(--primary-600)',
                                            textAlign: 'center',
                                            border: '1px solid var(--primary-100)',
                                        }}
                                    >
                                        {getTotalDays()} <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>day{getTotalDays() !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <FormInput
                                    label="Start Date"
                                    name="startDate"
                                    type="date"
                                    value={values.startDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.startDate}
                                    touched={touched.startDate}
                                    min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                                    required
                                />
                                <FormInput
                                    label="End Date"
                                    name="endDate"
                                    type="date"
                                    value={values.endDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.endDate}
                                    touched={touched.endDate}
                                    min={values.startDate || format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                                    required
                                />
                            </div>

                            <FormInput
                                label="Reason"
                                name="reason"
                                type="textarea"
                                value={values.reason}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Describe the reason for your leave request..."
                                rows={3}
                            />

                            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm(initialState);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                    style={{ minWidth: 160 }}
                                >
                                    {submitting ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                            Submitting...
                                        </span>
                                    ) : (
                                        <>
                                            <HiOutlineCheckCircle size={18} />
                                            Submit Application
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* My Leave Requests */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        <HiOutlineClipboardDocumentList size={20} style={{ color: 'var(--primary-500)' }} />
                        My Leave Requests
                    </h2>
                    <span className="badge badge-info">{myLeaves.length} requests</span>
                </div>
                <Table
                    columns={columns}
                    data={myLeaves}
                    loading={loading}
                    emptyMessage="No leave requests found"
                />
            </div>

            {/* Cancel Confirmation Modal */}
            <Modal
                isOpen={cancelModal.open}
                onClose={() => setCancelModal({ open: false, leave: null })}
                title="Cancel Leave Request"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setCancelModal({ open: false, leave: null })}
                        >
                            Keep Request
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleCancel}
                        >
                            <HiOutlineXCircle size={18} />
                            Cancel Request
                        </button>
                    </>
                }
            >
                <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        margin: '0 auto var(--space-5)',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--error-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <HiOutlineExclamationCircle size={32} style={{ color: 'var(--error-600)' }} />
                    </div>
                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-5)' }}>
                        Are you sure you want to cancel this leave request? This action cannot be undone.
                    </p>
                </div>
                {cancelModal.leave && (
                    <div style={{
                        padding: 'var(--space-5)',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--gray-200)',
                    }}>
                        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-500)', fontWeight: 500 }}>Type</span>
                                <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{cancelModal.leave.leaveType}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-500)', fontWeight: 500 }}>Duration</span>
                                <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                                    {format(new Date(cancelModal.leave.startDate), 'dd MMM')} - {format(new Date(cancelModal.leave.endDate), 'dd MMM yyyy')}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-500)', fontWeight: 500 }}>Days</span>
                                <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{cancelModal.leave.totalDays} day{cancelModal.leave.totalDays > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LeaveApply;
