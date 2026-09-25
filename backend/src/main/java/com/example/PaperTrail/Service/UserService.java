package com.example.PaperTrail.Service;

import com.example.PaperTrail.Model.User;
import com.example.PaperTrail.Model.UserPreferences;
import com.example.PaperTrail.Repository.UserPreferencesRepository;
import com.example.PaperTrail.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;

    public User getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (preferencesRepository.findById(user.getId()).isEmpty()) {
            UserPreferences prefs = UserPreferences.builder()
                    .user(user)
                    .build();
            preferencesRepository.save(prefs);
        }

        return user;
    }

    @Transactional
    public UserPreferences updatePreferences(String userId, Map<String, Boolean> updates) {
        UserPreferences prefs = preferencesRepository.findById(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    return UserPreferences.builder().user(user).build();
                });

        if (updates != null) {
            if (updates.containsKey("pushNotificationsEnabled")) {
                prefs.setPushNotificationsEnabled(updates.get("pushNotificationsEnabled"));
            }
            if (updates.containsKey("isPublicProfile")) {
                // Lombok generates setPublicProfile for a boolean field named isPublicProfile
                prefs.setPublicProfile(updates.get("isPublicProfile"));
            }
            if (updates.containsKey("autoRenewVault")) {
                prefs.setAutoRenewVault(updates.get("autoRenewVault"));
            }
        }

        return preferencesRepository.save(prefs);
    }
}
