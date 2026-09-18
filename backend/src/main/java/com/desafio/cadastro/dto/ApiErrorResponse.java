package com.desafio.cadastro.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@AllArgsConstructor
public class ApiErrorResponse {
    private final Instant timestamp = Instant.now();
    private int status;
    private String erro;
    private String mensagem;
    private List<String> detalhes;
}
