.PHONY: start
start:
	REACT_APP_RESTAI_API_URL=http://127.0.0.1:9000 npm run start

.PHONY: install
install:
	npm install && npm run build

.PHONY: clean
clean:
	rm -rf html/*
