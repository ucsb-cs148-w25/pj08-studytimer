# Use an official OpenJDK image
FROM eclipse-temurin:17-jdk AS build

# Set the working directory inside the container
WORKDIR /app

# Copy Maven Wrapper and source files explicitly
COPY .mvn/wrapper/ .mvn/wrapper/
COPY mvnw pom.xml ./
COPY src ./src

# Grant execute permissions for Maven Wrapper
RUN chmod +x mvnw

# Build the application inside the container
RUN ./mvnw clean package -DskipTests

# ----------------------
# Production Stage
# ----------------------
FROM eclipse-temurin:17-jdk AS run

# Set the working directory inside the container
WORKDIR /app

# Copy the built JAR from the previous stage
COPY --from=build /app/target/*.jar app.jar

# Run the application
CMD ["java", "-jar", "app.jar"]
