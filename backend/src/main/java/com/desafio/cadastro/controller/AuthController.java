package com.desafio.cadastro.controller;

import com.desafio.cadastro.dto.LoginRequest;
import com.desafio.cadastro.dto.LoginResponse;
import com.desafio.cadastro.dto.UsuarioRegisterRequest;
import com.desafio.cadastro.dto.UsuarioResponse;
import com.desafio.cadastro.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody UsuarioRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
