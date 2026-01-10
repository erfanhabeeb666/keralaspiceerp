package com.erfan.spiceerp.Dto;

import lombok.*;

/**
 * DTO for admin leave approval/rejection.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveApprovalDto {

    private String rejectionReason;
}
