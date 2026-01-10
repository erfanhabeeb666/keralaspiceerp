import React, { useState, useEffect } from 'react';
import {
    HiOutlineDocumentPlus,
    HiOutlineCalendarDays,
    HiOutlineClipboardDocumentList,
    HiOutlineXCircle,
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!values.leaveType) {
        errors.leaveType = 'Leave type is required';
    }

    if (!values.startDate) {
        errors.startDate = 'Start date is required';
    } else if (new Date(values.startDate) < today) {
        errors.startDate = 'Start date cannot be in the past';
    }

    if (!values.endDate) {
        errors.endDate = 'End date is required';
    } else if (new Date(values.endDate) < new Date(values.startDate)) {
        errors.endDate = 'End date cannot be before start date';
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
        const classes = {
            PENDING: 'badge-warning',
            APPROVED: 'badge-success',
            REJECTED: 'badge-error',
            CANCELLED: 'badge-gray',
        };
        return <span className={`badge ${classes[status] || 'badge-gray'}`}>{status?.toLowerCase()}</span>;
    };

    const getLeaveTypeBadge = (type) => {
        const labels = {
            CL: 'Casual Leave',
            SL: 'Sick Leave',
            LOP: 'Loss of Pay',
        };
        return <span className="badge badge-info">{labels[type] || type}</span>;
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
                    <div style={{ fontWeight: 500 }}>
                        {format(new Date(row.startDate), 'dd MMM yyyy')} - {format(new Date(row.endDate), 'dd MMM yyyy')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {row.totalDays} day{row.totalDays > 1 ? 's' : ''}
                    </div>
                </div>
            ),
        },
        {
            header: 'Reason',
            render: (row) => (
                <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.reason || '-'}
                </div>
            ),
        },
        {
            header: 'Applied On',
            render: (row) => format(new Date(row.appliedAt), 'dd MMM yyyy'),
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
                        style={{ color: 'var(--error-600)' }}
                    >
                        <HiOutlineXCircle size={18} />
                    </button>
                );
            },
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Apply for Leave</h1>
                <div className="page-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <HiOutlineDocumentPlus size={18} />
                        New Leave Request
                    </button>
                </div>
            </div>

            {/* Leave Balances */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-5)' }}>
                {leaveBalances.map((balance, idx) => (
                    <div key={idx} className="stat-card">
                        <div className={`stat-icon ${balance.leaveType === 'CL' ? 'primary' : balance.leaveType === 'SL' ? 'warning' : 'info'}`}>
                            <HiOutlineCalendarDays size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {balance.remaining} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--gray-400)' }}>/ {balance.total}</span>
                            </div>
                            <div className="stat-label">
                                {balance.leaveType === 'CL' ? 'Casual Leave' : balance.leaveType === 'SL' ? 'Sick Leave' : 'LOP'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Leave Application Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
                    <div className="card-header">
                        <h2 className="card-title">New Leave Application</h2>
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
                                            padding: 'var(--space-3) var(--space-4)',
                                            background: 'var(--gray-50)',
                                            borderRadius: 'var(--radius-lg)',
                                            fontWeight: 600,
                                            fontSize: '1.125rem',
                                            color: 'var(--primary-600)',
                                        }}
                                    >
                                        {getTotalDays()} day{getTotalDays() !== 1 ? 's' : ''}
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
                                    min={format(new Date(), 'yyyy-MM-dd')}
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
                                    min={values.startDate || format(new Date(), 'yyyy-MM-dd')}
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

                            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
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
                                >
                                    {submitting ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                            Submitting...
                                        </span>
                                    ) : (
                                        'Submit Application'
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
                        <HiOutlineClipboardDocumentList size={20} style={{ marginRight: '0.5rem' }} />
                        My Leave Requests
                    </h2>
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
                            Cancel Request
                        </button>
                    </>
                }
            >
                <p>
                    Are you sure you want to cancel this leave request?
                </p>
                {cancelModal.leave && (
                    <div style={{
                        marginTop: 'var(--space-4)',
                        padding: 'var(--space-4)',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-lg)',
                    }}>
                        <div><strong>Type:</strong> {cancelModal.leave.leaveType}</div>
                        <div><strong>Duration:</strong> {cancelModal.leave.startDate} to {cancelModal.leave.endDate}</div>
                        <div><strong>Days:</strong> {cancelModal.leave.totalDays}</div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LeaveApply;
