package com.example.PaperTrail.Security;

import com.example.PaperTrail.Model.Document;
import com.example.PaperTrail.Model.DocumentShare;
import com.example.PaperTrail.Repository.DocumentRepository;
import com.example.PaperTrail.Repository.DocumentShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component("documentAuthGuard")
@RequiredArgsConstructor
public class DocumentAuthGuard {
    private final DocumentRepository documentRepository;
    private final DocumentShareRepository documentShareRepository;

    @Transactional(readOnly = true)
    public boolean canRead(String documentId, String userId){
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if(docOpt.isEmpty()){
            return false;
        }

        Document doc = docOpt.get();

//      1. Is the user the explicit user
        if(doc.getOwner().getId().equals(userId)){
            return true;
        }
//      2. Has the document being explicitly shared with this user?.
        return documentShareRepository.findByDocumentIdAndSharedWithUserId(documentId, userId).isPresent();

    }

    @Transactional(readOnly = true)
    public boolean canEdit(String documentId, String userId){
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if(docOpt.isEmpty()){
            return false;
        }

        Document doc = docOpt.get();

        if(doc.getOwner().getId().equals(userId)){
            return true;
        }

        Optional<DocumentShare> shareOpt = documentShareRepository.findByDocumentIdAndSharedWithUserId(documentId,userId);
        return shareOpt.isPresent() && "EDIT".equalsIgnoreCase(shareOpt.get().getPermissionLevel());
    }
}
