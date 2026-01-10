package com.erfan.spiceerp.Enums;

/**
 * Enum representing the status of a leave request.
 */
public enum LeaveStatus {
    PENDING, // Leave request submitted, awaiting approval
    APPROVED, // Leave request approved by admin
    REJECTED, // Leave request rejected by admin
    CANCELLED // Leave request cancelled by employee
}
