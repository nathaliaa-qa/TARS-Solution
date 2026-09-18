package com.desafio.cadastro.controller;

import com.desafio.cadastro.dto.CepResponse;
import com.desafio.cadastro.service.ViaCepService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint usado pelo frontend para preencher o formulario de endereco
 * automaticamente a partir do CEP (proxy para o ViaCepService, que ja cacheia).
 */
@RestController
@RequestMapping("/api/cep")
@RequiredArgsConstructor
public class CepController {

    private final ViaCepService viaCepService;

    @GetMapping("/{cep}")
    public ResponseEntity<CepResponse> buscar(@PathVariable String cep) {
        return ResponseEntity.ok(viaCepService.buscarCep(cep.replaceAll("\\D", "")));
    }
}
