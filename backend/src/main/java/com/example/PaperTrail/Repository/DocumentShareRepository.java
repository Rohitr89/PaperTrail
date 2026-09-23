package com.example.PaperTrail.Repository;

import com.example.PaperTrail.Model.DocumentShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentShareRepository extends JpaRepository<DocumentShare, Long> {

//     Verify if a specific file shard with the specific User or not.
    Optional<DocumentShare> findByDocumentIdAndSharedWithUserId(String documentId, String sharedWithUserId);

//     List all shared records mapped to a specific recipitant user.
    List<DocumentShare> findBySharedWithUserId(String sharedWithUserId);

//     Checks whether a shared mapping exists of a user and document before deletes it.
    boolean existsByDocumentIdAndSharedWithUserId(String documentId, String sharedWithUserId);

//     Removes every share record tied to a document — used when the document itself is deleted,
//     so no orphaned share rows point at a document that no longer exists.
    void deleteByDocumentId(String documentId);

}
