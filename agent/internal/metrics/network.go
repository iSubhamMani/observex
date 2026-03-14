package metrics

import (
	"github.com/shirou/gopsutil/v4/net"
)

func GetNetworkMetrics() (float64, error) {
	stats, err := net.IOCounters(false)
	if err != nil {
		return 0, err
	}

	total := stats[0].BytesRecv + stats[0].BytesSent
	return float64(total), nil
}