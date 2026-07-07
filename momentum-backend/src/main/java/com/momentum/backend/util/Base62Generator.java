package com.momentum.backend.util;

import java.security.SecureRandom;

public final class Base62Generator {

    private static final String BASE62_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private Base62Generator() {
        // Utility class
    }

    public static String generateCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = RANDOM.nextInt(BASE62_CHARACTERS.length());
            sb.append(BASE62_CHARACTERS.charAt(index));
        }
        return sb.toString();
    }
}
