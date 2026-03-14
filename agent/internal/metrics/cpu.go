package metrics

import (
	"math"

	"github.com/shirou/gopsutil/v4/cpu"
)

func GetCPUUsage() (float64, error) {
	percent, err := cpu.Percent(0, false)
	if err != nil {
		return 0, err
	}

	return math.Round(percent[0]*100) / 100, nil
}
