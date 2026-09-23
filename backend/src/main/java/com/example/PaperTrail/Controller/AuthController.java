package com.example.PaperTrail.Controller;

import com.example.PaperTrail.DTO.Request.LoginRequest;
import com.example.PaperTrail.DTO.Request.RegisterRequest;
import com.example.PaperTrail.DTO.Response.AuthResponse;
import com.example.PaperTrail.Model.User;
import com.example.PaperTrail.Repository.UserRepository;
import com.example.PaperTrail.Security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Public entry point for the app: the only two endpoints a user can hit before they have a token.
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    // BCrypt one-way hashes passwords — you can check a password against it, but never reverse it.
    // Instantiated directly here for now since SecurityConfig (where this normally lives as a shared bean)
    // doesn't exist yet. We'll move it there once that file exists.

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request){
//         Check for an existing username BEFORE hitting the DB's unique constraint —
//         gives a clean 409 response instead of leaking a raw SQL exception to the client.
        if(userRepository.existsByUsername(request.getUsername())){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken");
        }

//         If username doesn't already take in DB then create a new user and register in DB
        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : "USER")
                .build();

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("User Registered Successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
//        Checks if user exists in DB or not
        User user = userRepository.findByUsername(request.getUsername()).orElse(null);

//        If it doesn't exist then return an unauthorized request
        if(user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Username and Password");
        }
        String token = jwtUtils.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
