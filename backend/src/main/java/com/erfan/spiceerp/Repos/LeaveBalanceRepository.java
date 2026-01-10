package com.erfan.spiceerp.Repos;

import com.erfan.spiceerp.Enums.LeaveType;
import com.erfan.spiceerp.Models.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for LeaveBalance entity operations.
 */
@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    /**
     * Find all leave balances for an employee.
     */
    List<LeaveBalance> findByEmployeeId(Long employeeId);

    /**
     * Find leave balance for an employee and specific leave type.
     */
    Optional<LeaveBalance> findByEmployeeIdAndLeaveType(Long employeeId, LeaveType leaveType);

    /**
     * Find all leave balances for an employee for a specific year.
     */
    List<LeaveBalance> findByEmployeeIdAndYear(Long employeeId, Integer year);

    /**
     * Find leave balance for employee, leave type, and year.
     */
    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeAndYear(Long employeeId, LeaveType leaveType, Integer year);

    /**
     * Check if balance exists for employee and leave type.
     */
    boolean existsByEmployeeIdAndLeaveType(Long employeeId, LeaveType leaveType);

    /**
     * Check if balance exists for employee, leave type, and year.
     */
    boolean existsByEmployeeIdAndLeaveTypeAndYear(Long employeeId, LeaveType leaveType, Integer year);

    /**
     * Update used leaves count.
     */
    @Modifying
    @Query("UPDATE LeaveBalance lb SET lb.used = lb.used + :days, lb.remaining = lb.remaining - :days " +
            "WHERE lb.employee.id = :employeeId AND lb.leaveType = :leaveType AND lb.year = :year " +
            "AND lb.remaining >= :days")
    int deductLeaveBalance(
            @Param("employeeId") Long employeeId,
            @Param("leaveType") LeaveType leaveType,
            @Param("year") Integer year,
            @Param("days") Integer days);

    /**
     * Restore leaves to balance (for cancellation).
     */
    @Modifying
    @Query("UPDATE LeaveBalance lb SET lb.used = lb.used - :days, lb.remaining = lb.remaining + :days " +
            "WHERE lb.employee.id = :employeeId AND lb.leaveType = :leaveType AND lb.year = :year")
    int restoreLeaveBalance(
            @Param("employeeId") Long employeeId,
            @Param("leaveType") LeaveType leaveType,
            @Param("year") Integer year,
            @Param("days") Integer days);

    /**
     * Find all leave balances for a specific year.
     */
    List<LeaveBalance> findByYear(Integer year);

    /**
     * Get total remaining leaves for all types for an employee.
     */
    @Query("SELECT COALESCE(SUM(lb.remaining), 0) FROM LeaveBalance lb " +
            "WHERE lb.employee.id = :employeeId AND lb.year = :year")
    Integer getTotalRemainingLeaves(@Param("employeeId") Long employeeId, @Param("year") Integer year);
}
