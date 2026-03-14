package server

import (
	"collector/internal/redis"
	"context"
	"log"

	pb "github.com/iSubhamMani/observex/proto"
)

type MetricsServer struct {
	pb.UnimplementedMetricsServiceServer
	Stream *redis.RedisStream
}

func NewMetricsServer(stream *redis.RedisStream) *MetricsServer {
	return &MetricsServer{Stream: stream}
}

func (s *MetricsServer) SendMetrics(ctx context.Context, req *pb.MetricBatch) (*pb.Ack, error) {
	log.Printf("\nReq: %v\n", req)
	err := s.Stream.Push(ctx, req)

	if err != nil {
		log.Println("redis push error:", err)

		return &pb.Ack{
			Success: false,
			Message: "failed",
		}, err
	}

	return &pb.Ack{
		Success: true,
		Message: "metrics received",
	}, nil
}