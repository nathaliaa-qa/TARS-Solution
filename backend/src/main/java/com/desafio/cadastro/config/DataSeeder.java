package com.desafio.cadastro.config;

import com.desafio.cadastro.model.Role;
import com.desafio.cadastro.model.Usuario;
import com.desafio.cadastro.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Cria um usuario ADMIN padrao no primeiro start, caso ainda nao exista nenhum admin.
 * CPF/senha sao apenas para ambiente de desenvolvimento — troque a senha em producao.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String ADMIN_CPF = "00000000000";
    private static final String ADMIN_SENHA_PADRAO = "admin123";
    private static final LocalDate ADMIN_DATA_NASCIMENTO_PADRAO = LocalDate.of(1990, 1, 1);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.findByCpf(ADMIN_CPF).isEmpty()) {
            Usuario admin = Usuario.builder()
                    .nome("Administrador")
                    .cpf(ADMIN_CPF)
                    .senha(passwordEncoder.encode(ADMIN_SENHA_PADRAO))
                    .dataNascimento(ADMIN_DATA_NASCIMENTO_PADRAO)
                    .role(Role.ADMIN)
                    .build();
            usuarioRepository.save(admin);
            log.info("Usuario ADMIN padrao criado (cpf={}, senha={}) — apenas para desenvolvimento.",
                    ADMIN_CPF, ADMIN_SENHA_PADRAO);
        }
    }
}
