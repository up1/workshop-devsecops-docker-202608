// DevSecOps pipeline: checkout -> build -> unit/integration tests -> SAST/SCA
// -> container build/scan -> API tests -> deploy -> DAST -> report
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        COMPOSE    = 'docker compose'
        IMAGE_NAME = 'somkiat/nodeapi'
        IMAGE_TAG  = '1.0'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Test Image') {
            steps {
                sh "${COMPOSE} -f docker-compose-test.yml build api-test"
            }
        }

        stage('Unit Tests') {
            steps {
                sh "${COMPOSE} -f docker-compose-test.yml run --rm api-test npm run test:unit"
            }
            post {
                always {
                    junit testResults: 'api/reports/junit.xml', allowEmptyResults: true
                }
            }
        }

        stage('Integration Tests') {
            steps {
                sh "${COMPOSE} -f docker-compose-test.yml run --rm api-test npm run test:integration"
            }
            post {
                always {
                    junit testResults: 'api/reports/junit.xml', allowEmptyResults: true
                    sh "${COMPOSE} -f docker-compose-test.yml down -v || true"
                }
            }
        }

        stage('SAST - Semgrep') {
            steps {
                sh "${COMPOSE} -f docker-compose-static-analysis.yml up semgrep --abort-on-container-exit"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'semgrep.sarif', allowEmptyArchive: true
                }
            }
        }

        stage('SCA - npm audit & Trivy FS') {
            steps {
                sh "${COMPOSE} -f docker-compose-static-analysis.yml up npm-audit trivy --abort-on-container-exit"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'api/npm-audit.json, trivy.sarif', allowEmptyArchive: true
                    sh "${COMPOSE} -f docker-compose-static-analysis.yml down -v || true"
                }
            }
        }

        stage('Build Container Image') {
            steps {
                sh "${COMPOSE} build api"
            }
        }

        stage('Container Image Scan - Trivy') {
            steps {
                sh "${COMPOSE} -f docker-compose-static-analysis.yml up trivy-image --abort-on-container-exit"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-image.sarif', allowEmptyArchive: true
                    sh "${COMPOSE} -f docker-compose-static-analysis.yml down -v || true"
                }
            }
        }

        stage('API Contract Tests - Postman/Newman') {
            steps {
                sh "${COMPOSE} up -d api"
                sh '''
                  for i in $(seq 1 20); do
                    curl -sf http://localhost:3000/health && break
                    sleep 3
                  done
                '''
                sh "${COMPOSE} up api-testing --build --abort-on-container-exit"
            }
            post {
                always {
                    junit testResults: 'api-testing/reports/junit.xml', allowEmptyResults: true
                    sh "${COMPOSE} down -v || true"
                }
            }
        }

        stage('Push Image to Registry') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
                sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_NAME}:latest"
            }
        }

        stage('Deploy') {
            steps {
                sh "${COMPOSE} -f docker-compose-deploy.yml down -v || true"
                sh "${COMPOSE} -f docker-compose-deploy.yml up -d"
                sh '''
                  for i in $(seq 1 20); do
                    curl -sf http://localhost:3000/health && break
                    sleep 3
                  done
                '''
            }
        }

        stage('DAST - OWASP ZAP Baseline') {
            steps {
                sh "${COMPOSE} -f docker-compose-dast.yml up zap-baseline --abort-on-container-exit"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'zap-reports/*.html, zap-reports/*.json', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            sh "${COMPOSE} -f docker-compose-deploy.yml down -v || true"
            sh "${COMPOSE} -f docker-compose-test.yml down -v || true"
            sh "${COMPOSE} -f docker-compose-static-analysis.yml down -v || true"
            sh "${COMPOSE} down -v || true"
            archiveArtifacts artifacts: 'trivy.sarif, trivy-image.sarif, semgrep.sarif, api/npm-audit.json, zap-reports/**', allowEmptyArchive: true
        }
    }
}
