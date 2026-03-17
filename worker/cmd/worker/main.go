package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"worker/internal/influx"
	"worker/internal/redis"
	"worker/pkg/models"

	"github.com/joho/godotenv"
	rd "github.com/redis/go-redis/v9"
)

type Payload struct {
	HostID string   `json:"host_id"`
	Data   []models.Metric `json:"data"`
}

func main() {
	ctx := context.Background()
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file", err)
	}

	redisURL := os.Getenv("REDIS_URL")

	opt, err := rd.ParseURL(redisURL)
	if err != nil {
		log.Fatal("redis parse error:", err)
	}

	consumer := redis.NewConsumer(opt)

	err = consumer.CreateGroup(ctx)
	if err != nil {
		log.Println("group exists or creation error:", err)
	}

	influxURL := os.Getenv("INFLUX_URL")
	token := os.Getenv("INFLUXDB_TOKEN")
	database := os.Getenv("INFLUXDB_BUCKET")

	writer, err := influx.NewInfluxWriter(influxURL, token, database)
	if err != nil {
		log.Fatal("influx init error:", err)
	}

	defer writer.Close()

	log.Println("worker started")

	for {
		msgs, err := consumer.Read(ctx)
		log.Printf("\nmessage: %v\n", msgs)
		if err != nil {
			log.Println("redis read error:", err)
			continue
		}

		for _, msg := range msgs {

			hostID := msg.Values["host_id"].(string)
			data, ok := msg.Values["data"].(string)
			if !ok {
				log.Println("invalid message format")
				continue
			}

			var metrics []models.Metric
			err := json.Unmarshal([]byte(data), &metrics)
			if err != nil {
				log.Println("json decode error:", err)
				return
			}

			err = writer.WriteBatchMetrics(
				ctx,
				hostID,
				metrics,
			)

			if err != nil {
				log.Println("influx write error:", err)
				continue
			}

			err = consumer.Ack(ctx, msg.ID)
			if err != nil {
				log.Println("ack error:", err)
			}
		}
	}
}