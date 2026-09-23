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

import java.util.List;
@Service
@RequiredArgsConstructor
public class DocumentShareService {

    private final DocumentShareRepository documentShareRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final AuditLogService  auditLogService;

    /**
     * Grants access to a document for a specific target user.
     *
     * @param documentId       ID of the file to share
     * @param recipientUsername Username of the user receiving access
     * @param permissionLevel  "VIEW" or "EDIT"
     * @param owner            Currently authenticated owner user
     */

    @Transactional
    public DocumentShare shareDocument(String documentId, String recipientUsername, String permissionLevel, User owner){
//      1. Fetch document and verifies existence
        Document document = documentRepository.findById(documentId)
                .orElseThrow(
                        () -> new IllegalArgumentException("Document not found in registry. ")
                );

//      2. Ownership checks : Only the user can share the document
        if(!document.getOwner().getId().equals(owner.getId())){
            auditLogService.logAction(owner.getId(), 
                    "UNAUTHORIZED_SHARE_ATTEMPT", 
                    documentId,
                    "User attempt to share a document that they do not own"
            );
            throw new SecurityException("Access Denied: Only the file owner can modify sharing Permission.");
        }
//      3.  Lookup recipient User
        User recipient = userRepository.findByUsername(recipientUsername)
                .orElseThrow(
                        () -> new IllegalArgumentException("Target recipient username : " + recipientUsername + " doesn't exist")
                );

//      4. Prevent Self Sharing
        if(recipient.getId().equals(owner.getId())){
            throw new IllegalArgumentException("Invalid action : Owner and Recipient cannot be same");
        }

//      5. Update Permission if document already shared or create new DocumentShare entry
        DocumentShare share = documentShareRepository.findByDocumentIdAndSharedWithUserId(documentId, recipient.getId())
                .orElseGet(() -> DocumentShare.builder()
                        .document(document)
                        .sharedWithUser(recipient)
                        .build());
        share.setPermissionLevel(permissionLevel.toUpperCase());
        DocumentShare savedShare = documentShareRepository.save(share);

//      6. Audit Trail
        auditLogService.logAction(
                owner.getId(),
                "DOCUMENT_SHARE_GRANTED",
                documentId,
                "Granted " + permissionLevel + " access to user: " + recipientUsername
        );
        return savedShare;
        /**
         * Retrieves all document shared records where the given user is the recipient.
         */
    }
    @Transactional(readOnly = true)
    public List<DocumentShare> getDocumentsSharedWithUser(String userId){
        return documentShareRepository.findBySharedWithUserId(userId);
    }
    /**
     * Revokes access for a recipient user
     */

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
