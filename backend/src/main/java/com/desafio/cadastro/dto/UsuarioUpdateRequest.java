package com.desafio.cadastro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UsuarioUpdateRequest {

    @NotBlank(message = "Nome e obrigatorio")
    private String nome;

    /** Opcional: se informado, atualiza a senha. */
    private String senha;

    /** Opcional: se informado, atualiza a data de nascimento. */
    @Past(message = "Data de nascimento deve estar no passado")
    private LocalDate dataNascimento;
}
