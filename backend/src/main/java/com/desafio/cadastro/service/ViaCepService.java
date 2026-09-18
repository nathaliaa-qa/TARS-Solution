package com.desafio.cadastro.service;

import com.desafio.cadastro.dto.CepResponse;
import com.desafio.cadastro.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Slf4j
@Service
public class ViaCepService {

    private final RestClient restClient;

    public ViaCepService(@Value("${viacep.base-url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    /**
     * Consulta o CEP na API publica ViaCEP.
     * Resultado fica em cache (Caffeine, TTL 24h — ver application.properties) para evitar
     * chamadas repetidas ao mesmo CEP.
     */
    @Cacheable(cacheNames = "cepCache", key = "#cep")
    public CepResponse buscarCep(String cep) {
        log.info("Consultando ViaCEP para o CEP {} (sem cache)", cep);
        try {
            CepResponse response = restClient.get()
                    .uri("/{cep}/json", cep)
                    .retrieve()
                    .body(CepResponse.class);

            if (response == null || response.isErro()) {
                throw new BusinessException("CEP nao encontrado");
            }
            return response;
        } catch (RestClientResponseException e) {
            throw new BusinessException("Falha ao consultar o CEP na ViaCEP: " + e.getMessage());
        }
    }
}
