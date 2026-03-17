package models

type Metric struct {
	Timestamp int64   `json:"timestamp"`
	CPU       float64 `json:"cpu_usage"`
	Memory    float64 `json:"mem_usage"`
	Disk      float64 `json:"disk_usage"`
	Net       float64 `json:"net_usage"`
}