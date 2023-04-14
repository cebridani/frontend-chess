pipeline {
    agent any
    tools {
        nodejs 'NodeJS_19'
    }
    environment {
        dockerImage = "cebridani/frontend-chess:latest"
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm version’
            }
        }
    }
}
