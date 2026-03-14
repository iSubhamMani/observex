package main

import (
	"collector/internal/redis"
	"collector/internal/server"
	"log"
	"net"
	"os"

	pb "github.com/iSubhamMani/observex/proto"
	"github.com/joho/godotenv"
	rd "github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file", err)
	}

	listener, err := net.Listen("tcp", ":50051")

	if err != nil {
		log.Fatal(err)
	}
	
	opt, err := rd.ParseURL(os.Getenv("REDIS_URL"))

	if err != nil {
		log.Fatal("invalid Redis URL:", err)
	}

	stream := redis.NewRedisStream(opt)

	grpcServer := grpc.NewServer()
	metricsServer := server.NewMetricsServer(stream)

	pb.RegisterMetricsServiceServer(grpcServer, metricsServer)

	log.Println("Collector running on port 50051")

	if err := grpcServer.Serve(listener); err != nil {
		log.Fatal(err)
	}
}