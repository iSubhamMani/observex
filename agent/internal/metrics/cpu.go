package metrics

import (
	"fmt"
	"time"

	"github.com/shirou/gopsutil/v4/cpu"
)

func GetCPUMetrics() float64 {
	for {
        // Get CPU usage
        percent, err := cpu.Percent(time.Second, false)
        if err == nil {
            fmt.Printf("CPU Usage: %.2f%%\n", percent[0])
        }

        time.Sleep(time.Second)
    }
}
