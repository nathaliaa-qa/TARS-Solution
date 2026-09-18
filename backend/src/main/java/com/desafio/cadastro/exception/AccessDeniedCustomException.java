package com.desafio.cadastro.exception;

public class AccessDeniedCustomException extends RuntimeException {
    public AccessDeniedCustomException(String message) {
        super(message);
    }
}
