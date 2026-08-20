FROM postman/newman:latest
WORKDIR /etc/newman
COPY books-api.postman_collection.json .
COPY environment.postman_environment.json .
ENTRYPOINT ["newman", "run", "books-api.postman_collection.json", "-e", "environment.postman_environment.json", "--reporters", "cli,junit", "--reporter-junit-export", "/src/reports/junit.xml"]
