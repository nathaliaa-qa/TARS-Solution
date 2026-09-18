package com.desafio.cadastro.controller;

import com.desafio.cadastro.dto.EnderecoRequest;
import com.desafio.cadastro.dto.EnderecoResponse;
import com.desafio.cadastro.service.EnderecoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService enderecoService;

    /** ADMIN ve enderecos de qualquer usuario; usuario comum so os proprios. */
    @GetMapping("/api/usuarios/{usuarioId}/enderecos")
    @PreAuthorize("hasRole('ADMIN') or #usuarioId == authentication.principal.id")
    public ResponseEntity<List<EnderecoResponse>> listar(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(enderecoService.listarPorUsuario(usuarioId));
    }

    /**
     * Cadastro de endereco e restrito ao ADMIN — o documento do desafio lista "cadastrar
     * enderecos" apenas nas permissoes do Administrador; usuario comum so visualiza, edita
     * e define o principal dos enderecos que ja possui.
     */
    @PostMapping("/api/usuarios/{usuarioId}/enderecos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnderecoResponse> criar(@PathVariable Long usuarioId,
                                                    @Valid @RequestBody EnderecoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enderecoService.criar(usuarioId, request));
    }

    @PutMapping("/api/enderecos/{id}")
    @PreAuthorize("hasRole('ADMIN') or @enderecoSecurityService.isOwner(#id, authentication.principal)")
    public ResponseEntity<EnderecoResponse> atualizar(@PathVariable Long id,
                                                        @Valid @RequestBody EnderecoRequest request) {
        return ResponseEntity.ok(enderecoService.atualizar(id, request));
    }

    @PatchMapping("/api/enderecos/{id}/principal")
    @PreAuthorize("hasRole('ADMIN') or @enderecoSecurityService.isOwner(#id, authentication.principal)")
    public ResponseEntity<EnderecoResponse> definirComoPrincipal(@PathVariable Long id) {
        return ResponseEntity.ok(enderecoService.definirComoPrincipal(id));
    }

    /** Exclusao de endereco tambem e restrita ao ADMIN, pelo mesmo motivo do cadastro. */
    @DeleteMapping("/api/enderecos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        enderecoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
