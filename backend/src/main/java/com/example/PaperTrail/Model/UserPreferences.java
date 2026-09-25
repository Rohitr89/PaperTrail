package com.example.PaperTrail.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferences {
    @Id
    private String id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private boolean pushNotificationsEnabled = true;

    private boolean isPublicProfile = false;

    private boolean autoRenewVault = false;
}
