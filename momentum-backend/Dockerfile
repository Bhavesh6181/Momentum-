# ── Stage 1: Build with Gradle ──────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy gradle wrapper and dependency manifests first (Docker layer cache)
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle ./gradle

# Download dependencies (cached unless build files change)
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon --quiet 2>/dev/null || true

# Copy source and build
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test

# ── Stage 2: Slim runtime ────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

LABEL org.opencontainers.image.title="Momentum Backend" \
      org.opencontainers.image.description="Collaborative study platform API" \
      org.opencontainers.image.version="1.0.0"

# Create non-root user for security
RUN addgroup -S momentum && adduser -S momentum -G momentum

WORKDIR /app

# Copy the built jar from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Create uploads directory and set permissions
RUN mkdir -p uploads/profile-pictures

# Own everything as the non-root user
RUN chown -R momentum:momentum /app

USER momentum

EXPOSE 8080

# Health check for docker-compose depends_on
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
