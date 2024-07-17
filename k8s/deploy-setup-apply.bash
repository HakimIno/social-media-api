kubectl apply -f namespace.yaml

kubectl apply -f service.yaml -n phayu-namespace 

kubectl apply -f app-deployment-service.yaml  -n phayu-namespace 

kubectl get pods -n phayu-namespace 

kubectl get svc -n phayu-namespace 

# kubectl port-forward bun-app-xxxxxxx-xxxxx -n phayu-namespace 5432:5432

# docker build -t kimsnow/phayu:latest .
# docker login
# docker push kimsnow/phayu:latest 