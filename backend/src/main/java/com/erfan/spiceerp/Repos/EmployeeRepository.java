package com.erfan.spiceerp.Repos;

import com.erfan.spiceerp.Enums.Status;
import com.erfan.spiceerp.Models.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Employee entity operations.
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    /**
     * Find employee by email.
     */
    Optional<Employee> findByEmail(String email);

    /**
     * Find employee by employee code.
     */
    Optional<Employee> findByEmployeeCode(String employeeCode);

    /**
     * Check if employee code already exists.
     */
    boolean existsByEmployeeCode(String employeeCode);

    /**
     * Check if email already exists.
     */
    boolean existsByEmail(String email);

    /**
     * Find all employees with a given status.
     */
    List<Employee> findByStatus(Status status);

    /**
     * Find all active employees.
     */
    @Query("SELECT e FROM Employee e WHERE e.status = 'ACTIVE'")
    List<Employee> findAllActive();

    /**
     * Find employees by status with pagination.
     */
    Page<Employee> findByStatus(Status status, Pageable pageable);

    /**
     * Find employees by department.
     */
    List<Employee> findByDepartment(String department);

    /**
     * Search employees by name or employee code.
     */
    @Query("SELECT e FROM Employee e WHERE " +
            "LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Employee> searchEmployees(@Param("search") String search);

    /**
     * Check if employee code exists excluding a specific employee (for updates).
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Employee e " +
            "WHERE e.employeeCode = :employeeCode AND e.id != :excludeId")
    boolean existsByEmployeeCodeExcluding(@Param("employeeCode") String employeeCode,
            @Param("excludeId") Long excludeId);

    /**
     * Check if email exists excluding a specific employee (for updates).
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Employee e " +
            "WHERE e.email = :email AND e.id != :excludeId")
    boolean existsByEmailExcluding(@Param("email") String email,
            @Param("excludeId") Long excludeId);
}
