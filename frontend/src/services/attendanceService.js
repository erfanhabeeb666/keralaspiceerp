import api from './api';

export const attendanceService = {
    // Get my attendance (employee)
    getMyAttendance: async () => {
        const response = await api.get('/employee/attendance/my');
        return response.data;
    },

    // Get my attendance for date range
    getMyAttendanceRange: async (startDate, endDate) => {
        const response = await api.get('/employee/attendance/my/range', {
            params: { startDate, endDate },
        });
        return response.data;
    },

    // Get my attendance summary
    getMyAttendanceSummary: async (startDate, endDate) => {
        const response = await api.get('/employee/attendance/my/summary', {
            params: { startDate, endDate },
        });
        return response.data;
    },

    // Admin: Get attendance by date
    getByDate: async (date) => {
        const response = await api.get('/admin/attendance', { params: { date } });
        return response.data;
    },

    // Admin: Get employee attendance
    getEmployeeAttendance: async (employeeId, startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get(`/admin/attendance/employee/${employeeId}`, { params });
        return response.data;
    },

    // Admin: Get attendance summary for employee
    getEmployeeAttendanceSummary: async (employeeId, startDate, endDate) => {
        const response = await api.get(`/admin/attendance/employee/${employeeId}/summary`, {
            params: { startDate, endDate },
        });
        return response.data;
    },

    // Admin: Generate attendance (manual trigger)
    generateAttendance: async () => {
        const response = await api.post('/admin/attendance/generate');
        return response.data;
    },
};

export default attendanceService;
