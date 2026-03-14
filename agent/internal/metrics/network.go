package metrics

import (
	"math"

	"github.com/shirou/gopsutil/v4/net"
)

func GetNetworkMetrics() (float64, error) {
	stats, err := net.IOCounters(false)
	if err != nil {
		return 0, err
	}

	total := stats[0].BytesRecv + stats[0].BytesSent
	return math.Round(float64(total) *100) / 100, nil
}