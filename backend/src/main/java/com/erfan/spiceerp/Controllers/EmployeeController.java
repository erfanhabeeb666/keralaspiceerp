package com.erfan.spiceerp.Controllers;

import com.erfan.spiceerp.Dto.*;
import com.erfan.spiceerp.Enums.LeaveType;
import com.erfan.spiceerp.Security.JwtService;
import com.erfan.spiceerp.Security.JwtUtils;
import com.erfan.spiceerp.Services.AttendanceService;
import com.erfan.spiceerp.Services.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Employee Controller for employee-specific operations.
 * Employees can only access their own data.
 */
@RestController
@RequestMapping("/employee")
@Tag(name = "Employee - Self Service", description = "Employee APIs for leave and attendance")
@PreAuthorize("hasAnyAuthority('Employee', 'ADMIN')")
public class EmployeeController {

    private final LeaveService leaveService;
    private final AttendanceService attendanceService;
    private final JwtService jwtService;
    private final JwtUtils jwtUtils;

    public EmployeeController(LeaveService leaveService,
            AttendanceService attendanceService,
            JwtService jwtService,
            JwtUtils jwtUtils) {
        this.leaveService = leaveService;
        this.attendanceService = attendanceService;
        this.jwtService = jwtService;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Helper method to extract current user's ID from JWT.
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        String token = jwtUtils.getJwtFromRequest(request);
        return Long.parseLong(jwtService.extractId(token));
    }

    // ==================== LEAVE MANAGEMENT ====================

    @PostMapping("/leaves/apply")
    @Operation(summary = "Apply for leave")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> applyLeave(
            @Valid @RequestBody LeaveRequestDto leaveRequestDto,
            HttpServletRequest request) {
        Long employeeId = getCurrentUserId(request);
        LeaveRequestDto applied = leaveService.applyLeave(employeeId, leaveRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave application submitted successfully", applied));
    }

    @GetMapping("/leaves/my")
    @Operation(summary = "Get my leave history")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getMyLeaves(HttpServletRequest request) {
        Long employeeId = getCurrentUserId(request);
        List<LeaveRequestDto> leaves = leaveService.getLeaveRequestsByEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @GetMapping("/leaves/{id}")
    @Operation(summary = "Get leave request by ID")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> getLeaveById(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long employeeId = getCurrentUserId(request);
        LeaveRequestDto leave = leaveService.getLeaveRequestById(id);

        // Verify ownership (unless admin)
        if (!leave.getEmployeeId().equals(employeeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only view your own leave requests"));
        }

        return ResponseEntity.ok(ApiResponse.success(leave));
    }

    @PostMapping("/leaves/{id}/cancel")
    @Operation(summary = "Cancel a leave request")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> cancelLeave(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long employeeId = getCurrentUserId(request);
        LeaveRequestDto cancelled = leaveService.cancelLeave(id, employeeId);
        return ResponseEntity.ok(ApiResponse.success("Leave request cancelled", cancelled));
    }

    // ==================== LEAVE BALANCE ====================

    @GetMapping("/leave-balance")
    @Operation(summary = "Get my leave balances")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDto>>> getMyLeaveBalance(HttpServletRequest request) {
        Long employeeId = getCurrentUserId(request);
        List<LeaveBalanceDto> balances = leaveService.getLeaveBalances(employeeId);
        return ResponseEntity.ok(ApiResponse.success(balances));
    }

    @GetMapping("/leave-balance/{leaveType}")
    @Operation(summary = "Get specific leave type balance")
    public ResponseEntity<ApiResponse<LeaveBalanceDto>> getLeaveBalance(
            @PathVariable LeaveType leaveType,
            HttpServletRequest request) {
        Long employeeId = getCurrentUserId(request);
        LeaveBalanceDto balance = leaveService.getLeaveBalance(employeeId, leaveType);
        return ResponseEntity.ok(ApiResponse.success(balance));
    }

    // ==================== ATTENDANCE ====================

    @GetMapping("/attendance/my")
    @Operation(summary = "Get my attendance history")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getMyAttendance(HttpServletRequest request) {
        Long employeeId = getCurrentUserId(request);
        List<AttendanceDto> attendance = attendanceService.getEmployeeAttendance(employeeId);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @GetMapping("/attendance/my/range")
    @Operation(summary = "Get my attendance for a date range")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getMyAttendanceRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        Long employeeId = getCurrentUserId(request);
        List<AttendanceDto> attendance = attendanceService.getEmployeeAttendance(employeeId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @GetMapping("/attendance/my/summary")
    @Operation(summary = "Get my attendance summary")
    public ResponseEntity<ApiResponse<AttendanceService.AttendanceSummary>> getMyAttendanceSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        Long employeeId = getCurrentUserId(request);
        AttendanceService.AttendanceSummary summary = attendanceService.getAttendanceSummary(employeeId, startDate,
                endDate);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
