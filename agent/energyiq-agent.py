#!/usr/bin/env python3
"""
EnergyIQ Computer Node OS Telemetry Reporting Agent
Reads real hardware performance metrics (CPU, Memory, Disk, Network, GPU)
and POSTs telemetry to the EnergyIQ backend endpoint.
"""

import argparse
import json
import logging
import platform
import sys
import time
import requests

try:
    import psutil
except ImportError:
    print("Error: 'psutil' is required. Please run 'pip install psutil requests'")
    sys.exit(1)

# Optional NVIDIA GPU Telemetry via pynvml
HAS_NVML = False
try:
    import pynvml
    pynvml.nvmlInit()
    HAS_NVML = True
except Exception:
    HAS_NVML = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)

def get_gpu_telemetry():
    """Reads real NVIDIA GPU utilization and temperature if available."""
    if not HAS_NVML:
        return None, None
    try:
        device_count = pynvml.nvmlDeviceGetCount()
        if device_count == 0:
            return None, None
        handle = pynvml.nvmlDeviceGetHandleByIndex(0)
        util = pynvml.nvmlDeviceGetUtilizationRates(handle)
        temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
        return float(util.gpu), float(temp)
    except Exception:
        return None, None

def collect_metrics(last_net_bytes, sample_interval):
    """Collects real OS system metrics using psutil."""
    # CPU Metrics
    cpu_percent = psutil.cpu_percent(interval=None)
    freq = psutil.cpu_freq()
    cpu_freq_ghz = round(freq.current / 1000.0, 2) if freq else 0.0

    # Memory Metrics
    vm = psutil.virtual_memory()
    memory_used_gb = round(vm.used / (1024 ** 3), 2)
    memory_total_gb = round(vm.total / (1024 ** 3), 2)
    memory_percent = vm.percent

    # Primary Disk Usage
    try:
        root_path = "C:\\" if platform.system() == "Windows" else "/"
        du = psutil.disk_usage(root_path)
        disk_percent = du.percent
    except Exception:
        disk_percent = 0.0

    # Network Throughput (Kbps between samples)
    net_io = psutil.net_io_counters()
    net_send_kbps = 0.0
    net_recv_kbps = 0.0

    if last_net_bytes:
        bytes_sent_delta = net_io.bytes_sent - last_net_bytes[0]
        bytes_recv_delta = net_io.bytes_recv - last_net_bytes[1]
        net_send_kbps = round((bytes_sent_delta * 8) / (sample_interval * 1024.0), 1)
        net_recv_kbps = round((bytes_recv_delta * 8) / (sample_interval * 1024.0), 1)

    new_net_bytes = (net_io.bytes_sent, net_io.bytes_recv)

    # GPU Telemetry
    gpu_percent, gpu_temp_c = get_gpu_telemetry()

    payload = {
        "hostname": platform.node(),
        "os_type": platform.system(),
        "cpu_percent": round(cpu_percent, 1),
        "cpu_freq_ghz": cpu_freq_ghz,
        "memory_used_gb": memory_used_gb,
        "memory_total_gb": memory_total_gb,
        "memory_percent": round(memory_percent, 1),
        "disk_percent": round(disk_percent, 1),
        "network_send_kbps": max(0.0, net_send_kbps),
        "network_recv_kbps": max(0.0, net_recv_kbps),
        "gpu_percent": gpu_percent,
        "gpu_temp_c": gpu_temp_c,
        "timestamp": time.time(),
    }

    return payload, new_net_bytes

def main():
    parser = argparse.ArgumentParser(description="EnergyIQ Local Reporting Agent")
    parser.add_argument("--server", default="http://localhost:8081", help="EnergyIQ backend server URL")
    parser.add_argument("--token", default="node-2-token-secret-88192", help="Device Token assigned to this computer node")
    parser.add_argument("--interval", type=int, default=10, help="Sampling interval in seconds (default: 10)")
    args = parser.parse_args()

    endpoint = f"{args.server.rstrip('/')}/api/agent/report"
    logging.info(f"Starting EnergyIQ Agent for node token '{args.token[:8]}...'")
    logging.info(f"Target backend: {endpoint} (Sampling every {args.interval}s)")

    # Prime psutil cpu_percent
    psutil.cpu_percent(interval=None)
    last_net_bytes = None

    while True:
        try:
            time.sleep(args.interval)
            payload, last_net_bytes = collect_metrics(last_net_bytes, args.interval)

            headers = {
                "Content-Type": "application/json",
                "x-device-token": args.token,
            }

            resp = requests.post(endpoint, json=payload, headers=headers, timeout=5)
            if resp.status_code == 200:
                logging.info(
                    f"Reported live metrics: CPU {payload['cpu_percent']}% ({payload['cpu_freq_ghz']} GHz) | "
                    f"RAM {payload['memory_used_gb']}/{payload['memory_total_gb']} GB ({payload['memory_percent']}%) | "
                    f"Net {payload['network_send_kbps']}/{payload['network_recv_kbps']} Kbps"
                )
            else:
                logging.warning(f"Backend returned status {resp.status_code}: {resp.text}")
        except KeyboardInterrupt:
            logging.info("Agent stopped by user.")
            break
        except Exception as e:
            logging.error(f"Error sampling/reporting metrics: {e}")

if __name__ == "__main__":
    main()
