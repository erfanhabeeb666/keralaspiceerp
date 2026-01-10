package com.erfan.spiceerp.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when insufficient leave balance.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InsufficientBalanceException extends RuntimeException {

    public InsufficientBalanceException(String message) {
        super(message);
    }

    public InsufficientBalanceException(String leaveType, int requested, int available) {
        super(String.format("Insufficient %s balance. Requested: %d, Available: %d",
                leaveType, requested, available));
    }
}
