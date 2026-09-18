package com.desafio.cadastro.repository;

import com.desafio.cadastro.model.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> {

    List<Endereco> findByUsuarioId(Long usuarioId);

    Optional<Endereco> findByUsuarioIdAndPrincipalTrue(Long usuarioId);


    List<Endereco> findByUsuarioIdOrderByIdAsc(Long usuarioId);
}
