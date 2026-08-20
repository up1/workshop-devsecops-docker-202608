# Workshop :: DevSecOps
* REST API with NodeJS and Express
* Database with PostgreSQL
* Dockerizing the application

## Design pipeline
* Continuous Integration with Jenkins
* Continuous Deployment with Docker
* Pipeline
  * Install devdependencies
  * Dependency Scanning with Snyk
  * Code Quality with SonarQube
  * Testing with Jest
  * Vulnerability Scanning with Trivy
  * Security with OWASP ZAP

```
checkout → build → unit tests → integration tests → SAST → SCA → container build → container scan → deploy (compose) → DAST → gate/report
```