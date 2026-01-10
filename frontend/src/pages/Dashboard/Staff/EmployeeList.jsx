import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineMagnifyingGlass,
    HiOutlineEye,
} from 'react-icons/hi2';
import Table from '../../../components/Table';
import Modal from '../../../components/Modal';
import { employeeService } from '../../../services/employeeService';
import toast from 'react-hot-toast';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });
    const [viewModal, setViewModal] = useState({ open: false, employee: null });
    const navigate = useNavigate();

    useEffect(() => {
        loadEmployees();
    }, []);

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

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length >= 2) {
            try {
                const response = await employeeService.search(query);
                setEmployees(response.data || []);
            } catch (error) {
                console.error('Search error:', error);
            }
        } else if (query.length === 0) {
            loadEmployees();
        }
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
        const classes = status === 'ACTIVE' ? 'badge-success' : 'badge-gray';
        return <span className={`badge ${classes}`}>{status?.toLowerCase()}</span>;
    };

    const columns = [
        {
            header: 'Employee',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                        }}
                    >
                        {row.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{row.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{row.employeeCode}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Email',
            accessor: 'email',
        },
        {
            header: 'Phone',
            accessor: 'phone',
            render: (row) => row.phone || '-',
        },
        {
            header: 'Department',
            accessor: 'department',
            render: (row) => row.department || '-',
        },
        {
            header: 'Joining Date',
            render: (row) => row.joiningDate
                ? new Date(row.joiningDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                })
                : '-',
        },
        {
            header: 'Status',
            render: (row) => getStatusBadge(row.status),
        },
        {
            header: 'Actions',
            width: 120,
            align: 'center',
            render: (row) => (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setViewModal({ open: true, employee: row })}
                        title="View"
                    >
                        <HiOutlineEye size={16} />
                    </button>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/staff/edit/${row.id}`)}
                        title="Edit"
                    >
                        <HiOutlinePencil size={16} />
                    </button>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteModal({ open: true, employee: row })}
                        title="Delete"
                        style={{ color: 'var(--error-600)' }}
                    >
                        <HiOutlineTrash size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Employees</h1>
                <div className="page-actions">
                    <Link to="/staff/create" className="btn btn-primary">
                        <HiOutlinePlus size={18} />
                        Add Employee
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                    <div className="search-input-wrapper">
                        <HiOutlineMagnifyingGlass className="search-input-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or employee code..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="form-input search-input"
                            style={{ maxWidth: 400 }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <Table
                    columns={columns}
                    data={employees}
                    loading={loading}
                    emptyMessage="No employees found"
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
                            Delete
                        </button>
                    </>
                }
            >
                <p>
                    Are you sure you want to delete <strong>{deleteModal.employee?.fullName}</strong>?
                    This action will set the employee status to inactive.
                </p>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={viewModal.open}
                onClose={() => setViewModal({ open: false, employee: null })}
                title="Employee Details"
                size="lg"
            >
                {viewModal.employee && (
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1.5rem',
                                }}
                            >
                                {viewModal.employee.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{viewModal.employee.fullName}</h3>
                                <p style={{ color: 'var(--gray-500)' }}>{viewModal.employee.employeeCode}</p>
                            </div>
                        </div>

                        <div className="form-row">
                            <div>
                                <label className="form-label">Email</label>
                                <p style={{ color: 'var(--gray-700)' }}>{viewModal.employee.email}</p>
                            </div>
                            <div>
                                <label className="form-label">Phone</label>
                                <p style={{ color: 'var(--gray-700)' }}>{viewModal.employee.phone || '-'}</p>
                            </div>
                        </div>

                        <div className="form-row">
                            <div>
                                <label className="form-label">Department</label>
                                <p style={{ color: 'var(--gray-700)' }}>{viewModal.employee.department || '-'}</p>
                            </div>
                            <div>
                                <label className="form-label">Designation</label>
                                <p style={{ color: 'var(--gray-700)' }}>{viewModal.employee.designation || '-'}</p>
                            </div>
                        </div>

                        <div className="form-row">
                            <div>
                                <label className="form-label">Joining Date</label>
                                <p style={{ color: 'var(--gray-700)' }}>
                                    {viewModal.employee.joiningDate
                                        ? new Date(viewModal.employee.joiningDate).toLocaleDateString('en-IN')
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="form-label">Status</label>
                                <p>{getStatusBadge(viewModal.employee.status)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmployeeList;
