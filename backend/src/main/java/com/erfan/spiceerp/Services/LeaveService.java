package com.erfan.spiceerp.Services;

import com.erfan.spiceerp.Dto.LeaveBalanceDto;
import com.erfan.spiceerp.Dto.LeaveRequestDto;
import com.erfan.spiceerp.Enums.LeaveStatus;
import com.erfan.spiceerp.Enums.LeaveType;
import com.erfan.spiceerp.Exception.BusinessException;
import com.erfan.spiceerp.Exception.InsufficientBalanceException;
import com.erfan.spiceerp.Exception.ResourceNotFoundException;
import com.erfan.spiceerp.Exception.UnauthorizedException;
import com.erfan.spiceerp.Models.Employee;
import com.erfan.spiceerp.Models.LeaveBalance;
import com.erfan.spiceerp.Models.LeaveRequest;
import com.erfan.spiceerp.Models.User;
import com.erfan.spiceerp.Repos.EmployeeRepository;
import com.erfan.spiceerp.Repos.LeaveBalanceRepository;
import com.erfan.spiceerp.Repos.LeaveRequestRepository;
import com.erfan.spiceerp.Repos.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing leave requests and leave balances.
 */
@Service
@Transactional
public class LeaveService {

    private static final Logger logger = LoggerFactory.getLogger(LeaveService.class);

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    /**
     * Apply for leave (by employee).
     */
    public LeaveRequestDto applyLeave(Long employeeId, LeaveRequestDto leaveRequestDto) {
        logger.info("Employee {} applying for leave from {} to {}",
                employeeId, leaveRequestDto.getStartDate(), leaveRequestDto.getEndDate());

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        // Validate dates
        validateLeaveDates(leaveRequestDto.getStartDate(), leaveRequestDto.getEndDate());

        // Check for overlapping approved leaves
        if (leaveRequestRepository.hasOverlappingApprovedLeave(
                employeeId, leaveRequestDto.getStartDate(), leaveRequestDto.getEndDate(), null)) {
            throw new BusinessException("Leave request overlaps with another approved leave");
        }

        int totalDays = calculateLeaveDays(leaveRequestDto.getStartDate(), leaveRequestDto.getEndDate());
        int currentYear = Year.now().getValue();

        // Check leave balance (except for LOP)
        if (leaveRequestDto.getLeaveType() != LeaveType.LOP) {
            LeaveBalance balance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeAndYear(employeeId, leaveRequestDto.getLeaveType(), currentYear)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Leave balance not found for " + leaveRequestDto.getLeaveType()));

            if (balance.getRemaining() < totalDays) {
                throw new InsufficientBalanceException(
                        leaveRequestDto.getLeaveType().name(), totalDays, balance.getRemaining());
            }
        }

        // Create leave request
        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveRequestDto.getLeaveType())
                .startDate(leaveRequestDto.getStartDate())
                .endDate(leaveRequestDto.getEndDate())
                .totalDays(totalDays)
                .reason(leaveRequestDto.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        logger.info("Leave request created with ID: {}", savedRequest.getId());

        return mapToDto(savedRequest);
    }

    /**
     * Approve leave request (by admin).
     */
    public LeaveRequestDto approveLeave(Long leaveRequestId, Long adminId) {
        logger.info("Admin {} approving leave request {}", adminId, leaveRequestId);

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveRequestId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("Only pending leave requests can be approved");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        // Check for overlapping approved leaves again (in case another was approved
        // meantime)
        if (leaveRequestRepository.hasOverlappingApprovedLeave(
                leaveRequest.getEmployee().getId(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequestId)) {
            throw new BusinessException("This leave overlaps with another approved leave");
        }

        leaveRequest.setStatus(LeaveStatus.APPROVED);
        leaveRequest.setReviewedBy(admin);
        leaveRequest.setReviewedAt(LocalDateTime.now());

        LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);
        logger.info("Leave request {} approved by admin {}", leaveRequestId, adminId);

        return mapToDto(updatedRequest);
    }

    /**
     * Reject leave request (by admin).
     */
    public LeaveRequestDto rejectLeave(Long leaveRequestId, Long adminId, String rejectionReason) {
        logger.info("Admin {} rejecting leave request {}", adminId, leaveRequestId);

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveRequestId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("Only pending leave requests can be rejected");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        leaveRequest.setReviewedBy(admin);
        leaveRequest.setReviewedAt(LocalDateTime.now());
        leaveRequest.setRejectionReason(rejectionReason);

        LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);
        logger.info("Leave request {} rejected by admin {}", leaveRequestId, adminId);

