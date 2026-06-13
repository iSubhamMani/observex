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
                     powershell """
                        \$keyPath = "\$env:TEMP\\deploy_key.pem"
                        Copy-Item "\$env:SSH_KEY" \$keyPath

                        # Use current Windows identity instead of username string
                        \$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
                        \$acl = New-Object System.Security.AccessControl.FileSecurity
                        \$acl.SetAccessRuleProtection(\$true, \$false)
                        \$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                            \$currentUser, "Read", "Allow"
                        )
                        \$acl.SetAccessRule(\$rule)
                        Set-Acl \$keyPath \$acl

                        ssh -i \$keyPath -o StrictHostKeyChecking=no ubuntu@3.7.145.83 `
                            "sudo docker stop api-observex || true && sudo docker rm api-observex || true && sudo docker pull ${DOCKER_IMAGE} && sudo docker run -d --restart unless-stopped -p 3001:3001 --env-file /home/ubuntu/apps/api-observex/.env --name api-observex ${DOCKER_IMAGE}"

                        Remove-Item \$keyPath -Force
                    """
                }
            }
        }
    }
}