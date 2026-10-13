#!/bin/bash
#SBATCH --job-name=device-specific-training
#SBATCH --partition=tier2_inter
#SBATCH --qos=tier2_qos
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=16
#SBATCH --mem=64G
#SBATCH --gres=gpu:mig_1g_10gb:2,nvme:1
#SBATCH --time=08:00:00
#SBATCH --output=/workspace/logs/%j.out

echo "=== Assigned Hardware Devices ==="
echo "Assigned CUDA Devices: $CUDA_VISIBLE_DEVICES"
echo "Assigned Slurm GRES:   $SLURM_JOB_GRES"

numactl --cpunodebind=0 --membind=0 python3 train.py \
    --data-dir /mnt/nvme0n1/scratch \
    --epochs 50 \
    --batch-size 32
