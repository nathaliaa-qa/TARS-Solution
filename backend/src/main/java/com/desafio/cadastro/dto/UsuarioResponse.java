package com.desafio.cadastro.dto;

import com.desafio.cadastro.model.Role;
import com.desafio.cadastro.model.Usuario;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class UsuarioResponse {
    private final Long id;
    private final String nome;
    private final String cpf;
    private final LocalDate dataNascimento;
    private final Role role;
    private final List<EnderecoResponse> enderecos;

    public UsuarioResponse(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.cpf = usuario.getCpf();
        this.dataNascimento = usuario.getDataNascimento();
        this.role = usuario.getRole();
        this.enderecos = usuario.getEnderecos() == null ? List.of() :
                usuario.getEnderecos().stream().map(EnderecoResponse::new).collect(Collectors.toList());
    }
}
