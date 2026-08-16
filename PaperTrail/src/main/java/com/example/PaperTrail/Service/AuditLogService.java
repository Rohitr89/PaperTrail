package com.example.PaperTrail.Service;

import com.example.PaperTrail.Model.AuditLog;
import com.example.PaperTrail.Repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public void logAction(String userId, String action, String documentId, String details) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .documentId(documentId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }
}
