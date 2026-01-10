package com.erfan.spiceerp.Scheduler;

import com.erfan.spiceerp.Services.AttendanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler for automated attendance generation.
 * Runs daily at 00:05 AM to generate attendance records for all active
 * employees.
 */
@Component
public class AttendanceScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceScheduler.class);

    private final AttendanceService attendanceService;

    public AttendanceScheduler(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * Generate daily attendance for all active employees.
     * Runs at 00:05 AM every day.
     * 
     * Cron expression: second minute hour day-of-month month day-of-week
     * 0 5 0 * * * = At 00:05:00 AM every day
     */
    @Scheduled(cron = "0 5 0 * * *")
    public void generateDailyAttendance() {
        logger.info("Starting scheduled attendance generation...");
        try {
            attendanceService.generateDailyAttendance();
            logger.info("Scheduled attendance generation completed successfully");
        } catch (Exception e) {
            logger.error("Error during scheduled attendance generation", e);
        }
    }

    /**
     * Manual trigger for attendance generation (for testing or manual runs).
     * This is called internally when needed, not by scheduler.
     */
    public void triggerAttendanceGeneration() {
        logger.info("Manual trigger for attendance generation...");
        attendanceService.generateDailyAttendance();
    }
}
