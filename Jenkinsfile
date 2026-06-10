pipeline {
    agent any
    environment {
        DOCKER_IMAGE = 'subhammani/observex-ingestion-api:latest'
    }
    stages {
        stage('Build') {
            steps {
                bat "docker build -t ${DOCKER_IMAGE} -f ingestion-api/Dockerfile ingestion-api"
            }
        }
        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    bat "docker login -u %DOCKER_USER% -p %DOCKER_PASS%"
                    bat "docker push ${DOCKER_IMAGE}"
                }
            }
        }
        stage('Deploy') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'ec2-ssh',
                        keyFileVariable: 'SSH_KEY'
                    )
                ]) {
                    bat """ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no ubuntu@3.7.145.83 ^
                        "sudo docker stop api-observex || true && ^
                         sudo docker rm api-observex || true && ^
                         sudo docker pull ${DOCKER_IMAGE} && ^
                         sudo docker run -d --restart unless-stopped -p 3001:3000 ^
                        --env-file /home/ubuntu/apps/api-observex/.env ^
                        --name api-observex ${DOCKER_IMAGE}" """
                }
            }
        }
    }
}