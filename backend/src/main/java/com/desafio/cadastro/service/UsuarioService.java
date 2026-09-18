package com.desafio.cadastro.service;

import com.desafio.cadastro.dto.UsuarioAdminCreateRequest;
import com.desafio.cadastro.dto.UsuarioResponse;
import com.desafio.cadastro.dto.UsuarioUpdateRequest;
import com.desafio.cadastro.exception.BusinessException;
import com.desafio.cadastro.exception.ResourceNotFoundException;
import com.desafio.cadastro.model.Role;
import com.desafio.cadastro.model.Usuario;
import com.desafio.cadastro.repository.UsuarioRepository;
import com.desafio.cadastro.util.CpfValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        return new UsuarioResponse(buscarEntidade(id));
    }

    /**
     * Criacao de usuario pelo ADMIN (POST /api/usuarios) — diferente do cadastro publico
     * (AuthService.registrar), aqui quem cria escolhe o papel (ex.: para criar outro admin).
     * Mesma regra de CPF unico/valido do cadastro publico.
     */
    @Transactional
    public UsuarioResponse criar(UsuarioAdminCreateRequest request) {
        String cpfLimpo = CpfValidator.limpar(request.getCpf());

        if (!CpfValidator.isValido(cpfLimpo)) {
            throw new BusinessException("CPF invalido");
        }
        if (usuarioRepository.existsByCpf(cpfLimpo)) {
            throw new BusinessException("Ja existe um usuario cadastrado com este CPF");
        }

        Usuario usuario = Usuario.builder()
                .nome(request.getNome())
                .cpf(cpfLimpo)
                .senha(passwordEncoder.encode(request.getSenha()))
                .dataNascimento(request.getDataNascimento())
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .build();

        return new UsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse atualizar(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = buscarEntidade(id);
        usuario.setNome(request.getNome());

        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }
        if (request.getDataNascimento() != null) {
            usuario.setDataNascimento(request.getDataNascimento());
        }

        return new UsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void excluir(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario nao encontrado: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    private Usuario buscarEntidade(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado: " + id));
    }
}
