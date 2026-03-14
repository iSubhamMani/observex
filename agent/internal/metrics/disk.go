package metrics

import (
	"math"

	"github.com/shirou/gopsutil/v4/disk"
)

func GetDiskMetrics() (float64, error) {
	usage, err := disk.Usage("/")
	if err != nil {
		return 0, err
	}

	return math.Round(usage.UsedPercent * 100) / 100, nil
}