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
                  bat "docker build -t $dockerImage ."
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
                bat "kubectl rollout restart deployment/frontend-chess --kubeconfig=C:\\Users\\danie\\.kube\\config"
                bat "kubectl rollout status deployment/frontend-chess --kubeconfig=C:\\Users\\danie\\.kube\\config"
            }
        }
    }
}
