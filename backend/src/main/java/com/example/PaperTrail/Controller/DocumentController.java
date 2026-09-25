package com.example.PaperTrail.Controller;

import com.example.PaperTrail.Model.Document;
import com.example.PaperTrail.Model.User;
import com.example.PaperTrail.Service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping(value ="/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "relativePath", required = false) String relativePath,
            @AuthenticationPrincipal User currentUser) throws IOException {
        Document savedDoc = documentService.uploadDocument(file, currentUser, relativePath);
        return new ResponseEntity<>(savedDoc, HttpStatus.CREATED);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable("id") String documentId,
            @AuthenticationPrincipal User currentUser) throws IOException {

        Document doc = documentService.findById(documentId);

        byte[] rawBytes = documentService.downloadDocument(documentId, currentUser);

        String fileName = doc.getOriginalFileName().toLowerCase();
        String contentType = "application/octet-stream";
        if (fileName.endsWith(".pdf")) contentType = "application/pdf";
        else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (fileName.endsWith(".png")) contentType = "image/png";
        else if (fileName.endsWith(".txt")) contentType = "text/plain";
        else if (fileName.endsWith(".gif")) contentType = "image/gif";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getOriginalFileName() + "\"")
                .body(rawBytes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(
            @PathVariable("id") String documentId,
            @AuthenticationPrincipal User currentUser) throws IOException {
        documentService.deleteDocument(documentId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Document>> listMyDocuments(@AuthenticationPrincipal User currentUser) {
        List<Document> documents = documentService.getUserDocuments(currentUser.getId());
        return ResponseEntity.ok(documents);
    }
}
