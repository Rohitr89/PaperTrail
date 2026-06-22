package com.example.PaperTrail.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "user_id")
    private String userId;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(name = "document_id")
    private String documentId;

    @Column(length = 500)
    private String details;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
