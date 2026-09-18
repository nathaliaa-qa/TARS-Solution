package com.desafio.cadastro.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

/** Espelha o payload retornado pela API ViaCEP. */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class CepResponse {
    private String cep;
    private String logradouro;
    private String complemento;
    private String bairro;
    private String localidade; // cidade
    private String uf;
    private boolean erro;
}
