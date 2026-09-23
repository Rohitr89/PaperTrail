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
//import java.nio.file.AccessDeniedException;
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

    /**
     * SECURE UPLOAD PIPELINE
     * 1. Intercepts raw file stream from client.
     * 2. Scrambles bytes on the fly in volatile RAM (AES-256 GCM).
     * 3. Writes encrypted block to disk under an anonymous UUID alias.
     * 4. Commits metadata maps (original filename, file size, owner, unique IV) to MySQL.
     */
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "text/plain",
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic"
    );
    @Transactional
    public Document uploadDocument(MultipartFile file, User currentUser) throws IOException {

        if(!ALLOWED_CONTENT_TYPES.contains(file.getContentType())){
            throw new IllegalArgumentException("File type not allowed. Only Pdf, Word document, plain text & Images are permitted ");
        }
        if(file.isEmpty()){
            throw new IllegalArgumentException("Cannot upload an empty file block");
        }
//        1. Generate clean metadata obfuscation names.
        String originalFileName = file.getOriginalFilename();
        String storageAlias = UUID.randomUUID().toString();
        long fileSize = file.getSize();

//        2. Cryptography Scrambling in volatile memory(RAM)
        byte[] rawBytes = file.getBytes();
        CryptoResult cryptoResult = cryptographyService.encrypt(rawBytes);

//        3. Physical storage write (using the clean write() method we created.)
        fileStorageService.write(storageAlias, cryptoResult.cipherText());

//        DB ledger mapping using hibernate
        Document document = Document.builder()
                .owner(currentUser)
                .originalFileName(originalFileName)
                .storageAlias(storageAlias)
                .encryptionIv(cryptoResult.base64iv())
                .fileSize(fileSize)
                .build();

        Document savedDoc = documentRepository.save(document);

//        Audit log Registration
        auditlogService.logAction(
                currentUser.getId(),
                "FILE_UPLOAD",
                savedDoc.getId(),
                "Successfully encrypted and store file " + originalFileName
        );
        return savedDoc;
    }

    /**
     * SECURE RETRIEVAL PIPELINE
     * 1. Pulls file maps from MySQL.
     * 2. Loads scrambled raw bytes from physical disk.
     * 3. Descrambles bytes in transient RAM (AES-256 GCM using the file's unique IV).
     * 4. Streams clear bytes to network controller response wrapper.
     */

    @Transactional
    public byte[] downloadDocument(String documentId, User currentUser) throws IOException{
        if(!documentAuthGuard.canRead(documentId, currentUser.getId())){
            throw new AccessDeniedException("You dont have permission to access this file ");
        }

//        Fetch metadata coordinates and fail safely
        Document document = documentRepository.findById(documentId)
                .orElseThrow(()-> new IllegalArgumentException("Document not found in Vault registry")
                );

//        2. Load scrambled file block from physical disk
        byte[] cypherBytes = fileStorageService.read(document.getStorageAlias());

//        Volatile RAM decryption (The unencrypted bytes never touch the hard disk!)
        byte[] decryptedBytes = cryptographyService.decrypt(cypherBytes, document.getEncryptionIv());

//        Security audit registration
        auditlogService.logAction(
                currentUser.getId(),
                "FILE_DECRYPT_STREAMED",
                document.getId(),
                "Decrypted and streamed file resource: " + document.getOriginalFileName()
        );
        return decryptedBytes;
    }

    /**
     * SECURE DELETE PIPELINE
     * Only the owner can delete a document. Removes, in order:
     * 1. Any active shares pointing at this document (avoids orphaned rows)
     * 2. The encrypted file itself, off physical disk
     * 3. The metadata row from the database
     */
    @Transactional
    public void deleteDocument(String documentId, User currentUser) throws IOException{
//        Check does the document exist or not
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found in Vault"));
//        Check whether the delete request is sent by documentOwner or any other
        if(!document.getOwner().getId().equals(currentUser.getId())){
            throw new AccessDeniedException("Only the document owner can delete the file ");
        }
//        Delete the document to whomsoever this document is shared
        documentShareRepository.deleteByDocumentId(documentId);
//        Delete the documentAlias and delete that from vault too.
        fileStorageService.delete(document.getStorageAlias());
        documentRepository.delete(document);
//        Create a file deletion Log
        auditlogService.logAction(
                currentUser.getId(),
                "FILE_DELETE",
                documentId,
                "Permanently deleted file: " + document.getOriginalFileName()
        );

    }
    /**
     * Secure listing helper to return all metadata rows owned by a specific user profile.
     */
    @Transactional(readOnly = true)
    public List<Document> getUserDocuments(String userId){
        return documentRepository.findByOwnerId(userId);
    }

}
