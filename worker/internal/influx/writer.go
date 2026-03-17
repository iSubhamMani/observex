package influx

import (
	"context"
	"time"
	"worker/pkg/models"

	influxdb3 "github.com/InfluxCommunity/influxdb3-go/v2/influxdb3"
)

type InfluxWriter struct {
	Client   *influxdb3.Client
	Database string
}

func NewInfluxWriter(url, token, database string) (*InfluxWriter, error) {

	client, err := influxdb3.New(influxdb3.ClientConfig{
		Host:  url,
		Token: token,
	})

	if err != nil {
		return nil, err
	}

	return &InfluxWriter{
		Client:   client,
		Database: database,
	}, nil
}

func (w *InfluxWriter) Close() error {
	return w.Client.Close()
}

func (w *InfluxWriter) WriteMetric(
	ctx context.Context,
	host string,
	cpu float64,
	disk float64,
	mem float64,
	net float64,
	timestamp int64,
) error {

	point := influxdb3.NewPointWithMeasurement("system_metrics").
		SetTag("host", host).
		SetDoubleField("cpu_usage", cpu).
		SetDoubleField("disk_usage", disk).
		SetDoubleField("memory_usage", mem).
		SetDoubleField("net_usage", net).
		SetTimestamp(time.Unix(timestamp, 0))

	return w.Client.WritePoints(
		ctx,
		[]*influxdb3.Point{point},
		influxdb3.WithDatabase(w.Database),
	)
}

func (w *InfluxWriter) WriteBatchMetrics(
	ctx context.Context,
	hostId string,
	metrics []models.Metric,
) error {
	points := make([]*influxdb3.Point, len(metrics))
	for i, m := range metrics {
		points[i] = influxdb3.NewPointWithMeasurement("system_metrics").
			SetTag("host", hostId).
			SetDoubleField("cpu_usage", m.CPU).
			SetDoubleField("disk_usage", m.Disk).
			SetDoubleField("memory_usage", m.Memory).
			SetDoubleField("net_usage", m.Net).
			SetTimestamp(time.Unix(m.Timestamp, 0))
	}

	return w.Client.WritePoints(
		ctx,
		points,
		influxdb3.WithDatabase(w.Database),
	)
}