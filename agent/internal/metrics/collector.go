package metrics

import (
	"time"

	pb "github.com/iSubhamMani/observex/proto"
)

func CollectMetrics() (*pb.Metric, error) {
	cpuUsage, err := GetCPUUsage()

	if err != nil {
		return nil, err
	}

	memUsage, err := GetMemoryMetrics()
	if err != nil {
		return nil, err
	}

	diskUsage, err := GetDiskMetrics()
	if err != nil {
		return nil, err
	}

	netUsage, err := GetNetworkMetrics()
	if err != nil {
		return nil, err
	}

	metric := &pb.Metric{
		Timestamp: time.Now().Unix(),
		CpuUsage: cpuUsage,
		MemUsage: memUsage,
		DiskUsage: diskUsage,
		NetUsage: netUsage,
	}

	return metric, nil
}