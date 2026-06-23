package com.example.PaperTrail.Repository;

import com.example.PaperTrail.Model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, String> {

//    List all the document by owner id
    List<Document> findByOwnerId(String ownerId);

//    get the document based on storage alias
    Optional<Document> findByStorageAlias(String storageAlias);


}
