package metrics

import (
	"github.com/shirou/gopsutil/v4/disk"
)

func GetDiskMetrics() (float64, error) {
	usage, err := disk.Usage("/")
	if err != nil {
		return 0, err
	}

	return usage.UsedPercent, nil
}