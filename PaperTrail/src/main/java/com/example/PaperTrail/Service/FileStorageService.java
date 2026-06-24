package com.example.PaperTrail.Service;


import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;

     /**
      * PAPER TRAIL: Physical File Storage Service
      * Handles direct, low-level I/O operations on the physical disk.
      * * * Systems-Level Advantage:
      * - Enforces path normalization: absolute rejection of directory traversal attacks (../).
      * - Directory Isolation: automatically provisions secure workspace directories upon system boot.
      */
@Service
public class FileStorageService {
    private final Path storageDirectory;

    /**
     * Constructor injecting the target storage path from application.properties.
     * Defaults to an isolated "vault_storage" directory in the user's home path.
     */
    public FileStorageService(@Value("${vault.storage.directory:${user.home}/vault_storage}") String storageDir){
        this.storageDirectory = Paths.get(storageDir).toAbsolutePath().normalize();
    }

    /**
     * Boot-Time Verification:
     * Guarantees the storage directory physically exists before the system accepts traffic.
     * Prevents runtime FileNotFoundExceptions.
     */
    @PostConstruct
    public void init(){
        try{
            Files.createDirectories(storageDirectory);
        }catch(IOException e){
            throw new IllegalStateException("Critical System failure : Unable to inilialize physical storage directory at " + storageDirectory, e);
        }
    }
    /**
     * Physical Write Execution:
     * Writes raw encrypted bytes directly to disk.
     *
     * @param storageAlias The unique random UUID mapped to this document.
     * @param cipherBytes  The AES-256 GCM encrypted byte array.
     **/
    public void write(String storageAlias, byte[] cypherBytes) throws IOException{
//        Defensive check: Checking path traversal injection
        Path targetPath = storageDirectory.resolve(storageAlias).normalize();
        if(!targetPath.getParent().equals(storageDirectory)){
            throw new SecurityException("Exploit Detected : Path traversal boundary violaion attempted! ");
        }
//        Atomic writing alternative: Write raw cipher bytes directly to physical disk block
        Files.write(targetPath,cypherBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }
    /**
     * Physical Read Execution:
     * Reads raw encrypted bytes directly from disk.
     *
     * @param storageAlias The unique random UUID mapped to this document.
     * @return Encrypted ciphertext byte array.
     */
    public byte[] read(String storageAlias) throws IOException{
        Path targetPath = storageDirectory.resolve(storageAlias).normalize();
//        Checking  path traversal injection
        if(!targetPath.getParent().equals(storageDirectory)){
            throw new SecurityException("Exploit Detected : Path traversal boundary violaion attempted! ");
        }
//        If files doesnt not exists
        if(!Files.exists(targetPath)){
            throw new NoSuchFileException("Target resource doesn't exist on physical storage block");
        }
//        If files exists then read all Bytes and return it.
        return Files.readAllBytes(targetPath);
    }

    /**
     * Physical Purge Execution:
     * Irreversibly deletes raw encrypted file blocks from disk.
     *
     * @param storageAlias The unique random UUID mapped to this document.
     */
    public void delete(String storageAlias) throws IOException{
        Path targetPath  = storageDirectory.resolve(storageAlias).normalize();
        if(!targetPath.getParent().equals(storageDirectory)){
            throw new SecurityException("Exploit Detected : Path traversal boundary voilaion attempted! ");
        }
//        Delete the file if file exists
        Files.deleteIfExists(targetPath);
    }
}
