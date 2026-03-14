package metrics

import (
	"github.com/shirou/gopsutil/v4/mem"
)

func GetMemoryMetrics() (float64, error) {
	vmStat, err := mem.VirtualMemory()
	if err != nil {
		return 0, err
	}

	return vmStat.UsedPercent, nil
}