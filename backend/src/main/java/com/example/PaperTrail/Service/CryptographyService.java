package com.example.PaperTrail.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class CryptographyService {
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128; //authentication tag size in bits (16*7 =128 bits)
    private static final int IV_LENGTH_BYTES = 12; //Recommend IV length for GCM (96/8=12 bytes)

    private final SecretKey masterKey;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Constructor loads the base64 encoded master key from application.properties
     * and validates that it is exactly 256 bits (32 bytes) long on startup.
     */

    public CryptographyService(@Value("${vault.crypto.master-key}")String base64masterKey){
        try{
            byte[] decodedKey = Base64.getDecoder().decode(base64masterKey);
            if(decodedKey.length != 32){
                throw new IllegalArgumentException("AES key must be exactly 256 bits (32 bytes) long");
            }
            this.masterKey = new SecretKeySpec(decodedKey,"AES");
        }catch(Exception e){
            throw new IllegalStateException("Failed to initialize master-key. Ensure vault.crypto.master-key is a valid 256-bit Base 64 string inside application.properties", e);
        }
    }
    /**
     * INGESTION: Scrambles raw uploaded bytes into ciphertext.
     * Generates a completely unique, randomized IV for this specific transaction.
     *
     * @param rawBytes Plain file bytes loaded from the Multipart request.
     * @return A CryptoResult containing the encrypted bytes and the base64-encoded IV.
     */
    public CryptoResult encrypt(byte[] rawBytes){
        try{
//            Generate a complete random 12-byte initialization vector (salt)
            byte[] iv =new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

//            Initialize the cryptography cipher for AES/GCM
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH,iv);
            cipher.init(Cipher.ENCRYPT_MODE,masterKey,parameterSpec);

//            Scramble the bytes in volatile Ram
            byte[] cipherText = cipher.doFinal(rawBytes);

//            Encode the IV to base64 so we can easily save it as a text string in MySQL
            String base64Iv = Base64.getEncoder().encodeToString(iv);

//            Wrap both item inside our lightweight safe box
            return new CryptoResult(cipherText, base64Iv);
        } catch (Exception e) {
            throw new SecurityException("Security failure: Encryption pipeline failed inside RAM. ", e);
        }
    }
    /**
     * RETRIEVAL: Descrambles scrambled cipher bytes back into plain file bytes inside RAM.
     *
     * @param cipherBytes Encrypted bytes fetched from physical disk storage.
     * @param base64Iv    The original Base64-encoded IV retrieved from MySQL metadata.
     * @return Clean raw unencrypted bytes streamed directly to the network.
     */
    public byte[] decrypt(byte[] cipherBytes, String base64Iv){
        try{
//            Convert the base64 IV bytes back into raw bytes
            byte[] iv = Base64.getDecoder().decode(base64Iv);

//            Initialize the cipher for decryption using our master key and the file's original IV
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, masterKey, parameterSpec);

//            Decrypt the bytes and verify the GCM integrity tag
            return cipher.doFinal(cipherBytes);
        } catch (Exception e) {
            throw new SecurityException("Security Alert: File decryption failed! The encrypted block has been modified or corrupted on disk.", e);
        }
    }
}
