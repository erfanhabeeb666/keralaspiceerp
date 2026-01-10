package com.erfan.spiceerp.Repos;

import com.erfan.spiceerp.Enums.AttendanceStatus;
import com.erfan.spiceerp.Models.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Attendance entity operations.
 */
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    /**
     * Find attendance record for a specific employee on a specific date.
     */
    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);

    /**
     * Check if attendance exists for an employee on a specific date.
     */
    boolean existsByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);

    /**
     * Find all attendance records for an employee.
     */
    List<Attendance> findByEmployeeIdOrderByAttendanceDateDesc(Long employeeId);

    /**
     * Find attendance records for an employee within a date range.
     */
    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId " +
            "AND a.attendanceDate BETWEEN :startDate AND :endDate " +
            "ORDER BY a.attendanceDate DESC")
    List<Attendance> findByEmployeeIdAndDateRange(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find all attendance records for a specific date.
     */
    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

    /**
     * Find all attendance records for a specific date with pagination.
     */
    Page<Attendance> findByAttendanceDate(LocalDate attendanceDate, Pageable pageable);

    /**
     * Update attendance status for a specific record.
     */
    @Modifying
    @Query("UPDATE Attendance a SET a.status = :status, a.leaveRequest.id = :leaveRequestId " +
            "WHERE a.employee.id = :employeeId AND a.attendanceDate = :attendanceDate")
    int updateAttendanceStatus(
            @Param("employeeId") Long employeeId,
            @Param("attendanceDate") LocalDate attendanceDate,
            @Param("status") AttendanceStatus status,
            @Param("leaveRequestId") Long leaveRequestId);

    /**
     * Find attendance records by employee and status within a date range.
     */
    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId " +
            "AND a.status = :status " +
            "AND a.attendanceDate BETWEEN :startDate AND :endDate")
    List<Attendance> findByEmployeeIdAndStatusAndDateRange(
            @Param("employeeId") Long employeeId,
            @Param("status") AttendanceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Count attendance by status for an employee in a date range.
     */
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee.id = :employeeId " +
            "AND a.status = :status " +
            "AND a.attendanceDate BETWEEN :startDate AND :endDate")
    Long countByEmployeeIdAndStatusAndDateRange(
            @Param("employeeId") Long employeeId,
            @Param("status") AttendanceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find attendance records by status for a date.
     */
    List<Attendance> findByAttendanceDateAndStatus(LocalDate attendanceDate, AttendanceStatus status);

    /**
     * Get attendance summary for employee within date range.
     */
    @Query("SELECT a.status, COUNT(a) FROM Attendance a WHERE a.employee.id = :employeeId " +
            "AND a.attendanceDate BETWEEN :startDate AND :endDate " +
            "GROUP BY a.status")
    List<Object[]> getAttendanceSummary(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
