import React, { useState, useEffect } from 'react';
import {
    HiOutlineCheck,
    HiOutlineXMark,
    HiOutlineEye,
    HiOutlineClipboardDocumentCheck,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineExclamationTriangle,
    HiOutlineCalendarDays,
    HiOutlineUser,
} from 'react-icons/hi2';
import Table from '../../../components/Table';
import Modal from '../../../components/Modal';
import FormInput from '../../../components/FormInput';
import { leaveService } from '../../../services/leaveService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LeaveApproval = () => {
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [viewModal, setViewModal] = useState({ open: false, leave: null });
    const [rejectModal, setRejectModal] = useState({ open: false, leave: null });
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadLeaves();
    }, []);

    const loadLeaves = async () => {
        try {
            setLoading(true);
            const [pendingRes, allRes] = await Promise.all([
                leaveService.getPending(),
                leaveService.getAll(),
            ]);
            setPendingLeaves(pendingRes.data || []);
            setAllLeaves(allRes.data || []);
        } catch (error) {
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (leaveId) => {
        setProcessing(true);
        try {
            await leaveService.approve(leaveId);
            toast.success('Leave request approved');
            loadLeaves();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to approve leave';
            toast.error(message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        setProcessing(true);
        try {
            await leaveService.reject(rejectModal.leave.id, rejectionReason);
            toast.success('Leave request rejected');
            setRejectModal({ open: false, leave: null });
            setRejectionReason('');
            loadLeaves();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reject leave';
            toast.error(message);
        } finally {
            setProcessing(false);
        }
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
                icon: HiOutlineXMark,
                label: 'Cancelled'
            },
        };
        const config = configs[status] || configs.CANCELLED;
        const Icon = config.icon;

        return (
            <span className={`badge ${config.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const getLeaveTypeBadge = (type) => {
        const configs = {
            CL: { label: 'Casual Leave', color: 'info' },
            SL: { label: 'Sick Leave', color: 'warning' },
            LOP: { label: 'Loss of Pay', color: 'gray' },
        };
        const config = configs[type] || { label: type, color: 'gray' };
        return <span className={`badge badge-${config.color}`}>{config.label}</span>;
    };

    const getAvatarGradient = (name) => {
        const gradients = [
            'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        ];
        const index = name ? name.charCodeAt(0) % gradients.length : 0;
        return gradients[index];
    };

    const pendingColumns = [
        {
            header: 'Employee',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-lg)',
                            background: getAvatarGradient(row.employeeName),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        {row.employeeName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{row.employeeName}</div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--gray-500)',
                            fontFamily: 'monospace',
                        }}>
                            {row.employeeCode}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Leave Type',
            render: (row) => getLeaveTypeBadge(row.leaveType),
        },
        {
            header: 'Duration',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                        {format(new Date(row.startDate), 'dd MMM')} - {format(new Date(row.endDate), 'dd MMM yyyy')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>
                        {row.totalDays} day{row.totalDays > 1 ? 's' : ''}
                    </div>
                </div>
            ),
        },
        {
            header: 'Reason',
            render: (row) => (
                <div style={{
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--gray-600)',
                }}>
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
            header: 'Actions',
            width: 160,
            align: 'center',
            render: (row) => (
                <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setViewModal({ open: true, leave: row })}
                        title="View Details"
                        style={{ borderRadius: 'var(--radius-lg)' }}
                    >
                        <HiOutlineEye size={16} />
                    </button>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(row.id)}
                        title="Approve"
                        disabled={processing}
                        style={{
                            borderRadius: 'var(--radius-lg)',
                            padding: '0.375rem 0.75rem',
                        }}
                    >
                        <HiOutlineCheck size={16} />
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setRejectModal({ open: true, leave: row })}
                        title="Reject"
                        disabled={processing}
                        style={{
                            borderRadius: 'var(--radius-lg)',
                            padding: '0.375rem 0.75rem',
                        }}
                    >
                        <HiOutlineXMark size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const allColumns = [
        ...pendingColumns.slice(0, -1),
        {
            header: 'Status',
            render: (row) => getStatusBadge(row.status),
        },
        {
            header: 'Reviewed By',
            render: (row) => (
                <span style={{ color: 'var(--gray-600)' }}>
                    {row.reviewedByName || '-'}
                </span>
            ),
        },
        {
            header: 'Actions',
            width: 80,
            align: 'center',
            render: (row) => (
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setViewModal({ open: true, leave: row })}
                    title="View Details"
                    style={{ borderRadius: 'var(--radius-lg)' }}
                >
                    <HiOutlineEye size={16} />
                </button>
            ),
        },
    ];

    const approvedCount = allLeaves.filter(l => l.status === 'APPROVED').length;
    const rejectedCount = allLeaves.filter(l => l.status === 'REJECTED').length;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Leave Approval</h1>
                    <p className="page-subtitle">Review and manage employee leave requests</p>
                </div>
            </div>

            {/* Stats Mini Cards */}
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
                    background: 'linear-gradient(135deg, var(--warning-50) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--warning-200)',
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-lg)',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--warning-600)',
                        boxShadow: 'var(--shadow-xs)',
                    }}>
                        <HiOutlineClock size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning-700)' }}>
                            {loading ? '-' : pendingLeaves.length}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--warning-600)' }}>Pending</div>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4) var(--space-5)',
                    background: 'white',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--gray-200)',
                    boxShadow: 'var(--shadow-xs)',
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--success-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--success-600)',
                    }}>
                        <HiOutlineCheckCircle size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                            {loading ? '-' : approvedCount}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Approved</div>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4) var(--space-5)',
                    background: 'white',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--gray-200)',
                    boxShadow: 'var(--shadow-xs)',
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--error-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--error-600)',
                    }}>
                        <HiOutlineXCircle size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                            {loading ? '-' : rejectedCount}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Rejected</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-1)',
                marginBottom: 'var(--space-6)',
                background: 'var(--gray-100)',
                padding: 'var(--space-1)',
                borderRadius: 'var(--radius-xl)',
                width: 'fit-content',
            }}>
                <button
                    onClick={() => setActiveTab('pending')}
                    style={{
                        padding: 'var(--space-2-5) var(--space-5)',
                        borderRadius: 'var(--radius-lg)',
                        border: 'none',
                        background: activeTab === 'pending' ? 'white' : 'transparent',
                        color: activeTab === 'pending' ? 'var(--primary-600)' : 'var(--gray-600)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: activeTab === 'pending' ? 'var(--shadow-sm)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                    }}
                >
                    <HiOutlineClock size={16} />
                    Pending
                    <span style={{
                        background: activeTab === 'pending' ? 'var(--warning-100)' : 'var(--gray-200)',
                        color: activeTab === 'pending' ? 'var(--warning-700)' : 'var(--gray-600)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                    }}>
                        {pendingLeaves.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    style={{
                        padding: 'var(--space-2-5) var(--space-5)',
                        borderRadius: 'var(--radius-lg)',
                        border: 'none',
                        background: activeTab === 'all' ? 'white' : 'transparent',
                        color: activeTab === 'all' ? 'var(--primary-600)' : 'var(--gray-600)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: activeTab === 'all' ? 'var(--shadow-sm)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                    }}
                >
                    <HiOutlineClipboardDocumentCheck size={16} />
                    All Requests
                    <span style={{
                        background: activeTab === 'all' ? 'var(--primary-100)' : 'var(--gray-200)',
                        color: activeTab === 'all' ? 'var(--primary-700)' : 'var(--gray-600)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                    }}>
                        {allLeaves.length}
                    </span>
                </button>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        {activeTab === 'pending' ? (
                            <>
                                <HiOutlineClock size={20} style={{ color: 'var(--warning-500)' }} />
                                Pending Requests
                            </>
                        ) : (
                            <>
                                <HiOutlineClipboardDocumentCheck size={20} style={{ color: 'var(--primary-500)' }} />
                                All Leave Requests
                            </>
                        )}
                    </h2>
                </div>
                <Table
                    columns={activeTab === 'pending' ? pendingColumns : allColumns}
                    data={activeTab === 'pending' ? pendingLeaves : allLeaves}
                    loading={loading}
                    emptyMessage={activeTab === 'pending' ? 'No pending leave requests' : 'No leave requests found'}
                    emptySubMessage={activeTab === 'pending' ? 'All caught up! There are no requests awaiting your approval.' : 'Leave requests will appear here once employees submit them.'}
                />
            </div>

            {/* View Modal */}
            <Modal
                isOpen={viewModal.open}
                onClose={() => setViewModal({ open: false, leave: null })}
                title="Leave Request Details"
                size="lg"
            >
                {viewModal.leave && (
                    <div>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-4)',
                            paddingBottom: 'var(--space-5)',
                            marginBottom: 'var(--space-5)',
                            borderBottom: '1px solid var(--gray-100)',
                        }}>
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 'var(--radius-xl)',
                                    background: getAvatarGradient(viewModal.leave.employeeName),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1.25rem',
                                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                {viewModal.leave.employeeName?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1.125rem' }}>
                                    {viewModal.leave.employeeName}
                                </h3>
                                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                    {viewModal.leave.employeeCode}
                                </p>
                            </div>
                            {getStatusBadge(viewModal.leave.status)}
                        </div>

                        {/* Details Grid */}
                        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                                <div style={{
                                    padding: 'var(--space-4)',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-lg)',
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 4 }}>Leave Type</div>
                                    <div>{getLeaveTypeBadge(viewModal.leave.leaveType)}</div>
                                </div>
                                <div style={{
                                    padding: 'var(--space-4)',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-lg)',
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 4 }}>Total Days</div>
                                    <div style={{ fontWeight: 700, color: 'var(--primary-600)', fontSize: '1.25rem' }}>
                                        {viewModal.leave.totalDays} day{viewModal.leave.totalDays > 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-4)',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-lg)',
                                }}>
                                    <HiOutlineCalendarDays size={20} style={{ color: 'var(--gray-400)' }} />
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 2 }}>Start Date</div>
                                        <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>
                                            {format(new Date(viewModal.leave.startDate), 'dd MMMM yyyy')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-4)',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-lg)',
                                }}>
                                    <HiOutlineCalendarDays size={20} style={{ color: 'var(--gray-400)' }} />
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 2 }}>End Date</div>
                                        <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>
                                            {format(new Date(viewModal.leave.endDate), 'dd MMMM yyyy')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>Reason</div>
                                <div style={{
                                    padding: 'var(--space-4)',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-lg)',
                                    minHeight: 60,
                                    color: viewModal.leave.reason ? 'var(--gray-700)' : 'var(--gray-400)',
                                    fontStyle: viewModal.leave.reason ? 'normal' : 'italic',
                                }}>
                                    {viewModal.leave.reason || 'No reason provided'}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 4 }}>Applied On</div>
                                    <div style={{ fontWeight: 500, color: 'var(--gray-700)' }}>
                                        {format(new Date(viewModal.leave.appliedAt), 'dd MMM yyyy, hh:mm a')}
                                    </div>
                                </div>
                                {viewModal.leave.reviewedAt && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 4 }}>Reviewed On</div>
                                        <div style={{ fontWeight: 500, color: 'var(--gray-700)' }}>
                                            {format(new Date(viewModal.leave.reviewedAt), 'dd MMM yyyy, hh:mm a')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {viewModal.leave.rejectionReason && (
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--error-600)', marginBottom: 'var(--space-2)' }}>
                                        Rejection Reason
                                    </div>
                                    <div style={{
                                        padding: 'var(--space-4)',
                                        background: 'var(--error-50)',
                                        borderRadius: 'var(--radius-lg)',
                                        color: 'var(--error-700)',
                                        border: '1px solid var(--error-200)',
                                    }}>
                                        {viewModal.leave.rejectionReason}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={rejectModal.open}
                onClose={() => {
                    setRejectModal({ open: false, leave: null });
                    setRejectionReason('');
                }}
                title="Reject Leave Request"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setRejectModal({ open: false, leave: null });
                                setRejectionReason('');
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleReject}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    Rejecting...
                                </>
                            ) : (
                                <>
                                    <HiOutlineXMark size={16} />
                                    Reject Request
                                </>
                            )}
                        </button>
                    </>
                }
            >
                {rejectModal.leave && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                margin: '0 auto var(--space-4)',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--error-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <HiOutlineExclamationTriangle size={28} style={{ color: 'var(--error-600)' }} />
                            </div>
                            <p style={{ color: 'var(--gray-600)' }}>
                                Are you sure you want to reject the leave request from <strong>{rejectModal.leave.employeeName}</strong>?
                            </p>
                        </div>

                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--gray-50)',
                            borderRadius: 'var(--radius-xl)',
                            marginBottom: 'var(--space-5)',
                            display: 'grid',
                            gap: 'var(--space-2)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-500)' }}>Type</span>
                                <span style={{ fontWeight: 600 }}>{rejectModal.leave.leaveType}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-500)' }}>Duration</span>
                                <span style={{ fontWeight: 600 }}>
                                    {format(new Date(rejectModal.leave.startDate), 'dd MMM')} - {format(new Date(rejectModal.leave.endDate), 'dd MMM')}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--gray-500)' }}>Days</span>
                                <span style={{ fontWeight: 600 }}>{rejectModal.leave.totalDays}</span>
                            </div>
                        </div>

                        <FormInput
                            label="Rejection Reason (Optional)"
                            name="rejectionReason"
                            type="textarea"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide a reason for rejection..."
                            rows={3}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LeaveApproval;
