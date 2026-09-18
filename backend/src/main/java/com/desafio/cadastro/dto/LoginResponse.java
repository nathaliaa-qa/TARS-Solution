package com.desafio.cadastro.dto;

import lombok.Getter;

@Getter
public class LoginResponse {
    private final String token;
    private final String tipo = "Bearer";
    private final UsuarioResponse usuario;

    public LoginResponse(String token, UsuarioResponse usuario) {
        this.token = token;
        this.usuario = usuario;
    }
}
