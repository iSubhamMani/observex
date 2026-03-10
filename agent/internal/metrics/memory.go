package metrics

import (
	"fmt"
	"time"

	"github.com/shirou/gopsutil/v4/mem"
)

func GetMemoryMetrics() {
	for {
        // Get CPU usage
        mem, err := mem.VirtualMemory()
        if err == nil {
            fmt.Printf("Memory Usage: %v%% Total: %vMB Free: %vMB\n", mem.UsedPercent, mem.Total/1024/1024, mem.Free/1024/1024)
        }

        time.Sleep(time.Second)
    }
}