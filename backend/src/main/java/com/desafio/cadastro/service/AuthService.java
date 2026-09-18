package com.desafio.cadastro.service;

import com.desafio.cadastro.dto.LoginRequest;
import com.desafio.cadastro.dto.LoginResponse;
import com.desafio.cadastro.dto.UsuarioRegisterRequest;
import com.desafio.cadastro.dto.UsuarioResponse;
import com.desafio.cadastro.exception.BusinessException;
import com.desafio.cadastro.model.Role;
import com.desafio.cadastro.model.Usuario;
import com.desafio.cadastro.repository.UsuarioRepository;
import com.desafio.cadastro.security.AuthenticatedUser;
import com.desafio.cadastro.security.JwtService;
import com.desafio.cadastro.util.CpfValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public UsuarioResponse registrar(UsuarioRegisterRequest request) {
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
                .role(Role.USER)
                .build();

        return new UsuarioResponse(usuarioRepository.save(usuario));
    }

    public LoginResponse login(LoginRequest request) {
        String cpfLimpo = CpfValidator.limpar(request.getCpf());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cpfLimpo, request.getSenha())
        );

        AuthenticatedUser authenticatedUser = (AuthenticatedUser) authentication.getPrincipal();
        String token = jwtService.gerarToken(authenticatedUser);

        return new LoginResponse(token, new UsuarioResponse(authenticatedUser.getUsuario()));
    }
}
