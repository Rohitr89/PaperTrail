package com.example.PaperTrail.Repository;

import com.example.PaperTrail.Model.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, String> {
}
