pipeline {
    agent any
    environment {
        dockerImage = "cebridani/frontend-chess:latest"
    }
    stages {
        stage('Build') {
            steps {
                dir('frontend-chess') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                dir('frontend-chess') {
                    bat "docker build -t $dockerImage ."
                }
            }
        }
        
        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat "docker login -u $DOCKER_USER -p $DOCKER_PASS"
                }
                bat "docker push $dockerImage"
            }
        }
        
        stage('Deploy') {
            steps {
                bat "kubectl config use-context minikube --kubeconfig=C:\\Users\\danie\\.kube\\config"
                bat "kubectl config set-context minikube --namespace=chess --kubeconfig=C:\\Users\\danie\\.kube\\config"
                bat "kubectl rollout restart deployment/vue-app --kubeconfig=C:\\Users\\danie\\.kube\\config"
                bat "kubectl rollout status deployment/vue-app --kubeconfig=C:\\Users\\danie\\.kube\\config"
            }
        }
        
        stage('Clean up') {
            steps {
                bat 'docker stop frontend-chess || true'
                bat 'docker rm frontend-chess || true'
            }
        }
    }
}
