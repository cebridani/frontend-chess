pipeline {
    agent any
    tools {
        nodejs 'NodeJS_19'
    }
    environment {
        dockerImage = "cebridani/frontend-chess:latest"
    }
    stages {
        stage('Setup Node.js') {
            steps {
                script {
                    NODEJS_HOME = tool(name: 'NodeJS 19', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation')
                    env.PATH = "${env.NODEJS_HOME}/bin:${env.PATH}"
                }
            }
        }
        stage('Build') {
            steps {
                dir('frontend-chess') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                sh "docker build -t $dockerImage ."
            }
        }
        
        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "docker login -u $DOCKER_USER -p $DOCKER_PASS"
                }
                sh "docker push $dockerImage"
            }
        }
        
        stage('Deploy') {
            steps {
                sh "kubectl config use-context minikube --kubeconfig=$HOME/.kube/config"
                sh "kubectl config set-context minikube --namespace=chess --kubeconfig=$HOME/.kube/config"
                sh "kubectl rollout restart deployment/frontend-chess --kubeconfig=$HOME/.kube/config"
                sh "kubectl rollout status deployment/frontend-chess --kubeconfig=$HOME/.kube/config"
            }
        }
    }
}
