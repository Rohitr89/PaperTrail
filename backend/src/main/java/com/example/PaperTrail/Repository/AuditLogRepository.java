package com.example.PaperTrail.Repository;

import com.example.PaperTrail.Model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

//    Retrieve audit trails for a specific users.
    List<AuditLog> findByUserIdOrderByTimestampDesc(String userId);

//    Retrieve Logs filtered By severe action
    List<AuditLog> findByActionOrderByTimestampDesc(String  action);

}
