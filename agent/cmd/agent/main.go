package main

import (
	"context"
	"log"
	"time"

	"agent/internal/client"
	"agent/internal/metrics"

	"github.com/google/uuid"
	pb "github.com/iSubhamMani/observex/proto"
)

func main() {
	collectorAddr := "localhost:50051"
	client := client.NewClient(collectorAddr)

	// TODO: replace with actual host ID retrieval logic
	hostId := uuid.New().String() 

	ticker := time.NewTicker(time.Second)

	var batch []*pb.Metric

	for range ticker.C { 
		metric, err := metrics.CollectMetrics()

		if err != nil {
			log.Println("error collecting metric: ", err)
			continue
		}

		batch = append(batch, metric)

		if len(batch) >= 10 {

			req := &pb.MetricBatch{
				HostId:  hostId,
				Metrics: batch,
			}

			resp, err := client.SendMetrics(context.Background(), req)

			if err != nil {
				log.Println("send error:", err)
				continue
			}

			log.Println("collector response:", resp.Message)

			batch = []*pb.Metric{}
		}
	}
}