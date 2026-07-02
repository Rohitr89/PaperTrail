package com.example.PaperTrail.Service;

import com.example.PaperTrail.Model.Document;
import com.example.PaperTrail.Model.User;
import com.example.PaperTrail.Repository.DocumentRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final CryptographyService cryptographyService;
    private final AuditLogService auditlogService;

    /**
     * SECURE UPLOAD PIPELINE
     * 1. Intercepts raw file stream from client.
     * 2. Scrambles bytes on the fly in volatile RAM (AES-256 GCM).
     * 3. Writes encrypted block to disk under an anonymous UUID alias.
     * 4. Commits metadata maps (original filename, file size, owner, unique IV) to MySQL.
     */
    @Transactional
    public Document uploadDocument(MultipartFile file, User currentUser) throws IOException {
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

    @Transactional(readOnly = true)
    public byte[] downloadDocument(String documentId, User currentUser) throws IOException{
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
     * Secure listing helper to return all metadata rows owned by a specific user profile.
     */
    @Transactional(readOnly = true)
    public List<Document> getUserDocuments(String userId){
        return documentRepository.findByOwnerId(userId);
    }

}
