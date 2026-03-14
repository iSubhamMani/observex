package redis

import (
	"context"
	"encoding/json"
	"log"

	pb "github.com/iSubhamMani/observex/proto"
	"github.com/redis/go-redis/v9"
)

type RedisStream struct {
	Client *redis.Client
	Stream string
}

func NewRedisStream(opt *redis.Options) *RedisStream {
	rdb := redis.NewClient(opt)

    ctx := context.Background()

    err := rdb.Ping(ctx).Err()
    if err != nil {
        log.Fatalf("Redis connection failed: %v", err)
    }

    log.Println("Connected to Redis")

	return &RedisStream{
		Client: rdb,
		Stream: "metrics_stream",
	}
}

func (rs *RedisStream) Push(ctx context.Context, batch *pb.MetricBatch) error {
	payload, err := json.Marshal(batch.Metrics)
	if err != nil {
		return err
	}

	return rs.Client.XAdd(ctx, &redis.XAddArgs{
		Stream: rs.Stream,
		Values: map[string]interface{} {
			"host_id": batch.HostId,
			"data": payload,
		},
	}).Err()
}