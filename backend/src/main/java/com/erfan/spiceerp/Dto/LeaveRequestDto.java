package com.erfan.spiceerp.Dto;

import com.erfan.spiceerp.Enums.LeaveStatus;
import com.erfan.spiceerp.Enums.LeaveType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for leave request operations.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequestDto {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private String employeeCode;

    @NotNull(message = "Leave type is required")
    private LeaveType leaveType;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @FutureOrPresent(message = "End date must be today or in the future")
    private LocalDate endDate;

    private Integer totalDays;

    private String reason;

    private LeaveStatus status;

    private LocalDateTime appliedAt;

    private Long reviewedById;

    private String reviewedByName;

    private LocalDateTime reviewedAt;

    private String rejectionReason;
}
