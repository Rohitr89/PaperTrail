package com.example.PaperTrail.DTO.Request;

import lombok.Data;

// What the client sends us to log in
@Data
public class LoginRequest {
    private String username;
    private String password;
}
