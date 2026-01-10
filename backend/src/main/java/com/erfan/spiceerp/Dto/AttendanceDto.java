package com.erfan.spiceerp.Dto;

import com.erfan.spiceerp.Enums.AttendanceStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for attendance records.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDto {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private String employeeCode;

    private LocalDate attendanceDate;

    private AttendanceStatus status;

    private Long leaveRequestId;

    private LocalDateTime createdAt;
}
