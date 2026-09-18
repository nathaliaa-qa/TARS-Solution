package com.desafio.cadastro.service;

import com.desafio.cadastro.dto.CepResponse;
import com.desafio.cadastro.dto.EnderecoRequest;
import com.desafio.cadastro.dto.EnderecoResponse;
import com.desafio.cadastro.exception.ResourceNotFoundException;
import com.desafio.cadastro.model.Endereco;
import com.desafio.cadastro.model.Usuario;
import com.desafio.cadastro.repository.EnderecoRepository;
import com.desafio.cadastro.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ViaCepService viaCepService;

    @Transactional(readOnly = true)
    public List<EnderecoResponse> listarPorUsuario(Long usuarioId) {
        return enderecoRepository.findByUsuarioId(usuarioId).stream()
                .map(EnderecoResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnderecoResponse criar(Long usuarioId, EnderecoRequest request) {
        Usuario usuario = buscarUsuario(usuarioId);

        CepResponse cepInfo = resolverEndereco(request);

        boolean primeiroEndereco = enderecoRepository.findByUsuarioId(usuarioId).isEmpty();
        // O primeiro endereco de um usuario e sempre principal, mesmo que nao solicitado.
        boolean serahPrincipal = request.isPrincipal() || primeiroEndereco;

        Endereco endereco = Endereco.builder()
                .cep(request.getCep())
                .numero(request.getNumero())
                .complemento(request.getComplemento())
                .logradouro(cepInfo.getLogradouro())
                .bairro(cepInfo.getBairro())
                .cidade(cepInfo.getLocalidade())
                .uf(cepInfo.getUf())
                .principal(serahPrincipal)
                .usuario(usuario)
                .build();

        if (serahPrincipal) {
            desmarcarPrincipalAtual(usuarioId);
        }

        return new EnderecoResponse(enderecoRepository.save(endereco));
    }

    @Transactional
    public EnderecoResponse atualizar(Long enderecoId, EnderecoRequest request) {
        Endereco endereco = buscarEndereco(enderecoId);

        // Se o CEP mudou, refaz a consulta (usa o cache se ja tiver sido consultado antes).
        if (!endereco.getCep().equals(request.getCep())) {
            CepResponse cepInfo = resolverEndereco(request);
            endereco.setCep(request.getCep());
            endereco.setLogradouro(cepInfo.getLogradouro());
            endereco.setBairro(cepInfo.getBairro());
            endereco.setCidade(cepInfo.getLocalidade());
            endereco.setUf(cepInfo.getUf());
        }

        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());

        if (request.isPrincipal() && !endereco.isPrincipal()) {
            desmarcarPrincipalAtual(endereco.getUsuario().getId());
            endereco.setPrincipal(true);
        }

        return new EnderecoResponse(enderecoRepository.save(endereco));
    }

    @Transactional
    public EnderecoResponse definirComoPrincipal(Long enderecoId) {
        Endereco endereco = buscarEndereco(enderecoId);
        if (!endereco.isPrincipal()) {
            desmarcarPrincipalAtual(endereco.getUsuario().getId());
            endereco.setPrincipal(true);
            enderecoRepository.save(endereco);
        }
        return new EnderecoResponse(endereco);
    }

    @Transactional
    public void excluir(Long enderecoId) {
        Endereco endereco = buscarEndereco(enderecoId);
        Long usuarioId = endereco.getUsuario().getId();
        boolean eraPrincipal = endereco.isPrincipal();

        enderecoRepository.delete(endereco);

        if (eraPrincipal) {
            promoverNovoPrincipal(usuarioId);
        }
    }

    /** Garante que nenhum outro endereco do usuario continue marcado como principal. */
    private void desmarcarPrincipalAtual(Long usuarioId) {
        enderecoRepository.findByUsuarioIdAndPrincipalTrue(usuarioId).ifPresent(atual -> {
            atual.setPrincipal(false);
            enderecoRepository.save(atual);
        });
    }

    /** Apos exclusao/alteracao do principal, promove automaticamente o endereco restante mais antigo. */
    private void promoverNovoPrincipal(Long usuarioId) {
        List<Endereco> restantes = enderecoRepository.findByUsuarioIdOrderByIdAsc(usuarioId);
        if (!restantes.isEmpty()) {
            Endereco novoPrincipal = restantes.get(0);
            novoPrincipal.setPrincipal(true);
            enderecoRepository.save(novoPrincipal);
        }
    }

    private Usuario buscarUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado: " + usuarioId));
    }

    private Endereco buscarEndereco(Long enderecoId) {
        return enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new ResourceNotFoundException("Endereco nao encontrado: " + enderecoId));
    }

    /**
     * Mantém a fonte oficial como padrão. Em uma indisponibilidade temporária,
     * aceita os dados completos informados manualmente para não interromper a operação.
     */
    private CepResponse resolverEndereco(EnderecoRequest request) {
        try {
            return viaCepService.buscarCep(request.getCep());
        } catch (RuntimeException exception) {
            if (isBlank(request.getLogradouro()) || isBlank(request.getBairro())
                    || isBlank(request.getCidade()) || isBlank(request.getUf())) {
                throw exception;
            }
            CepResponse manual = new CepResponse();
            manual.setCep(request.getCep());
            manual.setLogradouro(request.getLogradouro());
            manual.setBairro(request.getBairro());
            manual.setLocalidade(request.getCidade());
            manual.setUf(request.getUf().toUpperCase());
            return manual;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
