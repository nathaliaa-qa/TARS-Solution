package com.desafio.cadastro.dto;

import com.desafio.cadastro.model.Endereco;
import lombok.Getter;

@Getter
public class EnderecoResponse {
    private final Long id;
    private final String cep;
    private final String logradouro;
    private final String numero;
    private final String complemento;
    private final String bairro;
    private final String cidade;
    private final String uf;
    private final boolean principal;

    public EnderecoResponse(Endereco endereco) {
        this.id = endereco.getId();
        this.cep = endereco.getCep();
        this.logradouro = endereco.getLogradouro();
        this.numero = endereco.getNumero();
        this.complemento = endereco.getComplemento();
        this.bairro = endereco.getBairro();
        this.cidade = endereco.getCidade();
        this.uf = endereco.getUf();
        this.principal = endereco.isPrincipal();
    }
}
