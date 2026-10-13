#!/usr/bin/env bash
# ==============================================================================
# Bare-Metal NVIDIA GPU MIG Slicing & Partitioning Automation
# Fleet Target: 120 Nodes, 160 Physical GPUs (NVIDIA A100 / H100 80GB)
# Capacity Target: Up to 1,120 Hardware Isolated Slices
# ==============================================================================
set -euo pipefail

echo "======================================================================"
echo " Starting GPU Hardware MIG Slicing on Host: $(hostname)"
echo "======================================================================"

if ! command -v nvidia-smi &> /dev/null; then
    echo "[-] ERROR: nvidia-smi not found. Ensure NVIDIA Datacenter Drivers (535+) are installed."
    exit 1
fi

echo "[*] Step 1: Enabling MIG Mode across all PCIe/SXM GPUs..."
nvidia-smi -mig 1 || true

echo "[*] Step 2: Clearing existing MIG instances..."
nvidia-smi mig -dci || true
nvidia-smi mig -dgi || true

GPU_COUNT=$(nvidia-smi --query-gpu=count --format=csv,noheader | head -n 1)
echo "[*] Detected $GPU_COUNT physical GPU(s) on this host."

for ((i=0; i<GPU_COUNT; i++)); do
    GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader -i "$i")
    echo "[*] Configuring GPU $i ($GPU_NAME) for 7-way multi-tenant isolation..."
    if nvidia-smi mig -cgi 19,19,19,19,19,19,19 -C -i "$i"; then
        echo "[+] Successfully provisioned 7x 1g.10gb MIG slices on GPU $i"
    else
        echo "[!] Fallback: Creating mixed partition (1x 3g.40gb + 3x 1g.10gb)..."
        nvidia-smi mig -cgi 9,19,19,19 -C -i "$i" || echo "[-] Failed to partition GPU $i"
    fi
done

echo "======================================================================"
echo " Active MIG Hardware Slices on Host:"
echo "======================================================================"
nvidia-smi mig -lgi
echo "[+] Slicing complete. Node is ready for Kubernetes/Slurm device discovery."
