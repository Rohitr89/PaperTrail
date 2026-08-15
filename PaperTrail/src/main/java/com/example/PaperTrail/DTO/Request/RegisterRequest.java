package com.example.PaperTrail.DTO.Request;

import lombok.Data;

// What the client sends us to create an account
@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String role;
}
