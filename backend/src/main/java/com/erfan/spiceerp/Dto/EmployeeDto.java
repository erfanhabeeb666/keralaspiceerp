package com.erfan.spiceerp.Dto;

import com.erfan.spiceerp.Enums.Status;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for creating and updating employees.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDto {

    private Long id;

    @NotBlank(message = "Employee code is required")
    @Size(max = 20, message = "Employee code must not exceed 20 characters")
    private String employeeCode;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Size(max = 15, message = "Phone must not exceed 15 characters")
    private String phone;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    private Status status;

    private String department;

    private String designation;

    // For employee creation - password field
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
