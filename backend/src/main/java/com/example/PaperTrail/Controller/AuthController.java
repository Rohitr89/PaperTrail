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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request){
        if(userRepository.existsByUsername(request.getUsername())){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken");
        }
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
        User user = userRepository.findByUsername(request.getUsername()).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Username and Password");
        }
        String token = jwtUtils.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/exists/{username}")
    public ResponseEntity<?> checkUserExists(@PathVariable String username) {
        boolean exists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User currentUser) {

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Both current and new passwords are required"));
        }

        // 1. Verify current password
        if (!passwordEncoder.matches(currentPassword, currentUser.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "The current password provided is incorrect"));
        }

        // 2. Update with new encrypted password
        currentUser.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(currentUser);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
