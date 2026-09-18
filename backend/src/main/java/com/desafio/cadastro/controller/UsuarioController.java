package com.desafio.cadastro.controller;

import com.desafio.cadastro.dto.UsuarioAdminCreateRequest;
import com.desafio.cadastro.dto.UsuarioResponse;
import com.desafio.cadastro.dto.UsuarioUpdateRequest;
import com.desafio.cadastro.security.AuthenticatedUser;
import com.desafio.cadastro.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    /** Apenas ADMIN pode listar todos os usuarios. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    /** Apenas ADMIN pode cadastrar usuarios por aqui (cadastro publico fica em /api/auth/register). */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody UsuarioAdminCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.criar(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> meuPerfil(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(usuarioService.buscarPorId(principal.getId()));
    }

    /** ADMIN acessa qualquer usuario; usuario comum so acessa o proprio id. */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UsuarioResponse> atualizar(@PathVariable Long id,
                                                       @Valid @RequestBody UsuarioUpdateRequest request) {
        return ResponseEntity.ok(usuarioService.atualizar(id, request));
    }

    /** Apenas ADMIN pode excluir usuarios. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        usuarioService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
