package main

import (
	"agent/internal/metrics"
	"fmt"
)

func main() {
	fmt.Println("Hello from agent!")

	go metrics.GetCPUMetrics()
	go metrics.GetMemoryMetrics()

	fmt.Println("Inside main func")

	select {}
}