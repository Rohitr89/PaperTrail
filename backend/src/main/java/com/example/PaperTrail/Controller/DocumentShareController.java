package com.example.PaperTrail.Controller;

import com.example.PaperTrail.Model.DocumentShare;
import com.example.PaperTrail.Model.User;
import com.example.PaperTrail.Service.DocumentShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentShareController {
    private final DocumentShareService documentShareService;

    @PostMapping("/grant")
    public ResponseEntity<?> shareDocument(
            @RequestBody Map<String,String> request,
            @AuthenticationPrincipal User currentUser){
        try{
            String documentId = request.get("documentId");
            String recipientUsername = request.get("recipientUsername");
            String permissionLevel = request.getOrDefault("permissionLevel", "VIEW");

            DocumentShare share = documentShareService.shareDocument(documentId,recipientUsername, permissionLevel, currentUser);
            return ResponseEntity.ok(share);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/shared-with-me")
    public ResponseEntity<List<DocumentShare>> ListSharedWithMe(@AuthenticationPrincipal User currentUser){
        List<DocumentShare> shares = documentShareService.getDocumentsSharedWithUser(currentUser.getId());
        return ResponseEntity.ok(shares);
    }

    @DeleteMapping("/revoke/{documentId}/{recipientUserId}")
    public ResponseEntity<?> revokeShare(
            @PathVariable("documentId") String documentId,
            @PathVariable("recipientUserId") String recipientUserId,
            @AuthenticationPrincipal User currentUser){
        try{
            documentShareService.revokeShare(documentId,recipientUserId, currentUser);
            return ResponseEntity.ok(Map.of("message", "Sharing permission successfully revoked"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("Error", e.getMessage()));
        }
    }

}
