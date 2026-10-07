# ==============================================================================
# RentFair — Multi-Stage Production Dockerfile
# ==============================================================================
# Stage 1: Build Frontend (React + TypeScript + Tailwind CSS with Vite)
# Stage 2: Build Unified Backend (Spring Boot 3.3 + Maven + Embedded Static UI)
# Stage 3: Minimal, Hardened Runtime Container (Eclipse Temurin JRE 21 Alpine)
# ==============================================================================

# --- Stage 1: Build React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source and build static bundle directly into target directory
COPY tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY public ./public
COPY src ./src

RUN npm run build:static

# --- Stage 2: Build Spring Boot Backend ---
FROM maven:3.9.8-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /backend

# Cache maven dependencies
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy backend source code
COPY backend/src ./src

# Copy built frontend static assets into Spring Boot's static resources directory
COPY --from=frontend-builder /app/backend/src/main/resources/static ./src/main/resources/static

# Package executable unified Spring Boot JAR
RUN mvn clean package -DskipTests -B

# --- Stage 3: Production Runtime Image ---
FROM eclipse-temurin:21-jre-alpine AS runner

# Create dedicated non-root application user
RUN addgroup -S rentfair && adduser -S rentfair -G rentfair

WORKDIR /app

# Copy packaged jar from build stage
COPY --from=backend-builder /backend/target/rentfair-backend-0.1.0-SNAPSHOT.jar app.jar

# Set permissions
RUN chown -R rentfair:rentfair /app

USER rentfair:rentfair

# Default environment configuration
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

# Production Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
