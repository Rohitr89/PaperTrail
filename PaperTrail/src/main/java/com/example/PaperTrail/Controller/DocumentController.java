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

import java.awt.*;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")//Allows React to tak to this API
public class DocumentController {
    private final DocumentService documentService;

    /**
     * Upload Document
     * Receives a file from the frontend via an HTTP POST request
    */
    @PostMapping(value ="/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> uploadFile(
            @RequestParam("file")MultipartFile file,
            @AuthenticationPrincipal User currentUser) throws IOException{
//        Hand the file to the master coordinator pipeline
        Document savedDoc = documentService.uploadDocument(file,currentUser);

        return new ResponseEntity<>(savedDoc, HttpStatus.CREATED);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable("id") String documentId,
            @AuthenticationPrincipal User currentUser) throws IOException{
//        Process security authorization and decrypt data inside Ram
        byte[] rawBytes = documentService.downloadDocument(documentId, currentUser);
//        wrap the plain binary data inside a proper HTTP stream response
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)//Tells browser this is a file stream
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"vault_download.dec\"")
                .body(rawBytes);
    }

/**
        * SECURE LISTING ENDPOINT
     * Fetches all metadata maps belonging strictly to the currently logged-in user.
            * Prevents cross-tenant leak vectors because we resolve IDs directly from the secure authentication context.
     * * How it works conceptually:
            * - Frontend makes an HTTP GET request to "/api/documents" with their JWT attached.
            * - `@AuthenticationPrincipal` intercepts the request and extracts the verified User object.
     * - We pass `currentUser.getId()` to our query method to retrieve ONLY their items.
     */
    @GetMapping
    public ResponseEntity<List<Document>> listMyDocuments(@AuthenticationPrincipal User currentUser) {
        // Query the orchestrator mapping strictly for the active user's UUID
        List<Document> documents = documentService.getUserDocuments(currentUser.getId());

        // Return 200 OK along with the array list of document references
        return ResponseEntity.ok(documents);
    }


}
