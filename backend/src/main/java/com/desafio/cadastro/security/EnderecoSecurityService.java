package com.desafio.cadastro.security;

import com.desafio.cadastro.repository.EnderecoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Usado em expressoes @PreAuthorize (ex.: @enderecoSecurityService.isOwner(#id, authentication.principal))
 * para checar se o usuario autenticado e dono de um endereco especifico, ja que essa checagem
 * depende do banco e nao pode ser resolvida so com o path variable.
 */
@Service("enderecoSecurityService")
@RequiredArgsConstructor
public class EnderecoSecurityService {

    private final EnderecoRepository enderecoRepository;

    public boolean isOwner(Long enderecoId, AuthenticatedUser principal) {
        if (principal == null || enderecoId == null) {
            return false;
        }
        return enderecoRepository.findById(enderecoId)
                .map(endereco -> endereco.getUsuario().getId().equals(principal.getId()))
                .orElse(false);
    }
}
