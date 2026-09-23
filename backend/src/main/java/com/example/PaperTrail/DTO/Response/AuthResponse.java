package com.example.PaperTrail.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Data;

// What we send back after a successful login — just the token
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
}
