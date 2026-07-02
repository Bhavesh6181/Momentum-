package com.momentum.backend.security;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private static class Bucket {
        private final int capacity;
        private final long refillTimeMs;
        private double tokens;
        private long lastRefillTime;

        public Bucket(int capacity, long refillTimeMs) {
            this.capacity = capacity;
            this.refillTimeMs = refillTimeMs;
            this.tokens = capacity;
            this.lastRefillTime = System.currentTimeMillis();
        }

        public synchronized boolean tryAcquire() {
            refill();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            long timePassed = now - lastRefillTime;
            double tokensToAdd = ((double) timePassed / refillTimeMs) * capacity;
            if (tokensToAdd > 0) {
                tokens = Math.min(capacity, tokens + tokensToAdd);
                lastRefillTime = now;
            }
        }
    }

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean isAllowed(String key, int maxRequests, long periodMs) {
        Bucket bucket = buckets.computeIfAbsent(key, k -> new Bucket(maxRequests, periodMs));
        return bucket.tryAcquire();
    }
}
