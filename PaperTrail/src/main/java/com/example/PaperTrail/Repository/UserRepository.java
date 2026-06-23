package com.example.PaperTrail.Repository;

import com.example.PaperTrail.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,String> {

    Optional<User> findByUsername(String username);

    /**
     * Threat Mitigation: Check if username already exists during ingestion registration
     * before hitting DB unique constraints.
     */
    boolean existsByUsername(String username);
}
