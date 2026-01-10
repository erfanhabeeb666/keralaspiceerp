import api from './api';

export const leaveService = {
    // Employee: Apply for leave
    apply: async (leaveData) => {
        const response = await api.post('/employee/leaves/apply', leaveData);
        return response.data;
    },

    // Employee: Get my leaves
    getMyLeaves: async () => {
        const response = await api.get('/employee/leaves/my');
        return response.data;
    },

    // Employee: Cancel my leave
    cancel: async (leaveId) => {
        const response = await api.post(`/employee/leaves/${leaveId}/cancel`);
        return response.data;
    },

    // Employee: Get my leave balance
    getMyBalance: async () => {
        const response = await api.get('/employee/leave-balance');
        return response.data;
    },

    // Admin: Get all pending leaves
    getPending: async () => {
        const response = await api.get('/admin/leaves/pending');
        return response.data;
    },

    // Admin: Get all leaves
    getAll: async () => {
        const response = await api.get('/admin/leaves');
        return response.data;
    },

    // Admin: Get leave by ID
    getById: async (id) => {
        const response = await api.get(`/admin/leaves/${id}`);
        return response.data;
    },

    // Admin: Get leaves for specific employee
    getEmployeeLeaves: async (employeeId) => {
        const response = await api.get(`/admin/leaves/employee/${employeeId}`);
        return response.data;
    },

    // Admin: Approve leave
    approve: async (leaveId) => {
        const response = await api.post(`/admin/leaves/${leaveId}/approve`);
        return response.data;
    },

    // Admin: Reject leave
    reject: async (leaveId, rejectionReason = '') => {
        const response = await api.post(`/admin/leaves/${leaveId}/reject`, { rejectionReason });
        return response.data;
    },

    // Admin: Get employee leave balance
    getEmployeeBalance: async (employeeId) => {
        const response = await api.get(`/admin/leave-balance/employee/${employeeId}`);
        return response.data;
    },
};

export default leaveService;
