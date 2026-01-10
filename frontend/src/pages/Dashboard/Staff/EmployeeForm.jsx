import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormInput from '../../../components/FormInput';
import { employeeService } from '../../../services/employeeService';
import { useForm } from '../../../hooks/useFetch';
import toast from 'react-hot-toast';

const validateEmployee = (values) => {
    const errors = {};

    if (!values.employeeCode?.trim()) {
        errors.employeeCode = 'Employee code is required';
    }

    if (!values.fullName?.trim()) {
        errors.fullName = 'Full name is required';
    }

    if (!values.email?.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Invalid email format';
    }

    if (!values.joiningDate) {
        errors.joiningDate = 'Joining date is required';
    }

    if (values.phone && !/^\d{10}$/.test(values.phone.replace(/\D/g, ''))) {
        errors.phone = 'Phone must be 10 digits';
    }

    return errors;
};

const EmployeeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEdit);

    const initialState = {
        employeeCode: '',
        fullName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        joiningDate: '',
        status: 'ACTIVE',
        password: '',
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setValues,
        validateForm,
    } = useForm(initialState, validateEmployee);

    useEffect(() => {
        if (isEdit) {
            loadEmployee();
        }
    }, [id]);

    const loadEmployee = async () => {
        try {
            const response = await employeeService.getById(id);
            const employee = response.data;
            setValues({
                employeeCode: employee.employeeCode || '',
                fullName: employee.fullName || '',
                email: employee.email || '',
                phone: employee.phone || '',
                department: employee.department || '',
                designation: employee.designation || '',
                joiningDate: employee.joiningDate || '',
                status: employee.status || 'ACTIVE',
                password: '',
            });
        } catch (error) {
            toast.error('Failed to load employee details');
            navigate('/staff');
        } finally {
            setPageLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        setLoading(true);
        try {
            const payload = { ...values };
            if (!payload.password) {
                delete payload.password;
            }

            if (isEdit) {
                await employeeService.update(id, payload);
                toast.success('Employee updated successfully');
            } else {
                await employeeService.create(payload);
                toast.success('Employee created successfully');
            }
            navigate('/staff');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to save employee';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="page-container">
                <div className="loading-overlay">
                    <div className="spinner spinner-lg" />
                    <span style={{ color: 'var(--gray-500)' }}>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <FormInput
                                label="Employee Code"
                                name="employeeCode"
                                value={values.employeeCode}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.employeeCode}
                                touched={touched.employeeCode}
                                required
                                placeholder="e.g., EMP001"
                                disabled={isEdit}
                            />
                            <FormInput
                                label="Full Name"
                                name="fullName"
                                value={values.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.fullName}
                                touched={touched.fullName}
                                required
                                placeholder="Enter full name"
                            />
                        </div>

                        <div className="form-row">
                            <FormInput
                                label="Email"
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.email}
                                touched={touched.email}
                                required
                                placeholder="employee@company.com"
                                disabled={isEdit}
                            />
                            <FormInput
                                label="Phone"
                                name="phone"
                                value={values.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.phone}
                                touched={touched.phone}
                                placeholder="10-digit phone number"
                            />
                        </div>

                        <div className="form-row">
                            <FormInput
                                label="Department"
                                name="department"
                                value={values.department}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="e.g., Engineering"
                            />
                            <FormInput
                                label="Designation"
                                name="designation"
                                value={values.designation}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="e.g., Software Engineer"
                            />
                        </div>

                        <div className="form-row">
                            <FormInput
                                label="Joining Date"
                                name="joiningDate"
                                type="date"
                                value={values.joiningDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.joiningDate}
                                touched={touched.joiningDate}
                                required
                            />
                            <FormInput
                                label="Status"
                                name="status"
                                type="select"
                                value={values.status}
                                onChange={handleChange}
                                options={[
                                    { value: 'ACTIVE', label: 'Active' },
                                    { value: 'INACTIVE', label: 'Inactive' },
                                ]}
                            />
                        </div>

                        <div className="form-row">
                            <FormInput
                                label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
                                name="password"
                                type="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={isEdit ? '••••••••' : 'Min 6 characters'}
                                required={!isEdit}
                            />
                            <div /> {/* Empty div for grid alignment */}
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: 'var(--space-3)',
                            marginTop: 'var(--space-6)',
                            paddingTop: 'var(--space-6)',
                            borderTop: '1px solid var(--gray-200)',
                        }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/staff')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                        Saving...
                                    </span>
                                ) : (
                                    isEdit ? 'Update Employee' : 'Create Employee'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeForm;
