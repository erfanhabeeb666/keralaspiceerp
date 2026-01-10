package com.erfan.spiceerp.Dto;

import com.erfan.spiceerp.Enums.LeaveType;
import lombok.*;

/**
 * DTO for leave balance information.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalanceDto {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private LeaveType leaveType;

    private Integer total;

    private Integer used;

    private Integer remaining;

    private Integer year;
}
