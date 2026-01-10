package com.erfan.spiceerp.Repos;

import com.erfan.spiceerp.Enums.LeaveStatus;
import com.erfan.spiceerp.Models.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for LeaveRequest entity operations.
 */
@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    /**
     * Find all leave requests for an employee.
     */
    List<LeaveRequest> findByEmployeeIdOrderByAppliedAtDesc(Long employeeId);

    /**
     * Find all leave requests for an employee with pagination.
     */
    Page<LeaveRequest> findByEmployeeId(Long employeeId, Pageable pageable);

    /**
     * Find leave requests by status.
     */
    List<LeaveRequest> findByStatus(LeaveStatus status);

    /**
     * Find all pending leave requests.
     */
    List<LeaveRequest> findByStatusOrderByAppliedAtAsc(LeaveStatus status);

    /**
     * Find pending leave requests with pagination.
     */
    Page<LeaveRequest> findByStatus(LeaveStatus status, Pageable pageable);

    /**
     * Find leave requests for an employee with a specific status.
     */
    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveStatus status);

    /**
     * Check for overlapping approved leaves for an employee.
     * Returns true if there's an overlap with another approved leave.
     */
    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM LeaveRequest l " +
            "WHERE l.employee.id = :employeeId " +
            "AND l.status = 'APPROVED' " +
            "AND l.startDate <= :endDate " +
            "AND l.endDate >= :startDate " +
            "AND (:excludeId IS NULL OR l.id != :excludeId)")
    boolean hasOverlappingApprovedLeave(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("excludeId") Long excludeId);

    /**
     * Find approved leaves for an employee on a specific date.
     */
    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId " +
            "AND l.status = 'APPROVED' " +
            "AND :date BETWEEN l.startDate AND l.endDate")
    List<LeaveRequest> findApprovedLeavesForDate(
            @Param("employeeId") Long employeeId,
            @Param("date") LocalDate date);

    /**
     * Find all approved leaves that include today's date (for attendance
     * scheduler).
     */
    @Query("SELECT l FROM LeaveRequest l WHERE l.status = 'APPROVED' " +
            "AND :today BETWEEN l.startDate AND l.endDate")
    List<LeaveRequest> findApprovedLeavesForToday(@Param("today") LocalDate today);

    /**
     * Find leave requests for an employee within a date range.
     */
    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId " +
            "AND l.startDate >= :startDate AND l.endDate <= :endDate " +
            "ORDER BY l.appliedAt DESC")
    List<LeaveRequest> findByEmployeeIdAndDateRange(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Count pending leave requests.
     */
    Long countByStatus(LeaveStatus status);

    /**
     * Find leave requests that have started but balance not yet deducted.
     * (For cases where leave started and we need to process balance)
     */
    @Query("SELECT l FROM LeaveRequest l WHERE l.status = 'APPROVED' " +
            "AND l.startDate <= :today AND l.endDate >= :today")
    List<LeaveRequest> findActiveLeavesForDate(@Param("today") LocalDate today);

    /**
     * Find all leave requests by employee and status, ordered by start date.
     */
    List<LeaveRequest> findByEmployeeIdAndStatusOrderByStartDateAsc(Long employeeId, LeaveStatus status);
}
