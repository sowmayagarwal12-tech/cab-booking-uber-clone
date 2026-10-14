@echo off
title Cab Booking Enterprise Application (Uber Clone)
echo =====================================================================
echo           CAB BOOKING ENTERPRISE PLATFORM (UBER CLONE)
echo           Major Project for Resume - Full Stack Java + React
echo =====================================================================
echo.

:: Ensure Java and Maven paths are set
if defined JAVA_HOME goto CHECK_MAVEN
if exist "C:\Program Files\Java\jdk-26.0.1" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-26.0.1"
) else if exist "C:\Program Files\Java\latest" (
    set "JAVA_HOME=C:\Program Files\Java\latest"
)

:CHECK_MAVEN
set "PATH=%JAVA_HOME%\bin;C:\Users\%USERNAME%\.tools\apache-maven-3.9.6\bin;C:\Users\%USERNAME%\.tools\node-v22.14.0-win-x64;%PATH%"

echo [1/3] Verifying Java & Maven Environment...
java -version
if %errorlevel% neq 0 (
    echo Error: Java runtime not found. Please verify Java 17+ is installed.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Starting Spring Boot Server on port 8080...
echo (Serving REST API + WebSockets + Swagger UI + React SPA)
echo.

start "" "http://localhost:8080"

cd backend
mvn spring-boot:run

pause
