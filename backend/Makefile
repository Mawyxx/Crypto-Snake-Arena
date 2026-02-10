.PHONY: run
run:
	go run ./cmd/server

# Генерация Protobuf (требует: protoc, protoc-gen-go в PATH)
# Установка protoc: https://github.com/protocolbuffers/protobuf/releases
# Установка protoc-gen-go: go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
.PHONY: proto
proto:
	protoc --go_out=. --go_opt=paths=source_relative proto/game.proto
