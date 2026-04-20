# SecScan Security Lab

SecScan is a full-stack Web Security Lab application designed for training and educational purposes. It consists of a Go/Gin backend that provides modular security scanners and a modern Next.js/Tailwind frontend that displays real-time SSE progress updates.

## Project Structure
- **/backend**: Go/Gin application containing various scanners (XSS, SQLi, Fuzzer, TLS, Port, Header, CVE). Features strict SSRF protection.
- **/frontend**: Next.js and Tailwind CSS application providing real-time scanning progress and reports.

## Requirements
- Docker and Docker Compose

## Getting Started
1. Clone the repository and navigate to the `secscan` directory.
2. Run `docker-compose up --build -d` to start the services in the background.
3. Access the frontend at `http://localhost:3000`.
4. The backend API is available at `http://localhost:8080`.

## Architecture Highlights
- **Real-time Updates:** Utilizes Server-Sent Events (SSE) to stream scanning progress dynamically to the user interface.
- **SSRF Protection:** The target URL validation securely prevents Server-Side Request Forgery attacks, ensuring that local services are not inadvertently scanned.
- **Modular Scanning System:** Individual modules (XSS, SQLi, etc.) handle different aspects of security checking effectively.
