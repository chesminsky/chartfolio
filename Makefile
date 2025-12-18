build:
	docker-compose build
push: 
	docker push chesminsky/assets-web:latest
	docker push chesminsky/assets-server:latest
# push: 
# 	docker push docker.dmitriy.space/assets-web:latest
# 	docker push docker.dmitriy.space/assets-server:latest
login: 
	ssh -p '37018' 'grig@dmitriy.space'
clean:
	docker system prune -a
