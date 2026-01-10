package com.erfan.spiceerp.Controllers;

import com.erfan.spiceerp.Dto.*;
import com.erfan.spiceerp.Enums.Status;
import com.erfan.spiceerp.Scheduler.AttendanceScheduler;
import com.erfan.spiceerp.Security.JwtService;
import com.erfan.spiceerp.Security.JwtUtils;
import com.erfan.spiceerp.Services.AttendanceService;
import com.erfan.spiceerp.Services.EmployeeService;
import com.erfan.spiceerp.Services.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Admin Controller for employee management operations.
 * All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/admin")
@Tag(name = "Admin - Employee Management", description = "Admin APIs for managing employees, attendance, and leaves")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final EmployeeService employeeService;
    private final LeaveService leaveService;
    private final AttendanceService attendanceService;
    private final AttendanceScheduler attendanceScheduler;
    private final JwtService jwtService;
    private final JwtUtils jwtUtils;

    public AdminController(EmployeeService employeeService,
            LeaveService leaveService,
            AttendanceService attendanceService,
            AttendanceScheduler attendanceScheduler,
            JwtService jwtService,
            JwtUtils jwtUtils) {
        this.employeeService = employeeService;
        this.leaveService = leaveService;
        this.attendanceService = attendanceService;
        this.attendanceScheduler = attendanceScheduler;
        this.jwtService = jwtService;
        this.jwtUtils = jwtUtils;
    }

    // ==================== EMPLOYEE CRUD ====================

    @PostMapping("/employees")
    @Operation(summary = "Create a new employee")
    public ResponseEntity<ApiResponse<EmployeeDto>> createEmployee(
            @Valid @RequestBody EmployeeDto employeeDto) {
        EmployeeDto created = employeeService.createEmployee(employeeDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", created));
    }

    @GetMapping("/employees")
    @Operation(summary = "Get all employees")
    public ResponseEntity<ApiResponse<List<EmployeeDto>>> getAllEmployees() {
        List<EmployeeDto> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/employees/active")
    @Operation(summary = "Get all active employees")
    public ResponseEntity<ApiResponse<List<EmployeeDto>>> getActiveEmployees() {
        List<EmployeeDto> employees = employeeService.getAllActiveEmployees();
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/employees/paginated")
    @Operation(summary = "Get employees with pagination")
    public ResponseEntity<ApiResponse<Page<EmployeeDto>>> getEmployeesPaginated(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<EmployeeDto> employees = employeeService.getEmployees(pageable);
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/employees/status/{status}")
    @Operation(summary = "Get employees by status with pagination")
    public ResponseEntity<ApiResponse<Page<EmployeeDto>>> getEmployeesByStatus(
            @PathVariable Status status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<EmployeeDto> employees = employeeService.getEmployeesByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/employees/search")
    @Operation(summary = "Search employees by name or code")
    public ResponseEntity<ApiResponse<List<EmployeeDto>>> searchEmployees(
            @RequestParam String query) {
        List<EmployeeDto> employees = employeeService.searchEmployees(query);
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/employees/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<ApiResponse<EmployeeDto>> getEmployeeById(@PathVariable Long id) {
        EmployeeDto employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    @GetMapping("/employees/code/{employeeCode}")
    @Operation(summary = "Get employee by employee code")
    public ResponseEntity<ApiResponse<EmployeeDto>> getEmployeeByCode(
            @PathVariable String employeeCode) {
        EmployeeDto employee = employeeService.getEmployeeByCode(employeeCode);
        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    @PutMapping("/employees/{id}")
    @Operation(summary = "Update an employee")
    public ResponseEntity<ApiResponse<EmployeeDto>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeDto employeeDto) {
        EmployeeDto updated = employeeService.updateEmployee(id, employeeDto);
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", updated));
    }

    @DeleteMapping("/employees/{id}")
    @Operation(summary = "Delete an employee (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }

    @DeleteMapping("/employees/{id}/permanent")
    @Operation(summary = "Permanently delete an employee")
    public ResponseEntity<ApiResponse<Void>> hardDeleteEmployee(@PathVariable Long id) {
        employeeService.hardDeleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee permanently deleted", null));
    }

    // ==================== LEAVE MANAGEMENT ====================

    @GetMapping("/leaves/pending")
    @Operation(summary = "Get all pending leave requests")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getPendingLeaves() {
        List<LeaveRequestDto> leaves = leaveService.getPendingLeaveRequests();
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @GetMapping("/leaves/pending/paginated")
    @Operation(summary = "Get pending leave requests with pagination")
    public ResponseEntity<ApiResponse<Page<LeaveRequestDto>>> getPendingLeavesPaginated(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<LeaveRequestDto> leaves = leaveService.getPendingLeaveRequests(pageable);
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @GetMapping("/leaves")
    @Operation(summary = "Get all leave requests")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getAllLeaves() {
        List<LeaveRequestDto> leaves = leaveService.getAllLeaveRequests();
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @GetMapping("/leaves/{id}")
    @Operation(summary = "Get leave request by ID")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> getLeaveById(@PathVariable Long id) {
        LeaveRequestDto leave = leaveService.getLeaveRequestById(id);
        return ResponseEntity.ok(ApiResponse.success(leave));
    }

    @GetMapping("/leaves/employee/{employeeId}")
    @Operation(summary = "Get leave requests for a specific employee")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getEmployeeLeaves(
            @PathVariable Long employeeId) {
        List<LeaveRequestDto> leaves = leaveService.getLeaveRequestsByEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @PostMapping("/leaves/{id}/approve")
    @Operation(summary = "Approve a leave request")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> approveLeave(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long adminId = Long.parseLong(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
        LeaveRequestDto approved = leaveService.approveLeave(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Leave request approved", approved));
    }

    @PostMapping("/leaves/{id}/reject")
    @Operation(summary = "Reject a leave request")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> rejectLeave(
            @PathVariable Long id,
            @RequestBody(required = false) LeaveApprovalDto approvalDto,
            HttpServletRequest request) {
        Long adminId = Long.parseLong(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
        String reason = approvalDto != null ? approvalDto.getRejectionReason() : null;
        LeaveRequestDto rejected = leaveService.rejectLeave(id, adminId, reason);
        return ResponseEntity.ok(ApiResponse.success("Leave request rejected", rejected));
    }

    // ==================== ATTENDANCE MANAGEMENT ====================

    @GetMapping("/attendance")
    @Operation(summary = "Get attendance for a specific date")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendanceByDate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<AttendanceDto> attendance = attendanceService.getAttendanceByDate(targetDate);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @GetMapping("/attendance/paginated")
    @Operation(summary = "Get attendance for a specific date with pagination")
    public ResponseEntity<ApiResponse<Page<AttendanceDto>>> getAttendanceByDatePaginated(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PageableDefault(size = 20) Pageable pageable) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        Page<AttendanceDto> attendance = attendanceService.getAttendanceByDate(targetDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @GetMapping("/attendance/employee/{employeeId}")
    @Operation(summary = "Get attendance for a specific employee")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getEmployeeAttendance(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceDto> attendance;
        if (startDate != null && endDate != null) {
            attendance = attendanceService.getEmployeeAttendance(employeeId, startDate, endDate);
        } else {
            attendance = attendanceService.getEmployeeAttendance(employeeId);
        }
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @GetMapping("/attendance/employee/{employeeId}/summary")
    @Operation(summary = "Get attendance summary for an employee")
    public ResponseEntity<ApiResponse<AttendanceService.AttendanceSummary>> getAttendanceSummary(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        AttendanceService.AttendanceSummary summary = attendanceService.getAttendanceSummary(employeeId, startDate,
                endDate);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/attendance/generate")
    @Operation(summary = "Manually trigger attendance generation for today")
    public ResponseEntity<ApiResponse<String>> generateAttendance() {
        attendanceScheduler.triggerAttendanceGeneration();
        return ResponseEntity.ok(ApiResponse.success("Attendance generation triggered",
                "Attendance generated for " + LocalDate.now()));
    }

    // ==================== LEAVE BALANCE MANAGEMENT ====================

    @GetMapping("/leave-balance/employee/{employeeId}")
    @Operation(summary = "Get leave balances for an employee")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDto>>> getEmployeeLeaveBalance(
            @PathVariable Long employeeId) {
        List<LeaveBalanceDto> balances = leaveService.getLeaveBalances(employeeId);
        return ResponseEntity.ok(ApiResponse.success(balances));
    }
}
