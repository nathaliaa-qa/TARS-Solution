package com.desafio.cadastro.repository;

import com.desafio.cadastro.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCpf(String cpf);

    boolean existsByCpf(String cpf);
}
