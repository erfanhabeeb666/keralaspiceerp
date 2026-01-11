import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineMagnifyingGlass,
    HiOutlineEye,
    HiOutlineUserGroup,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineBuildingOffice2,
    HiOutlineCalendarDays,
    HiOutlineExclamationTriangle,
    HiOutlineCheckCircle,
} from 'react-icons/hi2';
import Table from '../../../components/Table';
import Modal from '../../../components/Modal';
import { employeeService } from '../../../services/employeeService';
import toast from 'react-hot-toast';
import { useDebounce } from '../../../hooks/useDebounce';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });
    const [viewModal, setViewModal] = useState({ open: false, employee: null });
    const navigate = useNavigate();

    // Debounce the search query with 300ms delay
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        loadEmployees();
    }, []);

    // Effect for debounced search
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchQuery.length >= 2) {
                try {
                    const response = await employeeService.search(debouncedSearchQuery);
                    setEmployees(response.data || []);
                } catch (error) {
                    console.error('Search error:', error);
                }
            } else if (debouncedSearchQuery.length === 0) {
                loadEmployees();
            }
        };

        performSearch();
    }, [debouncedSearchQuery]);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeService.getAll();
            setEmployees(response.data || []);
        } catch (error) {
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    const handleDelete = async () => {
        try {
            await employeeService.delete(deleteModal.employee.id);
            toast.success('Employee deleted successfully');
            setDeleteModal({ open: false, employee: null });
            loadEmployees();
        } catch (error) {
            toast.error('Failed to delete employee');
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'ACTIVE') {
            return (
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <HiOutlineCheckCircle size={12} />
                    Active
                </span>
            );
        }
        return (
            <span className="badge badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Inactive
            </span>
        );
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

    const columns = [
        {
            header: 'Employee',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--radius-xl)',
                            background: getAvatarGradient(row.fullName),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem',
                            boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.15)',
                            flexShrink: 0,
                        }}
                    >
                        {row.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 2 }}>{row.fullName}</div>
                        <div style={{
                            fontSize: '0.8125rem',
                            color: 'var(--gray-500)',
                            fontFamily: 'monospace',
                            background: 'var(--gray-100)',
                            padding: '0.125rem 0.5rem',
                            borderRadius: 'var(--radius-md)',
                            display: 'inline-block',
                        }}>
                            {row.employeeCode}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Email',
            render: (row) => (
                <span style={{ color: 'var(--gray-600)' }}>{row.email}</span>
            ),
        },
        {
            header: 'Phone',
            render: (row) => (
                <span style={{ color: 'var(--gray-600)' }}>{row.phone || '-'}</span>
            ),
        },
        {
            header: 'Department',
            render: (row) => (
                <span style={{
                    color: row.department ? 'var(--gray-700)' : 'var(--gray-400)',
                    fontWeight: row.department ? 500 : 400,
                }}>
                    {row.department || '-'}
                </span>
            ),
        },
        {
            header: 'Joining Date',
            render: (row) => (
                <span style={{ color: 'var(--gray-600)' }}>
                    {row.joiningDate
                        ? new Date(row.joiningDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })
                        : '-'}
                </span>
            ),
        },
        {
            header: 'Status',
            render: (row) => getStatusBadge(row.status),
        },
        {
            header: 'Actions',
            width: 140,
            align: 'center',
            render: (row) => (
                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setViewModal({ open: true, employee: row })}
                        title="View"
                        style={{ borderRadius: 'var(--radius-lg)' }}
                    >
                        <HiOutlineEye size={16} />
                    </button>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/staff/edit/${row.id}`)}
                        title="Edit"
                        style={{ borderRadius: 'var(--radius-lg)' }}
                    >
                        <HiOutlinePencil size={16} />
                    </button>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteModal({ open: true, employee: row })}
                        title="Delete"
                        style={{
                            color: 'var(--error-600)',
                            borderRadius: 'var(--radius-lg)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error-50)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <HiOutlineTrash size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const activeCount = employees.filter(e => e.status === 'ACTIVE').length;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Employees</h1>
                    <p className="page-subtitle">Manage your team members and their details</p>
                </div>
                <div className="page-actions">
                    <Link to="/staff/create" className="btn btn-primary">
                        <HiOutlinePlus size={18} />
                        Add Employee
                    </Link>
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
                    background: 'white',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--gray-200)',
                    boxShadow: 'var(--shadow-xs)',
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--primary-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-600)',
                    }}>
                        <HiOutlineUserGroup size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                            {loading ? '-' : employees.length}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Total Employees</div>
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
                            {loading ? '-' : activeCount}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Active</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ position: 'relative', maxWidth: 400 }}>
                        <HiOutlineMagnifyingGlass
                            size={18}
                            style={{
                                position: 'absolute',
                                left: 'var(--space-4)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: searchFocused ? 'var(--primary-500)' : 'var(--gray-400)',
                                transition: 'color 0.15s ease',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search by name or employee code..."
                            value={searchQuery}
                            onChange={handleSearch}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            style={{
                                width: '100%',
                                padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-11)',
                                fontSize: '0.9375rem',
                                background: searchFocused ? 'white' : 'var(--gray-50)',
                                border: `1.5px solid ${searchFocused ? 'var(--primary-400)' : 'var(--gray-200)'}`,
                                borderRadius: 'var(--radius-xl)',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxShadow: searchFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        <HiOutlineUserGroup size={20} style={{ color: 'var(--primary-500)' }} />
                        Employee Directory
                    </h2>
                    <span className="badge badge-info">{employees.length} employees</span>
                </div>
                <Table
                    columns={columns}
                    data={employees}
                    loading={loading}
                    emptyMessage="No employees found"
                    emptySubMessage="Add your first employee to get started"
                />
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, employee: null })}
                title="Delete Employee"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setDeleteModal({ open: false, employee: null })}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleDelete}
                        >
                            <HiOutlineTrash size={16} />
                            Delete
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
                        <HiOutlineExclamationTriangle size={32} style={{ color: 'var(--error-600)' }} />
                    </div>
                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
                        Are you sure you want to delete <strong>{deleteModal.employee?.fullName}</strong>?
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        This action will set the employee status to inactive.
                    </p>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={viewModal.open}
                onClose={() => setViewModal({ open: false, employee: null })}
                title="Employee Details"
                size="lg"
            >
                {viewModal.employee && (
                    <div>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-5)',
                            marginBottom: 'var(--space-6)',
                            paddingBottom: 'var(--space-5)',
                            borderBottom: '1px solid var(--gray-100)',
                        }}>
                            <div
                                style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: 'var(--radius-2xl)',
                                    background: getAvatarGradient(viewModal.employee.fullName),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1.75rem',
                                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                {viewModal.employee.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: 'var(--gray-900)',
                                    marginBottom: 'var(--space-1)',
                                    letterSpacing: '-0.02em',
                                }}>
                                    {viewModal.employee.fullName}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <span style={{
                                        fontFamily: 'monospace',
                                        background: 'var(--gray-100)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.875rem',
                                    }}>
                                        {viewModal.employee.employeeCode}
                                    </span>
                                    {getStatusBadge(viewModal.employee.status)}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 'var(--space-4)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-4)',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-lg)',
                                }}>
                                    <HiOutlineEnvelope size={20} style={{ color: 'var(--gray-400)' }} />
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 2 }}>Email</div>
                                        <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{viewModal.employee.email}</div>
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
                                    <HiOutlinePhone size={20} style={{ color: 'var(--gray-400)' }} />
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 2 }}>Phone</div>
                                        <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{viewModal.employee.phone || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 'var(--space-4)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-4)',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-lg)',
                                }}>
                                    <HiOutlineBuildingOffice2 size={20} style={{ color: 'var(--gray-400)' }} />
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 2 }}>Department</div>
                                        <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{viewModal.employee.department || '-'}</div>
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
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: 2 }}>Joining Date</div>
                                        <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>
                                            {viewModal.employee.joiningDate
                                                ? new Date(viewModal.employee.joiningDate).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                                : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmployeeList;
