package com.desafio.cadastro.dto;

import com.desafio.cadastro.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Usado apenas pelo endpoint administrativo de criacao de usuario (POST /api/usuarios).
 * Diferente de UsuarioRegisterRequest (cadastro publico, sempre USER), aqui o ADMIN
 * pode escolher o papel do novo usuario (por exemplo, para criar outro administrador).
 */
@Getter
@Setter
public class UsuarioAdminCreateRequest {

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

    /** Opcional; se nao informado, o service assume USER. */
    private Role role;
}
