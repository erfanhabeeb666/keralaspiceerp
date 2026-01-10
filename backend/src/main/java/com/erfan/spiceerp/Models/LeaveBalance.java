package com.erfan.spiceerp.Models;

import com.erfan.spiceerp.Enums.LeaveType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing leave balance for each employee per leave type.
 * Tracks total allocated, used, and remaining leaves.
 */
@Entity
@Table(name = "leave_balance", uniqueConstraints = @UniqueConstraint(columnNames = { "employee_id",
        "leave_type" }), indexes = {
                @Index(name = "idx_leave_balance_employee", columnList = "employee_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull(message = "Employee is required")
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 10)
    @NotNull(message = "Leave type is required")
    private LeaveType leaveType;

    @Column(name = "total", nullable = false)
    @Min(value = 0, message = "Total leaves cannot be negative")
    private Integer total;

    @Column(name = "used", nullable = false)
    @Min(value = 0, message = "Used leaves cannot be negative")
    @Builder.Default
    private Integer used = 0;

    @Column(name = "remaining", nullable = false)
    private Integer remaining;

    @Column(name = "year", nullable = false)
    private Integer year;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Calculate remaining leaves before persist/update.
     */
    @PrePersist
    @PreUpdate
    public void calculateRemaining() {
        this.remaining = this.total - (this.used != null ? this.used : 0);
    }

    /**
     * Check if there are sufficient leaves available.
     */
    public boolean hasSufficientBalance(int requestedDays) {
        return this.remaining >= requestedDays;
    }

    /**
     * Use leaves from balance.
     */
    public void useLeaves(int days) {
        if (this.remaining < days) {
            throw new IllegalStateException("Insufficient leave balance");
        }
        this.used += days;
        this.remaining -= days;
    }

    /**
     * Restore leaves to balance (e.g., on cancellation).
     */
    public void restoreLeaves(int days) {
        this.used -= days;
        this.remaining += days;
    }
}
