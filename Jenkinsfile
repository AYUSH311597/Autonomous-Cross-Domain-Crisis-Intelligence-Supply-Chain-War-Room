pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials-id')
        DOCKER_IMAGE          = "ayush311597/cascadia-app"
        BUILD_TAG             = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/AYUSH311597/Autonomous-Cross-Domain-Crisis-Intelligence-Supply-Chain-War-Room.git'
            }
        }

        stage('Install Dependencies & Test') {
            steps {
                sh 'npm install'
                // sh 'npm test' // Uncomment if unit tests are configured
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE}:${BUILD_TAG}")
                    dockerImage.tag("latest")
                }
            }
        }

        stage('Security Scan (Trivy)') {
            steps {
                // Scans the container image for High/Critical CVEs
                sh "trivy image --severity HIGH,CRITICAL ${DOCKER_IMAGE}:${BUILD_TAG}"
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials-id') {
                        dockerImage.push("${BUILD_TAG}")
                        dockerImage.push("latest")
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Updates the image tag dynamically in the deployment manifest
                    sh "sed -i 's|your-dockerhub-username/cascadia-app:latest|${DOCKER_IMAGE}:${BUILD_TAG}|g' k8s/deployment.yaml"
                    sh "kubectl apply -f k8s/deployment.yaml"
                    sh "kubectl apply -f k8s/service.yaml"
                    sh "kubectl rollout status deployment/cascadia-deployment"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Phase 3 CI/CD Pipeline executed successfully!"
        }
        failure {
            echo "Pipeline failed. Check build logs for details."
        }
    }
}