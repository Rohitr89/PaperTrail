package com.example.PaperTrail.Service;

import com.example.PaperTrail.Model.Document;
import com.example.PaperTrail.Model.User;
import com.example.PaperTrail.Repository.DocumentRepository;
import com.example.PaperTrail.Repository.DocumentShareRepository;
import com.example.PaperTrail.Security.DocumentAuthGuard;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final CryptographyService cryptographyService;
    private final AuditLogService auditlogService;
    private final DocumentAuthGuard documentAuthGuard;
    private final DocumentShareRepository documentShareRepository;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-document.wordprocessingml.document", // .docx
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-powerpoint", // .ppt
            "application/vnd.openxmlformats-presentationml.presentation", // .pptx
            "application/rtf",
            "text/plain",
            "text/csv",
            "text/markdown",
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/gif",
            "image/svg+xml"
    );

    @Transactional
    public Document uploadDocument(MultipartFile file, User currentUser, String relativePath) throws IOException {
        if(!ALLOWED_CONTENT_TYPES.contains(file.getContentType())){
            throw new IllegalArgumentException("File type not allowed. Only professional documents and images are permitted ");
        }
        if(file.isEmpty()){
            throw new IllegalArgumentException("Cannot upload an empty file block");
        }

        // Use the relativePath provided by the frontend to preserve folder structure
        String originalFileName = (relativePath != null && !relativePath.isEmpty())
                                   ? relativePath
                                   : file.getOriginalFilename();

        String storageAlias = UUID.randomUUID().toString();
        long fileSize = file.getSize();

        byte[] rawBytes = file.getBytes();
        CryptoResult cryptoResult = cryptographyService.encrypt(rawBytes);

        fileStorageService.write(storageAlias, cryptoResult.cipherText());

        Document document = Document.builder()
                .owner(currentUser)
                .originalFileName(originalFileName)
                .storageAlias(storageAlias)
                .encryptionIv(cryptoResult.base64iv())
                .fileSize(fileSize)
                .build();

        Document savedDoc = documentRepository.save(document);

        auditlogService.logAction(
                currentUser.getId(),
                "FILE_UPLOAD",
                savedDoc.getId(),
                "Successfully encrypted and store file " + originalFileName
        );
        return savedDoc;
    }

    @Transactional
    public byte[] downloadDocument(String documentId, User currentUser) throws IOException{
        if(!documentAuthGuard.canRead(documentId, currentUser.getId())){
            throw new AccessDeniedException("You dont have permission to access this file ");
        }

        Document document = findById(documentId);

        byte[] cypherBytes = fileStorageService.read(document.getStorageAlias());
        byte[] decryptedBytes = cryptographyService.decrypt(cypherBytes, document.getEncryptionIv());

        auditlogService.logAction(
                currentUser.getId(),
                "FILE_DECRYPT_STREAMED",
                document.getId(),
                "Decrypted and streamed file resource: " + document.getOriginalFileName()
        );
        return decryptedBytes;
    }

    @Transactional
    public void deleteDocument(String documentId, User currentUser) throws IOException{
        Document document = findById(documentId);
        if(!document.getOwner().getId().equals(currentUser.getId())){
            throw new AccessDeniedException("Only the document owner can delete the file ");
        }
        documentShareRepository.deleteByDocumentId(documentId);
        fileStorageService.delete(document.getStorageAlias());
        documentRepository.delete(document);

        auditlogService.logAction(
                currentUser.getId(),
                "FILE_DELETE",
                documentId,
                "Permanently deleted file: " + document.getOriginalFileName()
        );
    }

    @Transactional(readOnly = true)
    public List<Document> getUserDocuments(String userId){
        return documentRepository.findByOwnerId(userId);
    }

    /**
     * Internal helper to fetch a document by ID regardless of ownership.
     * Authorization is handled separately by DocumentAuthGuard.
     */
    public Document findById(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found in Vault registry"));
    }
}
