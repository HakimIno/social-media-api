pipeline {
    agent { label 'Jenkins-Agent' }

    environment {
        BUN_VERSION = '1.1.18'
        DOCKER_USER = 'kimsnow'
        DOCKER_IMAGE = 'phayu'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${BUN_VERSION} --build-arg BUN_VERSION=${BUN_VERSION} .
                    """
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // Run tests inside the Docker container
                    sh """
                        docker run --rm ${DOCKER_IMAGE}:${BUN_VERSION} bun test
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('', 'docker-credentials') {
                        sh """
                            docker tag ${DOCKER_IMAGE}:${BUN_VERSION} ${DOCKER_USER}/${DOCKER_IMAGE}:${BUN_VERSION}
                            docker push ${DOCKER_USER}/${DOCKER_IMAGE}:${BUN_VERSION}
                        """
                    }
                }
            }
        }

        stage('Push to Git Main Branch') {
            steps {
                script {
                    // Push changes to main branch
                    sh '''
                        git config user.name "HakimIno"
                        git config user.email "keemkeem207@gmail.com"
                        git add .
                        git commit -m "Automated commit from Jenkins pipeline"
                        git push origin main
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Deploy the application (example step, replace with actual deployment commands)
                    sh """
                        ssh user@server \\"docker pull ${DOCKER_USER}/${DOCKER_IMAGE}:${BUN_VERSION} && docker run -d -p 8888:8888 ${DOCKER_USER}/${DOCKER_IMAGE}:${BUN_VERSION}\\"
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            sh 'docker rmi ${DOCKER_IMAGE}:${BUN_VERSION}'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
