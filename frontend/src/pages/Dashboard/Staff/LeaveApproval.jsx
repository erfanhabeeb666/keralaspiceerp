import React, { useState, useEffect } from 'react';
import {
    HiOutlineCheck,
    HiOutlineXMark,
    HiOutlineEye,
    HiOutlineClipboardDocumentCheck,
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

    const pendingColumns = [
        {
            header: 'Employee',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{row.employeeName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{row.employeeCode}</div>
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
                    <div style={{ fontWeight: 500 }}>
                        {format(new Date(row.startDate), 'dd MMM')} - {format(new Date(row.endDate), 'dd MMM yyyy')}
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
            header: 'Actions',
            width: 150,
            align: 'center',
            render: (row) => (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setViewModal({ open: true, leave: row })}
                        title="View Details"
                    >
                        <HiOutlineEye size={16} />
                    </button>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(row.id)}
                        title="Approve"
                        disabled={processing}
                    >
                        <HiOutlineCheck size={16} />
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setRejectModal({ open: true, leave: row })}
                        title="Reject"
                        disabled={processing}
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
            render: (row) => row.reviewedByName || '-',
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
                >
                    <HiOutlineEye size={16} />
                </button>
            ),
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    <HiOutlineClipboardDocumentCheck size={28} style={{ marginRight: '0.5rem' }} />
                    Leave Approval
                </h1>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-5)' }}>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <HiOutlineClipboardDocumentCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{pendingLeaves.length}</div>
                        <div className="stat-label">Pending Requests</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending ({pendingLeaves.length})
                </button>
                <button
                    className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Requests ({allLeaves.length})
                </button>
            </div>

            {/* Table */}
            <div className="card">
                <Table
                    columns={activeTab === 'pending' ? pendingColumns : allColumns}
                    data={activeTab === 'pending' ? pendingLeaves : allLeaves}
                    loading={loading}
                    emptyMessage={activeTab === 'pending' ? 'No pending leave requests' : 'No leave requests found'}
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
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-4)',
                            paddingBottom: 'var(--space-4)',
                            borderBottom: '1px solid var(--gray-200)',
                        }}>
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1.125rem',
                                }}
                            >
                                {viewModal.leave.employeeName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 600 }}>{viewModal.leave.employeeName}</h3>
                                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{viewModal.leave.employeeCode}</p>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                {getStatusBadge(viewModal.leave.status)}
                            </div>
                        </div>

                        <div className="form-row">
                            <div>
                                <label className="form-label">Leave Type</label>
                                <p>{getLeaveTypeBadge(viewModal.leave.leaveType)}</p>
                            </div>
                            <div>
                                <label className="form-label">Total Days</label>
                                <p style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{viewModal.leave.totalDays} days</p>
                            </div>
                        </div>

                        <div className="form-row">
                            <div>
                                <label className="form-label">Start Date</label>
                                <p>{format(new Date(viewModal.leave.startDate), 'dd MMMM yyyy')}</p>
                            </div>
                            <div>
                                <label className="form-label">End Date</label>
                                <p>{format(new Date(viewModal.leave.endDate), 'dd MMMM yyyy')}</p>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Reason</label>
                            <p style={{
                                padding: 'var(--space-3)',
                                background: 'var(--gray-50)',
                                borderRadius: 'var(--radius-lg)',
                                minHeight: 60,
                            }}>
                                {viewModal.leave.reason || 'No reason provided'}
                            </p>
                        </div>

                        <div className="form-row">
                            <div>
                                <label className="form-label">Applied On</label>
                                <p>{format(new Date(viewModal.leave.appliedAt), 'dd MMM yyyy, hh:mm a')}</p>
                            </div>
                            {viewModal.leave.reviewedAt && (
                                <div>
                                    <label className="form-label">Reviewed On</label>
                                    <p>{format(new Date(viewModal.leave.reviewedAt), 'dd MMM yyyy, hh:mm a')}</p>
                                </div>
                            )}
                        </div>

                        {viewModal.leave.rejectionReason && (
                            <div>
                                <label className="form-label">Rejection Reason</label>
                                <p style={{
                                    padding: 'var(--space-3)',
                                    background: 'var(--error-50)',
                                    borderRadius: 'var(--radius-lg)',
                                    color: 'var(--error-700)',
                                }}>
                                    {viewModal.leave.rejectionReason}
                                </p>
                            </div>
                        )}
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
                            {processing ? 'Rejecting...' : 'Reject Request'}
                        </button>
                    </>
                }
            >
                {rejectModal.leave && (
                    <div>
                        <p style={{ marginBottom: 'var(--space-4)' }}>
                            Are you sure you want to reject the leave request from <strong>{rejectModal.leave.employeeName}</strong>?
                        </p>

                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--gray-50)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: 'var(--space-4)',
                        }}>
                            <div><strong>Type:</strong> {rejectModal.leave.leaveType}</div>
                            <div><strong>Duration:</strong> {rejectModal.leave.startDate} to {rejectModal.leave.endDate}</div>
                            <div><strong>Days:</strong> {rejectModal.leave.totalDays}</div>
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
