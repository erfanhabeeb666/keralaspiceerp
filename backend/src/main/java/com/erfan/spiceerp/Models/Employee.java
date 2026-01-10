package com.erfan.spiceerp.Models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

/**
 * Entity representing an Employee in the ERP system.
 * Extends User for authentication purposes and includes employee-specific
 * fields.
 */
@Entity
@DiscriminatorValue("EMPLOYEE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends User {

    @Column(name = "employee_code", unique = true, length = 20)
    @Size(max = 20, message = "Employee code must not exceed 20 characters")
    private String employeeCode;

    @Column(name = "phone", length = 15)
    @Size(max = 15, message = "Phone number must not exceed 15 characters")
    private String phone;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "department", length = 50)
    private String department;

    @Column(name = "designation", length = 50)
    private String designation;

    // Constructor for basic employee creation
    public Employee(Long id, String name, String email, String password) {
        super(id, name, email, password);
    }

    // Constructor for full employee creation
    public Employee(Long id, String name, String email, String password,
            String employeeCode, String phone, LocalDate joiningDate) {
        super(id, name, email, password);
        this.employeeCode = employeeCode;
        this.phone = phone;
        this.joiningDate = joiningDate;
    }
}
