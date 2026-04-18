# ---- Build Stage ----
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Cache Gradle wrapper and build scripts
COPY gradlew gradlew
COPY gradlew.bat gradlew.bat
COPY gradle gradle
COPY gradle.properties gradle.properties
COPY settings.gradle.kts settings.gradle.kts
COPY buildSrc buildSrc
COPY skillhub-domain/build.gradle.kts skillhub-domain/build.gradle.kts
COPY skillhub-auth/build.gradle.kts skillhub-auth/build.gradle.kts
COPY skillhub-search/build.gradle.kts skillhub-search/build.gradle.kts
COPY skillhub-infra/build.gradle.kts skillhub-infra/build.gradle.kts
COPY skillhub-storage/build.gradle.kts skillhub-storage/build.gradle.kts
COPY skillhub-notification/build.gradle.kts skillhub-notification/build.gradle.kts
COPY skillhub-app/build.gradle.kts skillhub-app/build.gradle.kts
RUN chmod +x ./gradlew
RUN ./gradlew help --no-daemon

COPY . .
RUN ./gradlew :skillhub-app:bootJar -x test --no-daemon

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

COPY --from=build /app/skillhub-app/build/libs/skillhub-app.jar app.jar

# Create storage directory and set permissions
RUN mkdir -p /var/lib/skillhub/storage && \
    chown -R app:app /app /var/lib/skillhub/storage

USER app

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=60s --retries=12 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
