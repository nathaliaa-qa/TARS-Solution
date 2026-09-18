package com.desafio.cadastro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UsuarioRegisterRequest {

    @NotBlank(message = "Nome e obrigatorio")
    private String nome;

    @NotBlank(message = "CPF e obrigatorio")
    private String cpf;

    @NotBlank(message = "Senha e obrigatoria")
    @Size(min = 6, message = "Senha deve ter ao menos 6 caracteres")
    private String senha;

    @NotNull(message = "Data de nascimento e obrigatoria")
    @Past(message = "Data de nascimento deve estar no passado")
    private LocalDate dataNascimento;
}
