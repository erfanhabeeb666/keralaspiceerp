package com.erfan.spiceerp.Services;

import com.erfan.spiceerp.Dto.AttendanceDto;
import com.erfan.spiceerp.Enums.AttendanceStatus;
import com.erfan.spiceerp.Enums.Status;
import com.erfan.spiceerp.Exception.ResourceNotFoundException;
import com.erfan.spiceerp.Models.Attendance;
import com.erfan.spiceerp.Models.Employee;
import com.erfan.spiceerp.Models.LeaveRequest;
import com.erfan.spiceerp.Repos.AttendanceRepository;
import com.erfan.spiceerp.Repos.EmployeeRepository;
import com.erfan.spiceerp.Repos.LeaveRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing attendance records.
 */
@Service
@Transactional
public class AttendanceService {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceService.class);

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveService leaveService;

    public AttendanceService(AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            LeaveRequestRepository leaveRequestRepository,
            LeaveService leaveService) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveService = leaveService;
    }

    /**
     * Generate daily attendance for all active employees.
     * Called by scheduler at 00:05 AM daily.
     */
    public void generateDailyAttendance() {
        LocalDate today = LocalDate.now();
        logger.info("Generating daily attendance for date: {}", today);

        List<Employee> activeEmployees = employeeRepository.findByStatus(Status.ACTIVE);
        int created = 0;
        int updated = 0;

        for (Employee employee : activeEmployees) {
            // Check if attendance already exists for today
            if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(employee.getId(), today)) {
                logger.debug("Attendance already exists for employee {} on {}", employee.getId(), today);
                continue;
            }

            // Check for approved leave for today
            List<LeaveRequest> approvedLeaves = leaveRequestRepository
                    .findApprovedLeavesForDate(employee.getId(), today);

            Attendance attendance;
            if (!approvedLeaves.isEmpty()) {
                // Employee is on approved leave
                LeaveRequest leaveRequest = approvedLeaves.get(0);
                attendance = Attendance.builder()
                        .employee(employee)
                        .attendanceDate(today)
                        .status(AttendanceStatus.LEAVE)
                        .leaveRequest(leaveRequest)
                        .build();

                // Deduct leave balance (only 1 day)
                leaveService.deductLeaveBalance(employee.getId(), leaveRequest.getLeaveType(), 1);
                updated++;
            } else {
                // Default attendance is PRESENT
                attendance = Attendance.builder()
                        .employee(employee)
                        .attendanceDate(today)
                        .status(AttendanceStatus.PRESENT)
                        .build();
                created++;
            }

            attendanceRepository.save(attendance);
        }

        logger.info("Daily attendance generated. Created: {}, On Leave: {}", created, updated);
    }

    /**
     * Get attendance for an employee.
     */
    @Transactional(readOnly = true)
    public List<AttendanceDto> getEmployeeAttendance(Long employeeId) {
        return attendanceRepository.findByEmployeeIdOrderByAttendanceDateDesc(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get attendance for an employee within a date range.
     */
    @Transactional(readOnly = true)
    public List<AttendanceDto> getEmployeeAttendance(Long employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByEmployeeIdAndDateRange(employeeId, startDate, endDate).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get attendance for a specific date (admin).
     */
    @Transactional(readOnly = true)
    public List<AttendanceDto> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get attendance for a specific date with pagination (admin).
     */
    @Transactional(readOnly = true)
    public Page<AttendanceDto> getAttendanceByDate(LocalDate date, Pageable pageable) {
        return attendanceRepository.findByAttendanceDate(date, pageable)
                .map(this::mapToDto);
    }

    /**
     * Get attendance by ID.
     */
    @Transactional(readOnly = true)
    public AttendanceDto getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));
        return mapToDto(attendance);
    }

    /**
     * Get attendance summary for an employee.
     */
    @Transactional(readOnly = true)
    public AttendanceSummary getAttendanceSummary(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Long presentCount = attendanceRepository.countByEmployeeIdAndStatusAndDateRange(
                employeeId, AttendanceStatus.PRESENT, startDate, endDate);
        Long leaveCount = attendanceRepository.countByEmployeeIdAndStatusAndDateRange(
                employeeId, AttendanceStatus.LEAVE, startDate, endDate);

        return new AttendanceSummary(presentCount, leaveCount);
    }

    /**
     * Update attendance to LEAVE for an approved leave (called when leave starts).
     */
    public void markAsLeave(Long employeeId, LocalDate date, LeaveRequest leaveRequest) {
        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, date)
                .orElse(null);

        if (attendance != null) {
            attendance.setStatus(AttendanceStatus.LEAVE);
            attendance.setLeaveRequest(leaveRequest);
            attendanceRepository.save(attendance);
            logger.info("Updated attendance to LEAVE for employee {} on {}", employeeId, date);
        }
    }

    /**
     * Map Attendance entity to DTO.
     */
    private AttendanceDto mapToDto(Attendance attendance) {
        return AttendanceDto.builder()
                .id(attendance.getId())
                .employeeId(attendance.getEmployee().getId())
                .employeeName(attendance.getEmployee().getName())
                .employeeCode(attendance.getEmployee().getEmployeeCode())
                .attendanceDate(attendance.getAttendanceDate())
                .status(attendance.getStatus())
                .leaveRequestId(attendance.getLeaveRequest() != null ? attendance.getLeaveRequest().getId() : null)
                .createdAt(attendance.getCreatedAt())
                .build();
    }

    /**
     * Inner class for attendance summary.
     */
    public record AttendanceSummary(Long presentDays, Long leaveDays) {
        public Long totalDays() {
            return presentDays + leaveDays;
        }
    }
}
