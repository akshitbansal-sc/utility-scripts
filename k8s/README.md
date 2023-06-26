// RUN docker and minikube

```
minikube start
eval $(minikube docker-env)
docker build -t my-app .
minikube kubectl -- apply -f deployment.yaml

```