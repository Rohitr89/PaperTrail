package com.example.PaperTrail.Service;

import com.example.PaperTrail.Model.Document;
import com.example.PaperTrail.Model.DocumentShare;
import com.example.PaperTrail.Model.User;
import com.example.PaperTrail.Repository.AuditLogRepository;
import com.example.PaperTrail.Repository.DocumentRepository;
import com.example.PaperTrail.Repository.DocumentShareRepository;
import com.example.PaperTrail.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentShareService {

    private final DocumentShareRepository documentShareRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final AuditLogService  auditLogService;

    @Transactional
    public DocumentShare shareDocument(String documentId, String recipientUsername, String permissionLevel, User owner){
        Document document = documentRepository.findById(documentId)
                .orElseThrow(
                        () -> new IllegalArgumentException("Document not found in registry. ")
                );

        if(!document.getOwner().getId().equals(owner.getId())){
            auditLogService.logAction(owner.getId(),
                    "UNAUTHORIZED_SHARE_ATTEMPT",
                    documentId,
                    "User attempt to share a document that they do not own"
            );
            throw new SecurityException("Access Denied: Only the file owner can modify sharing Permission.");
        }

        User recipient = userRepository.findByUsername(recipientUsername)
                .orElseThrow(
                        () -> new IllegalArgumentException("Target recipient username : " + recipientUsername + " doesn't exist")
                );

        if(recipient.getId().equals(owner.getId())){
            throw new IllegalArgumentException("Invalid action : Owner and Recipient cannot be same");
        }

        DocumentShare share = documentShareRepository.findByDocumentIdAndSharedWithUserId(documentId, recipient.getId())
                .orElseGet(() -> DocumentShare.builder()
                        .document(document)
                        .sharedWithUser(recipient)
                        .build());
        share.setPermissionLevel(permissionLevel.toUpperCase());
        DocumentShare savedShare = documentShareRepository.save(share);

        auditLogService.logAction(
                owner.getId(),
                "DOCUMENT_SHARE_GRANTED",
                documentId,
                "Granted " + permissionLevel + " access to user: " + recipientUsername
        );
        return savedShare;
    }

    @Transactional(readOnly = true)
    public List<DocumentShare> getDocumentsSharedWithUser(String userId){
        // The API currently returns the DocumentShare objects.
        // We must ensure that the User and Document are fetched correctly.
        return documentShareRepository.findBySharedWithUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<DocumentShare> getSharesForDocument(String documentId){
        return documentShareRepository.findByDocumentId(documentId);
    }

    @Transactional
    public void revokeShare(String documentId, String recipientId, User owner){
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found."));
        if(!document.getOwner().getId().equals(owner.getId())){
            throw new IllegalArgumentException("Access Denied : Only the user have access to revoke permission ");
        }
        DocumentShare share = documentShareRepository.findByDocumentIdAndSharedWithUserId(documentId, recipientId)
                        .orElseThrow(() -> new IllegalArgumentException("No Active shared node found between document and recipient "));
        documentShareRepository.delete(share);

        auditLogService.logAction(owner.getId(), "DOCUMENT_SHARE_REVOKED",documentId, "Revoked sharing access for user id : " + recipientId );
    }
}
