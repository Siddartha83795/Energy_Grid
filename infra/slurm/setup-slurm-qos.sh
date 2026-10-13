#!/usr/bin/env bash
# ==============================================================================
# Slurm QoS & 1,000 User Quota Initialization Script
# ==============================================================================
set -euo pipefail

sacctmgr -i add qos tier1_qos Priority=100 MaxJobsPerUser=2 MaxSubmitJobsPerUser=5 Flags=DenyOnLimit MaxTRESPerUser=gres/gpu:2,cpu=8
sacctmgr -i add qos tier2_qos Priority=500 MaxJobsPerUser=2 MaxSubmitJobsPerUser=4 MaxTRESPerUser=gres/gpu:4,cpu=32
sacctmgr -i add qos tier3_qos Priority=1000 MaxJobsPerUser=1 MaxSubmitJobsPerUser=2 MaxTRESPerUser=gres/gpu:8,cpu=128

sacctmgr -i add account cluster_users Description="Base 1000 Cluster Members" Organization="ComputePlatform"

if [[ -f "users.csv" ]]; then
    while IFS=, read -r USERNAME TIER; do
        QOS_NAME="${TIER}_qos"
        sacctmgr -i add user "$USERNAME" Account=cluster_users DefaultQOS="$QOS_NAME" QOS="$QOS_NAME"
    done < users.csv
fi
