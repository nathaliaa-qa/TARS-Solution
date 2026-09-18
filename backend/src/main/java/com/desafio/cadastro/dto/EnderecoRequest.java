package com.desafio.cadastro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EnderecoRequest {

    @NotBlank(message = "CEP e obrigatorio")
    @Pattern(regexp = "\\d{8}", message = "CEP deve conter 8 digitos numericos")
    private String cep;

    @NotBlank(message = "Numero e obrigatorio")
    private String numero;

    private String complemento;

    // Preenchidos pelo frontend apenas quando o ViaCEP estiver indisponível.
    // O serviço ainda prefere a fonte oficial sempre que ela responder.
    private String logradouro;
    private String bairro;
    private String cidade;
    private String uf;

    /** Se true, este endereco vira o principal do usuario (desmarcando os demais). */
    private boolean principal;
}
