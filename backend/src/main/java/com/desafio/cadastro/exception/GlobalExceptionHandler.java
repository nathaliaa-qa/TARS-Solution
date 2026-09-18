package com.desafio.cadastro.exception;

import com.desafio.cadastro.dto.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "Recurso nao encontrado", ex.getMessage(), null);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusiness(BusinessException ex) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "Regra de negocio violada", ex.getMessage(), null);
    }

    @ExceptionHandler({AccessDeniedException.class, AccessDeniedCustomException.class})
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(Exception ex) {
        return build(HttpStatus.FORBIDDEN, "Acesso negado", "Voce nao tem permissao para realizar esta operacao", null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Credenciais invalidas", "CPF ou senha incorretos", null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> detalhes = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .toList();
        return build(HttpStatus.BAD_REQUEST, "Erro de validacao", "Um ou mais campos sao invalidos", detalhes);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno", "Ocorreu um erro inesperado", null);
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String erro, String mensagem, List<String> detalhes) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(status.value(), erro, mensagem, detalhes));
    }
}
