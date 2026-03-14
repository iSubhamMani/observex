package client

import (
	"log"

	pb "github.com/iSubhamMani/observex/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func NewClient(address string) pb.MetricsServiceClient {
	conn, err := grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))

	if err != nil {
		log.Fatalf("failed to connect: %v", err)
	}

	return pb.NewMetricsServiceClient(conn)
}