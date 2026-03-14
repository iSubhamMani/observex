package metrics

import (
	"math"

	"github.com/shirou/gopsutil/v4/mem"
)

func GetMemoryMetrics() (float64, error) {
	vmStat, err := mem.VirtualMemory()
	if err != nil {
		return 0, err
	}

	return math.Round(vmStat.UsedPercent * 100) / 100, nil
}