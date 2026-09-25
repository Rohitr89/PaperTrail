package com.example.PaperTrail.Controller;

import com.example.PaperTrail.Model.User;
import com.example.PaperTrail.Model.UserPreferences;
import com.example.PaperTrail.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        // The userService.getUserProfile ensures preferences are initialized
        User user = userService.getUserProfile(currentUser.getUsername());

        // We return a map to include preferences and the user entity
        return ResponseEntity.ok(Map.of(
            "user", user,
            "preferences", userService.updatePreferences(user.getId(), Map.of()) // returns current prefs
        ));
    }

    @PatchMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, Boolean> preferences) {

        UserPreferences updatedPrefs = userService.updatePreferences(currentUser.getId(), preferences);
        return ResponseEntity.ok(updatedPrefs);
    }
}
