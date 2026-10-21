package com.example.digital_wallet.exception;

public class AccountNotActiveException extends RuntimeException {
    public AccountNotActiveException(String message) {
        super(message);
    }
}
