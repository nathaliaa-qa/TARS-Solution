package com.desafio.cadastro.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "CPF e obrigatorio")
    private String cpf;

    @NotBlank(message = "Senha e obrigatoria")
    private String senha;
}
