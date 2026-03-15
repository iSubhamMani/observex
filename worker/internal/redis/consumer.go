package redis

import (
	"context"

	"github.com/redis/go-redis/v9"
)

type StreamConsumer struct {
	Client *redis.Client
	Stream string
	Group string
	Consumer string
}

func NewConsumer(opt *redis.Options) *StreamConsumer {
	rdb := redis.NewClient(opt)

	return &StreamConsumer{
		Client: rdb,
		Stream: "metrics_stream",
		Group: "metrics_workers",
		Consumer: "worker-1", // This should ideally be unique for each worker instance
	}
}

func (c *StreamConsumer) CreateGroup(ctx context.Context) error {
	return c.Client.XGroupCreateMkStream(
		ctx,
		c.Stream,
		c.Group,
		"$",
	).Err()
}

func (c *StreamConsumer) Read(ctx context.Context) ([]redis.XMessage, error) {
	streams, err := c.Client.XReadGroup(ctx, &redis.XReadGroupArgs{
		Group: c.Group,
		Consumer: c.Consumer,
		Streams: [] string{c.Stream, ">"},
		Count: 10,
		Block: 0,
	}).Result()

	if err != nil {
		return nil, err
	}

	return streams[0].Messages, nil
}

func (c *StreamConsumer) Ack(ctx context.Context, messageID string) error {
	return c.Client.XAck(ctx, c.Stream, c.Group, messageID).Err()
}