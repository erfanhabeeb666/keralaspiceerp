package com.erfan.spiceerp.Services;

import com.erfan.spiceerp.Dto.EmployeeDto;
import com.erfan.spiceerp.Enums.LeaveType;
import com.erfan.spiceerp.Enums.Status;
import com.erfan.spiceerp.Enums.UserType;
import com.erfan.spiceerp.Exception.DuplicateResourceException;
import com.erfan.spiceerp.Exception.ResourceNotFoundException;
import com.erfan.spiceerp.Models.Employee;
import com.erfan.spiceerp.Models.LeaveBalance;
import com.erfan.spiceerp.Repos.EmployeeRepository;
import com.erfan.spiceerp.Repos.LeaveBalanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing Employee CRUD operations.
 * This service is primarily used by Admin users.
 */
@Service
@Transactional
public class EmployeeService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);

    // Default leave allocations per year
    private static final int DEFAULT_CL_DAYS = 12;
    private static final int DEFAULT_SL_DAYS = 6;

    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository,
            LeaveBalanceRepository leaveBalanceRepository,
            PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a new employee.
     * Also initializes leave balance for the current year.
     */
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        logger.info("Creating new employee with code: {}", employeeDto.getEmployeeCode());

        // Validate unique constraints
        if (employeeRepository.existsByEmployeeCode(employeeDto.getEmployeeCode())) {
            throw new DuplicateResourceException("Employee", "employeeCode", employeeDto.getEmployeeCode());
        }
        if (employeeRepository.existsByEmail(employeeDto.getEmail())) {
            throw new DuplicateResourceException("Employee", "email", employeeDto.getEmail());
        }

        // Create employee entity
        Employee employee = new Employee();
        employee.setEmployeeCode(employeeDto.getEmployeeCode());
        employee.setName(employeeDto.getFullName());
        employee.setEmail(employeeDto.getEmail().toLowerCase().trim());
        employee.setPhone(employeeDto.getPhone());
        employee.setJoiningDate(employeeDto.getJoiningDate() != null ? employeeDto.getJoiningDate() : LocalDate.now());
        employee.setDepartment(employeeDto.getDepartment());
        employee.setDesignation(employeeDto.getDesignation());
        employee.setStatus(employeeDto.getStatus() != null ? employeeDto.getStatus() : Status.ACTIVE);
        employee.setUserType(UserType.Employee);

        // Set password (encrypt it)
        if (employeeDto.getPassword() != null && !employeeDto.getPassword().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(employeeDto.getPassword()));
        } else {
            // Default password is employee code
            employee.setPassword(passwordEncoder.encode(employeeDto.getEmployeeCode()));
        }

        Employee savedEmployee = employeeRepository.save(employee);
        logger.info("Employee created successfully with ID: {}", savedEmployee.getId());

        // Initialize leave balance for current year
        initializeLeaveBalance(savedEmployee);

        return mapToDto(savedEmployee);
    }

    /**
     * Get employee by ID.
     */
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return mapToDto(employee);
    }

    /**
     * Get employee by employee code.
     */
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeByCode(String employeeCode) {
        Employee employee = employeeRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "employeeCode", employeeCode));
        return mapToDto(employee);
    }

    /**
     * Get all employees.
     */
    @Transactional(readOnly = true)
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all active employees.
     */
    @Transactional(readOnly = true)
    public List<EmployeeDto> getAllActiveEmployees() {
        return employeeRepository.findAllActive().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get employees with pagination.
     */
    @Transactional(readOnly = true)
    public Page<EmployeeDto> getEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(this::mapToDto);
    }

    /**
     * Get employees by status with pagination.
     */
    @Transactional(readOnly = true)
    public Page<EmployeeDto> getEmployeesByStatus(Status status, Pageable pageable) {
        return employeeRepository.findByStatus(status, pageable).map(this::mapToDto);
    }

    /**
     * Search employees by name or employee code.
     */
    @Transactional(readOnly = true)
    public List<EmployeeDto> searchEmployees(String search) {
        return employeeRepository.searchEmployees(search).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Update an existing employee.
     */
    public EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto) {
        logger.info("Updating employee with ID: {}", id);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        // Validate unique constraints (excluding current employee)
        if (employeeDto.getEmployeeCode() != null &&
                !employeeDto.getEmployeeCode().equals(employee.getEmployeeCode()) &&
                employeeRepository.existsByEmployeeCodeExcluding(employeeDto.getEmployeeCode(), id)) {
            throw new DuplicateResourceException("Employee", "employeeCode", employeeDto.getEmployeeCode());
        }
        if (employeeDto.getEmail() != null &&
                !employeeDto.getEmail().equalsIgnoreCase(employee.getEmail()) &&
                employeeRepository.existsByEmailExcluding(employeeDto.getEmail(), id)) {
            throw new DuplicateResourceException("Employee", "email", employeeDto.getEmail());
        }

        // Update fields
        if (employeeDto.getEmployeeCode() != null) {
            employee.setEmployeeCode(employeeDto.getEmployeeCode());
        }
        if (employeeDto.getFullName() != null) {
            employee.setName(employeeDto.getFullName());
        }
        if (employeeDto.getEmail() != null) {
            employee.setEmail(employeeDto.getEmail().toLowerCase().trim());
        }
        if (employeeDto.getPhone() != null) {
            employee.setPhone(employeeDto.getPhone());
        }
        if (employeeDto.getJoiningDate() != null) {
            employee.setJoiningDate(employeeDto.getJoiningDate());
        }
        if (employeeDto.getDepartment() != null) {
            employee.setDepartment(employeeDto.getDepartment());
        }
        if (employeeDto.getDesignation() != null) {
            employee.setDesignation(employeeDto.getDesignation());
        }
        if (employeeDto.getStatus() != null) {
            employee.setStatus(employeeDto.getStatus());
        }
        if (employeeDto.getPassword() != null && !employeeDto.getPassword().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(employeeDto.getPassword()));
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        logger.info("Employee updated successfully with ID: {}", updatedEmployee.getId());

        return mapToDto(updatedEmployee);
    }

    /**
     * Delete an employee (soft delete - change status to INACTIVE).
     */
    public void deleteEmployee(Long id) {
        logger.info("Deleting employee with ID: {}", id);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        // Soft delete - set status to INACTIVE
        employee.setStatus(Status.INACTIVE);
        employeeRepository.save(employee);

        logger.info("Employee deleted (set to INACTIVE) with ID: {}", id);
    }

    /**
     * Hard delete an employee (permanent deletion).
     * Use with caution - this will delete all related records.
     */
    public void hardDeleteEmployee(Long id) {
        logger.warn("Performing hard delete for employee with ID: {}", id);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        employeeRepository.delete(employee);

        logger.info("Employee permanently deleted with ID: {}", id);
    }

    /**
     * Initialize leave balance for an employee for the current year.
     */
    private void initializeLeaveBalance(Employee employee) {
        int currentYear = Year.now().getValue();

        // Create CL balance
        LeaveBalance clBalance = LeaveBalance.builder()
                .employee(employee)
                .leaveType(LeaveType.CL)
                .total(DEFAULT_CL_DAYS)
                .used(0)
                .remaining(DEFAULT_CL_DAYS)
                .year(currentYear)
                .build();
        leaveBalanceRepository.save(clBalance);

        // Create SL balance
        LeaveBalance slBalance = LeaveBalance.builder()
                .employee(employee)
                .leaveType(LeaveType.SL)
                .total(DEFAULT_SL_DAYS)
                .used(0)
                .remaining(DEFAULT_SL_DAYS)
                .year(currentYear)
                .build();
        leaveBalanceRepository.save(slBalance);

        // LOP doesn't need initial balance as it's unlimited
        LeaveBalance lopBalance = LeaveBalance.builder()
                .employee(employee)
                .leaveType(LeaveType.LOP)
                .total(999) // Unlimited
                .used(0)
                .remaining(999)
                .year(currentYear)
                .build();
        leaveBalanceRepository.save(lopBalance);

        logger.info("Leave balance initialized for employee ID: {}", employee.getId());
    }

    /**
     * Get employee entity by ID (for internal use).
     */
    public Employee getEmployeeEntityById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
    }

    /**
     * Map Employee entity to DTO.
     */
    private EmployeeDto mapToDto(Employee employee) {
        return EmployeeDto.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .fullName(employee.getName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .joiningDate(employee.getJoiningDate())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .status(employee.getStatus())
                .build();
    }
}
