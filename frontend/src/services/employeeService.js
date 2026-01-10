import api from './api';

const EMPLOYEE_BASE = '/admin/employees';

export const employeeService = {
    // Get all employees
    getAll: async () => {
        const response = await api.get(EMPLOYEE_BASE);
        return response.data;
    },

    // Get active employees
    getActive: async () => {
        const response = await api.get(`${EMPLOYEE_BASE}/active`);
        return response.data;
    },

    // Get employee by ID
    getById: async (id) => {
        const response = await api.get(`${EMPLOYEE_BASE}/${id}`);
        return response.data;
    },

    // Get employee by code
    getByCode: async (code) => {
        const response = await api.get(`${EMPLOYEE_BASE}/code/${code}`);
        return response.data;
    },

    // Search employees
    search: async (query) => {
        const response = await api.get(`${EMPLOYEE_BASE}/search`, { params: { query } });
        return response.data;
    },

    // Create employee
    create: async (employeeData) => {
        const response = await api.post(EMPLOYEE_BASE, employeeData);
        return response.data;
    },

    // Update employee
    update: async (id, employeeData) => {
        const response = await api.put(`${EMPLOYEE_BASE}/${id}`, employeeData);
        return response.data;
    },

    // Delete employee (soft delete)
    delete: async (id) => {
        const response = await api.delete(`${EMPLOYEE_BASE}/${id}`);
        return response.data;
    },

    // Permanent delete
    permanentDelete: async (id) => {
        const response = await api.delete(`${EMPLOYEE_BASE}/${id}/permanent`);
        return response.data;
    },
};

export default employeeService;