        return mapToDto(updatedRequest);
    }

    /**
     * Cancel leave request (by employee).
     * Only allowed if leave hasn't started yet.
     */
    public LeaveRequestDto cancelLeave(Long leaveRequestId, Long employeeId) {
        logger.info("Employee {} cancelling leave request {}", employeeId, leaveRequestId);

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveRequestId));

        // Verify the employee owns this leave request
        if (!leaveRequest.getEmployee().getId().equals(employeeId)) {
            throw new UnauthorizedException("You can only cancel your own leave requests");
        }

        // Cannot cancel if already cancelled or rejected
        if (leaveRequest.getStatus() == LeaveStatus.CANCELLED ||
                leaveRequest.getStatus() == LeaveStatus.REJECTED) {
            throw new BusinessException("Leave request is already " + leaveRequest.getStatus().name().toLowerCase());
        }

        // Cannot cancel if leave has already started
        if (LocalDate.now().isAfter(leaveRequest.getStartDate()) ||
                LocalDate.now().isEqual(leaveRequest.getStartDate())) {
            throw new BusinessException("Cannot cancel leave that has already started or started today");
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);

        LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);
        logger.info("Leave request {} cancelled by employee {}", leaveRequestId, employeeId);

        return mapToDto(updatedRequest);
    }

    /**
     * Get leave request by ID.
     */
    @Transactional(readOnly = true)
    public LeaveRequestDto getLeaveRequestById(Long id) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));
        return mapToDto(leaveRequest);
    }

    /**
     * Get all leave requests for an employee.
     */
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getLeaveRequestsByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByAppliedAtDesc(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all pending leave requests (for admin).
     */
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatusOrderByAppliedAtAsc(LeaveStatus.PENDING).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all pending leave requests with pagination.
     */
    @Transactional(readOnly = true)
    public Page<LeaveRequestDto> getPendingLeaveRequests(Pageable pageable) {
        return leaveRequestRepository.findByStatus(LeaveStatus.PENDING, pageable)
                .map(this::mapToDto);
    }

    /**
     * Get all leave requests (for admin).
     */
    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get leave balances for an employee.
     */
    @Transactional(readOnly = true)
    public List<LeaveBalanceDto> getLeaveBalances(Long employeeId) {
        int currentYear = Year.now().getValue();
        return leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, currentYear).stream()
                .map(this::mapBalanceToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get leave balance for specific leave type.
     */
    @Transactional(readOnly = true)
    public LeaveBalanceDto getLeaveBalance(Long employeeId, LeaveType leaveType) {
        int currentYear = Year.now().getValue();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndYear(employeeId, leaveType, currentYear)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveBalance", "leaveType", leaveType));
        return mapBalanceToDto(balance);
    }

    /**
     * Deduct leave balance for a specific day (called by scheduler).
     */
    public void deductLeaveBalance(Long employeeId, LeaveType leaveType, int days) {
        int currentYear = Year.now().getValue();

        // LOP doesn't require actual deduction - just track usage
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndYear(employeeId, leaveType, currentYear)
                .orElse(null);

        if (balance != null) {
            balance.setUsed(balance.getUsed() + days);
            if (leaveType != LeaveType.LOP) {
                balance.setRemaining(Math.max(0, balance.getRemaining() - days));
            }
            leaveBalanceRepository.save(balance);
            logger.info("Deducted {} {} day(s) for employee {}", days, leaveType, employeeId);
        }
    }

    /**
     * Validate leave dates.
     */
    private void validateLeaveDates(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();

        if (startDate == null || endDate == null) {
            throw new BusinessException("Start date and end date are required");
        }

        if (startDate.isBefore(today)) {
            throw new BusinessException("Start date cannot be in the past");
        }

        if (endDate.isBefore(startDate)) {
            throw new BusinessException("End date cannot be before start date");
        }
    }

    /**
     * Calculate total leave days.
     */
    private int calculateLeaveDays(LocalDate startDate, LocalDate endDate) {
        return (int) (endDate.toEpochDay() - startDate.toEpochDay() + 1);
    }

    /**
     * Map LeaveRequest entity to DTO.
     */
    private LeaveRequestDto mapToDto(LeaveRequest leaveRequest) {
        return LeaveRequestDto.builder()
                .id(leaveRequest.getId())
                .employeeId(leaveRequest.getEmployee().getId())
                .employeeName(leaveRequest.getEmployee().getName())
                .employeeCode(leaveRequest.getEmployee().getEmployeeCode())
                .leaveType(leaveRequest.getLeaveType())
                .startDate(leaveRequest.getStartDate())
                .endDate(leaveRequest.getEndDate())
                .totalDays(leaveRequest.getTotalDays())
                .reason(leaveRequest.getReason())
                .status(leaveRequest.getStatus())
                .appliedAt(leaveRequest.getAppliedAt())
                .reviewedById(leaveRequest.getReviewedBy() != null ? leaveRequest.getReviewedBy().getId() : null)
                .reviewedByName(leaveRequest.getReviewedBy() != null ? leaveRequest.getReviewedBy().getName() : null)
                .reviewedAt(leaveRequest.getReviewedAt())
                .rejectionReason(leaveRequest.getRejectionReason())
                .build();
    }

    /**
     * Map LeaveBalance entity to DTO.
     */
    private LeaveBalanceDto mapBalanceToDto(LeaveBalance balance) {
        return LeaveBalanceDto.builder()
                .id(balance.getId())
                .employeeId(balance.getEmployee().getId())
                .employeeName(balance.getEmployee().getName())
                .leaveType(balance.getLeaveType())
                .total(balance.getTotal())
                .used(balance.getUsed())
                .remaining(balance.getRemaining())
                .year(balance.getYear())
                .build();
    }
}
