# Workshop :: DevSecOps
* REST API with NodeJS and Express
* Database with PostgreSQL
* Dockerizing the application
* Testing with Jest, supertest and testcontainers

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

## Build and run the application
* REST API/ with NodeJS and Express
* Database with PostgreSQL
* OWASP for Dokcer
  * [OWASP Docker Top 10](https://owasp.org/www-project-docker-top-10/)
  * [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)

```
$docker compose build api
$docker compose up -d api
$docker compose ps

NAME                              IMAGE                           COMMAND                  SERVICE   CREATED          STATUS                             PORTS
workshop-devsecops-docker-api-1   workshop-devsecops-docker-api   "docker-entrypoint.s…"   api       25 seconds ago   Up 14 seconds (health: starting)   0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp
workshop-devsecops-docker-db-1    postgres:16-alpine              "docker-entrypoint.s…"   db        25 seconds ago   Up 24 seconds (healthy)            5432/tcp
```

Check the health of the API

```
$curl -i http://localhost:3000/health
```

Get the list of books
```
$curl -i http://localhost:3000/api/books
```

Get book by id
```
$curl -i http://localhost:3000/api/books/1
```

Remove the containers and volumes
```
$docker compose down -v
```

## Testing
* Unit testing
* Integration testing with testcontainers

Run unit tests
```
$npm run test:unit
```

Run integration tests
```
$npm run test:integration
```

Run all tests
```
$npm test
```

* See coverage report
```
$open coverage/lcov-report/index.html
```

Run test with docker compose
```
$docker compose -f docker-compose-test.yml build
$docker compose -f docker-compose-test.yml run --rm api-test
```

## API testing with Postman and Newman
* [Postman](https://www.postman.com/)
* [Newman](https://www.npmjs.com/package/newman)
```
$docker compose up api-testing --build --abort-on-container-exit
$docker compose down -v
```

## Static code analysis and dependency scanning
* NPM audit for dependency scanning
* SonarQube for static code analysis
* [Semgrep](https://github.com/semgrep/semgrep) for static code analysis
* [Trivy](https://github.com/aquasecurity/trivy) for dependency scanning

```
$docker compose -f docker-compose-static-analysis.yml up npm-audit --abort-on-container-exit
$docker compose -f docker-compose-static-analysis.yml up semgrep --abort-on-container-exit
$docker compose -f docker-compose-static-analysis.yml up trivy --abort-on-container-exit
$docker compose -f docker-compose-static-analysis.yml down -v
```

Commercial tools for static code analysis and dependency scanning
* [Snyk](https://snyk.io/)
* [WhiteSource](https://www.whitesourcesoftware.com/)
* [Veracode](https://www.veracode.com/)
* [Checkmarx](https://checkmarx.com/)

## Build and scan images with trivy

Build image
```
$docker compose build api
$docker image ls | grep "somkiat/nodeapi"
```
Scan image with trivy
```
$trivy image somkiat/nodeapi:1.0 \
    --scanners vuln,secret,misconfig \
    --severity HIGH,CRITICAL \
    --ignore-unfixed \
    --format table \
    --exit-code 1
```

Scan image with trivy and output to json file
```
$trivy image somkiat/nodeapi:1.0 \
    --scanners vuln,secret,misconfig \
    --severity HIGH,CRITICAL \
    --ignore-unfixed \
    --format json \
    --output trivy.json
```

Scan image with trivy in docker compose
```
$docker compose -f docker-compose-static-analysis.yml up trivy-image --abort-on-container-exit
$docker compose -f docker-compose-static-analysis.yml down -v
```

## Push image to DockerHub
```
$docker login
$docker tag somkiat/nodeapi:1.0 somkiat/nodeapi:latest
$docker push somkiat/nodeapi:1.0
```

## Deploy and run the application with docker compose
```
$docker compose -f docker-compose-deploy.yml down -v

$docker compose -f docker-compose-deploy.yml up -d
$docker compose -f docker-compose-deploy.yml ps
```

Check the health of the API

```
$curl -i http://localhost:3000/health
```

## Dynamic Application Security Testing (DAST) with OWASP ZAP
* [OWASP ZAP](https://www.zaproxy.org/)
* Testing with ZAP API
```
// Start the API service
$docker compose up -d api

// Simple baseline scan 1-2 minutes
$docker compose -f docker-compose-dast.yml up zap-baseline --abort-on-container-exit

// API scan 5-10 minutes (use the OpenAPI/Swagger spec to tune the scan)
$docker compose -f docker-compose-dast.yml up zap-api-scan --abort-on-container-exit

// Full active scan 30-60 minutes (manual/ad-hoc only, not for CI/CD)
$docker compose -f docker-compose-dast.yml up zap-full-scan --abort-on-container-exit

// Remove the containers and volumes
$docker compose -f docker-compose-dast.yml down -v
$docker compose down -v
```

## DEsign and create Jenkins pipeline
* [Jenkins](https://www.jenkins.io/)
* File `Jenkinsfile` is the pipeline definition file for Jenkins

