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