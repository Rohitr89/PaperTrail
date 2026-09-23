package com.example.PaperTrail.Service;

import org.springframework.stereotype.Service;

//@Service
public record CryptoResult(byte[] cipherText, String base64iv) {

}
