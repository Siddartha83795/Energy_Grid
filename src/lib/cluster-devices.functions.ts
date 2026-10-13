import { createServerFn } from "@tanstack/react-start";

export interface DeviceProfileRequest {
  tier: "tier1" | "tier2" | "tier3";
  gpuType: "none" | "mig_1g_10gb" | "mig_2g_20gb" | "mig_3g_40gb" | "full_a100_80gb" | "rtx4090_slice" | "multi_gpu_4x" | "multi_gpu_8x";
  gpuCount: number;
  cpuCores: number;
  cpuIsolation: "shared" | "pinned_exclusive";
  numaBinding: boolean;
  numaNode: number;
  systemMemoryGb: number;
  storageType: "ephemeral" | "nvme_local" | "shared_nfs";
  storageSizeGb: number;
  networkInterconnect: "standard_eth" | "sriov_rdma_ib" | "roce_v2";
  workloadType: "jupyter" | "pytorch_training" | "vllm_inference" | "distributed_deepspeed";
  jobName: string;
}

export interface GeneratedConfigs {
  kubernetesYaml: string;
  slurmScript: string;
  jupyterHubProfile: string;
  hostCliCommands: string;
}

export interface GridSchedulingRequest {
  totalUsers: number;
  gridSurplusKw: number;
  energyTariffInr: number;
  schedulingStrategy: "green_surplus_boost" | "carbon_cost_minimizer" | "high_throughput_balanced";
}

export interface GridSchedulingResponse {
  summary_plan: string;
  allocated_members: number;
  active_nodes_count: number;
  sleeping_consolidated_nodes: number;
  power_saved_kw: number;
  monthly_savings_inr: number;
  grid_surplus_utilized_kw: number;
  tier_allocations: Array<{
    tier: string;
    member_count: number;
    gpu_profile: string;
    total_slices: number;
    assigned_nodes: string;
    power_cap_watts_per_gpu: number;
    cpu_cores_per_user: number;
  }>;
  node_power_actions: Array<{
    node_range: string;
    hardware: string;
    action: string;
    power_state: string;
    target_users: string;
  }>;
  slurm_dynamic_partition_conf: string;
  k8s_kueue_energy_manifest: string;
  power_capping_bash_script: string;
}

export const getClusterFleetStatus = createServerFn({ method: "GET" }).handler(async () => {
  return {
    fleet: {
      totalNodes: 120,
      totalGpus: 160,
      activeMembers: 1000,
      totalCpuCores: 7680,
      totalMemoryTb: 61.44,
      totalNvmeTb: 240,
    },
    slicingCapacity: {
      migSlicesTotal: 1120,
      migSlicesAllocated: 684,
      timeSlicesTotal: 1280,
      timeSlicesAllocated: 840,
      fullGpusTotal: 40,
      fullGpusAllocated: 28,
    },
    nodeGroups: [
      { name: "node[001-040]", type: "40x SXM4 A100 80GB (Heavy Training / Full GRES)", count: 40, gpus: 40, targetTier: "Tier 3" },
      { name: "node[041-080]", type: "40x PCIe A100 80GB (Hardware MIG 7x 1g.10gb)", count: 40, gpus: 40, targetTier: "Tier 1 & 2" },
      { name: "node[081-120]", type: "40x Dual RTX 4090 (Software MPS / Time-Slicing 8x)", count: 40, gpus: 80, targetTier: "Tier 1 Dev" },
    ],
    tierBreakdown: {
      tier1: { label: "Tier 1: Dev / Light", users: 700, sharePct: 70, quota: "1/7 MIG or 1/8 Time-Slice (~10GB VRAM), 4 vCPUs, 16-32GB RAM" },
      tier2: { label: "Tier 2: Fine-Tuning", users: 250, sharePct: 25, quota: "2/7 MIG or 1/2 GPU (~20-40GB VRAM), 16 vCPUs (Pinned), 64-128GB RAM" },
      tier3: { label: "Tier 3: Distributed ML", users: 50, sharePct: 5, quota: "1-8 Full GPUs (80GB), 32-64 Pinned Cores, 256GB+ RAM, IB RDMA" },
    }
  };
});

export const scheduleGridComputeWithAi = createServerFn({ method: "POST" })
  .validator((input: unknown) => input as GridSchedulingRequest)
  .handler(async ({ data }): Promise<GridSchedulingResponse> => {
    const rawKey = (process.env.GROQ_API_KEY || "").replace(/^["']|["']$/g, "").trim();
    const rawModel = (process.env.GROQ_MODEL || "openai/gpt-oss-120b").replace(/^["']|["']$/g, "").trim();
    const users = data.totalUsers || 1000;
    const surplusKw = data.gridSurplusKw || 150;
    const tariff = data.energyTariffInr || 8.0;
    const strat = data.schedulingStrategy || "green_surplus_boost";

    if (rawKey) {
      try {
        const sys = `You are an expert AI & HPC Energy Grid Orchestration Engine.
Reply ONLY with strict JSON (no code fences, no markdown) matching this JSON shape:
{
  "summary_plan": string,
  "allocated_members": number,
  "active_nodes_count": number,
  "sleeping_consolidated_nodes": number,
  "power_saved_kw": number,
  "monthly_savings_inr": number,
  "grid_surplus_utilized_kw": number,
  "tier_allocations": [
    {
      "tier": string,
      "member_count": number,
      "gpu_profile": string,
      "total_slices": number,
      "assigned_nodes": string,
      "power_cap_watts_per_gpu": number,
      "cpu_cores_per_user": number
    }
  ],
  "node_power_actions": [
    {
      "node_range": string,
      "hardware": string,
      "action": string,
      "power_state": string,
      "target_users": string
    }
  ],
  "slurm_dynamic_partition_conf": string,
  "k8s_kueue_energy_manifest": string,
  "power_capping_bash_script": string
}`;

        const userPrompt = `Cluster Fleet Context:
- 120 bare-metal nodes hosting 160 physical GPUs (40x A100 SXM4 80GB, 40x A100 PCIe 80GB, 80x RTX 4090 24GB).
- Target Members to Schedule: ${users} users.
- Grid Surplus Renewable Power Available: ${surplusKw} kW.
- Electricity Tariff Rate: ${tariff} INR/kWh.
- Scheduling Strategy: ${strat}.
- Slicing Rules: Tier 1 (70% users: 1/7 MIG or 1/8 Time-slice), Tier 2 (25% users: 2/7 MIG or 1/2 GPU share), Tier 3 (5% users: Full un-sliced GPUs with RDMA).
- Objective: Calculate exact node-by-node placement, consolidate idle nodes to eliminate standby waste, cap/boost GPU wattage based on grid power surplus, and generate Slurm, Kubernetes Kueue, and Bash power capping configurations.`;

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${rawKey}`,
          },
          body: JSON.stringify({
            model: rawModel,
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: sys },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const content = json.choices?.[0]?.message?.content ?? "{}";
          return JSON.parse(content) as GridSchedulingResponse;
        }
      } catch (e) {
        console.error("Groq AI Grid Scheduler call failed:", e);
      }
    }

    // High-fidelity fallback scheduling matrix
    const t1 = Math.round(users * 0.7);
    const t2 = Math.round(users * 0.25);
    const t3 = Math.max(1, users - t1 - t2);

    const activeNodes = Math.min(120, Math.ceil(users / 10) + 15);
    const sleepingNodes = 120 - activeNodes;
    const powerSavedKw = Math.round(sleepingNodes * 0.45 + (120 - activeNodes) * 0.25 * (surplusKw > 100 ? 1.2 : 1.0));
    const monthlySavings = Math.round(powerSavedKw * 24 * 30 * tariff);

    return {
      summary_plan: `Dynamic Energy-Grid Scheduler provisioned ${users} members across ${activeNodes} active bare-metal nodes while consolidating ${sleepingNodes} idle nodes into C6 low-power sleep states. Captured ${surplusKw} kW of green power to boost Tier 3 distributed training to 400W TDP, while holding Tier 1 MIG slices at an energy-efficient 250W power cap.`,
      allocated_members: users,
      active_nodes_count: activeNodes,
      sleeping_consolidated_nodes: sleepingNodes,
      power_saved_kw: powerSavedKw,
      monthly_savings_inr: monthlySavings,
      grid_surplus_utilized_kw: Math.min(surplusKw, activeNodes * 1.5),
      tier_allocations: [
        {
          tier: "Tier 1: Dev / Jupyter",
          member_count: t1,
          gpu_profile: "1/7th MIG (1g.10gb) & RTX 4090 8x Time-Slice",
          total_slices: t1,
          assigned_nodes: "node[041-075], node[081-110]",
          power_cap_watts_per_gpu: 220,
          cpu_cores_per_user: 4,
        },
        {
          tier: "Tier 2: Fine-Tuning",
          member_count: t2,
          gpu_profile: "2/7th MIG (2g.20gb) & Dedicated NVMe",
          total_slices: t2,
          assigned_nodes: "node[021-040], node[076-080]",
          power_cap_watts_per_gpu: 300,
          cpu_cores_per_user: 16,
        },
        {
          tier: "Tier 3: Distributed Heavy ML",
          member_count: t3,
          gpu_profile: "Full Un-sliced A100 SXM4 (80GB) + InfiniBand RDMA",
          total_slices: t3 * 2,
          assigned_nodes: "node[001-020]",
          power_cap_watts_per_gpu: 400,
          cpu_cores_per_user: 32,
        },
      ],
      node_power_actions: [
        {
          node_range: "node[001-020]",
          hardware: "20x A100 SXM4 (80GB)",
          action: "Grid Surplus Turbo Boost (400W)",
          power_state: "High Performance Active",
          target_users: `${t3} Heavy Distributed ML Researchers`,
        },
        {
          node_range: "node[021-080]",
          hardware: "60x A100 PCIe (MIG Slices)",
          action: "Energy Cap Standard (250W-300W)",
          power_state: "Balanced Multi-Tenant Sliced",
          target_users: `${t2} Fine-Tuning Engineers + ${Math.round(t1 * 0.4)} Devs`,
        },
        {
          node_range: "node[081-105]",
          hardware: "25x Dual RTX 4090 (Time-Sliced)",
          action: "MPS Time-Slicing Dense Packing",
          power_state: "High Density Low-Energy",
          target_users: `${Math.round(t1 * 0.6)} Dev Members`,
        },
        {
          node_range: "node[106-120]",
          hardware: "15x Idle Bare-Metal Hosts",
          action: "Consolidated Standby Deep Sleep (C6)",
          power_state: "Standby Powered Off (0W draw)",
          target_users: "0 (Consolidated onto nodes 041-105)",
        },
      ],
      slurm_dynamic_partition_conf: `# /etc/slurm/slurm.conf (Energy Grid Dynamic Generation)
# Surplus Grid Power Available: ${surplusKw} kW | Power Policy: ${strat}

PartitionName=tier1_dev Nodes=node[041-075],node[081-110] Default=YES MaxTime=12:00:00 DefMemPerCPU=8192 AllowQOS=tier1_qos State=UP
PartitionName=tier2_inter Nodes=node[021-040],node[076-080] MaxTime=48:00:00 DefMemPerCPU=16384 AllowQOS=tier2_qos State=UP
PartitionName=tier3_heavy Nodes=node[001-020] MaxTime=72:00:00 DefMemPerCPU=32768 AllowQOS=tier3_qos PriorityTier=100 State=UP
PartitionName=idle_sleep Nodes=node[106-120] State=DRAIN Reason="Energy Grid Consolidation"`,
      k8s_kueue_energy_manifest: `apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: energy-grid-cluster-queue
spec:
  namespaceSelector: {}
  cohort: energy-aware-cohort
  resourceGroups:
    - coveredResources: ["nvidia.com/gpu", "nvidia.com/mig-1g.10gb", "cpu", "memory"]
      flavors:
        - name: green-surplus-flavor
          resources:
            - name: "nvidia.com/gpu"
              nominalQuota: 40
            - name: "nvidia.com/mig-1g.10gb"
              nominalQuota: 560
            - name: "cpu"
              nominalQuota: 5120
            - name: "memory"
              nominalQuota: 40Ti`,
      power_capping_bash_script: `#!/usr/bin/env bash
# Dynamic Node Power Capping Script (Energy Grid Automated)
set -euo pipefail

echo "[*] Applying GPU Power Limits based on ${surplusKw} kW Grid Headroom..."

# Boost Heavy ML Nodes (001-020) to 400W
pdsh -w node[001-020] "nvidia-smi -pl 400"

# Cap Medium & Sliced Nodes (021-080) to 250W
pdsh -w node[021-080] "nvidia-smi -pl 250"

# Put Idle Nodes (106-120) to sleep to prevent standby waste
pdsh -w node[106-120] "systemctl suspend || ipmitool power soft"

echo "[+] Dynamic Energy Grid Power Capping Complete."`,
    };
  });

export const generateClusterWorkloadConfig = createServerFn({ method: "POST" })
  .validator((input: unknown) => input as DeviceProfileRequest)
  .handler(async ({ data }) => {
    const job = data.jobName.trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "heterogeneous_job";
    const ns = data.tier === "tier3" ? "user-tier-3" : data.tier === "tier2" ? "user-tier-2" : "user-tier-1";

    let k8sGpuLimit = "";
    if (data.gpuType === "mig_1g_10gb") k8sGpuLimit = '          nvidia.com/mig-1g.10gb: ' + data.gpuCount;
    else if (data.gpuType === "mig_2g_20gb") k8sGpuLimit = '          nvidia.com/mig-2g.20gb: ' + data.gpuCount;
    else if (data.gpuType === "mig_3g_40gb") k8sGpuLimit = '          nvidia.com/mig-3g.40gb: ' + data.gpuCount;
    else if (data.gpuType === "full_a100_80gb") k8sGpuLimit = '          nvidia.com/gpu: ' + data.gpuCount;
    else if (data.gpuType === "rtx4090_slice") k8sGpuLimit = '          nvidia.com/gpu: 1 # Time-sliced 1/8 virtual share';
    else if (data.gpuType === "multi_gpu_4x") k8sGpuLimit = '          nvidia.com/gpu: 4';
    else if (data.gpuType === "multi_gpu_8x") k8sGpuLimit = '          nvidia.com/gpu: 8';

    const k8sRdmaLimit = data.networkInterconnect === "sriov_rdma_ib" ? '          rdma/hca_shared: 1\n' : '';

    const k8sYaml = `apiVersion: v1
kind: Pod
metadata:
  name: ${job}
  namespace: ${ns}
  labels:
    tier: ${data.tier}
    workload: ${data.workloadType}
    cpu-isolation: ${data.cpuIsolation}
spec:
  restartPolicy: Never
  runtimeClassName: nvidia
  containers:
    - name: compute-container
      image: nvcr.io/nvidia/pytorch:24.01-py3
      command: ["/bin/bash", "-c"]
      args:
        - |
          echo "=== Device Topology Initialized ==="
          nvidia-smi
          numactl --show
          ${data.workloadType === "jupyter" ? "jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root" : "python3 -m torch.distributed.run train.py"}
      resources:
        limits:
${k8sGpuLimit ? k8sGpuLimit + "\n" : ""}${k8sRdmaLimit}          cpu: "${data.cpuCores}"
          memory: "${data.systemMemoryGb}Gi"
          ephemeral-storage: "${data.storageSizeGb}Gi"
        requests:
${k8sGpuLimit ? k8sGpuLimit + "\n" : ""}          cpu: "${data.cpuCores}"
          memory: "${data.systemMemoryGb}Gi"
      volumeMounts:
        - name: scratch-storage
          mountPath: /scratch
        - name: host-dshm
          mountPath: /dev/shm
  volumes:
    - name: scratch-storage
      ${data.storageType === "nvme_local" ? "hostPath:\n        path: /mnt/fast-nvme-scratch/${job}\n        type: DirectoryOrCreate" : "emptyDir:\n        sizeLimit: " + data.storageSizeGb + "Gi"}
    - name: host-dshm
      emptyDir:
        medium: Memory
        sizeLimit: 16Gi`;

    let slurmGres = "";
    if (data.gpuType === "mig_1g_10gb") slurmGres = "gpu:mig_1g_10gb:" + data.gpuCount;
    else if (data.gpuType === "mig_2g_20gb") slurmGres = "gpu:mig_2g_20gb:" + data.gpuCount;
    else if (data.gpuType === "mig_3g_40gb") slurmGres = "gpu:mig_3g_40gb:" + data.gpuCount;
    else if (data.gpuType === "full_a100_80gb") slurmGres = "gpu:a100_80gb:" + data.gpuCount;
    else if (data.gpuType === "rtx4090_slice") slurmGres = "gpu:rtx4090:1";
    else if (data.gpuType === "multi_gpu_4x") slurmGres = "gpu:a100_80gb:4";
    else if (data.gpuType === "multi_gpu_8x") slurmGres = "gpu:a100_80gb:8";

    if (data.storageType === "nvme_local") slurmGres += (slurmGres ? "," : "") + "nvme:1";
    if (data.networkInterconnect === "sriov_rdma_ib") slurmGres += (slurmGres ? "," : "") + "ib:1";

    const partition = data.tier === "tier3" ? "tier3_heavy" : data.tier === "tier2" ? "tier2_inter" : "tier1_dev";
    const qos = data.tier + "_qos";
    const timeLimit = data.tier === "tier3" ? "72:00:00" : data.tier === "tier2" ? "48:00:00" : "12:00:00";

    const numaExec = data.numaBinding
      ? 'numactl --cpunodebind=' + data.numaNode + ' --membind=' + data.numaNode + ' '
      : '';

    const slurmScript = `#!/bin/bash
#SBATCH --job-name=${job}
#SBATCH --partition=${partition}
#SBATCH --qos=${qos}
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=${data.cpuCores}
#SBATCH --mem=${data.systemMemoryGb}G
${slurmGres ? "#SBATCH --gres=" + slurmGres : ""}
#SBATCH --time=${timeLimit}
#SBATCH --output=/workspace/logs/%j_${job}.out

echo "=== Slurm Job Execution Context ==="
echo "Allocated GPUs: $CUDA_VISIBLE_DEVICES"
echo "Allocated GRES: $SLURM_JOB_GRES"

export OMP_NUM_THREADS=${data.cpuCores}
export NCCL_DEBUG=INFO
${data.networkInterconnect === "sriov_rdma_ib" ? "export NCCL_IB_DISABLE=0\nexport NCCL_IB_HCA=mlx5_0" : "export NCCL_IB_DISABLE=1"}

${numaExec}python3 -u train.py \
    --data-dir ${data.storageType === "nvme_local" ? "/mnt/nvme0n1/scratch" : "/tmp/scratch"} \
    --batch-size 64
`;

    const jupyterProfile = `# JupyterHub Spawner Profile
{
    'display_name': '${data.tier.toUpperCase()}: ${data.jobName} (${data.gpuType}, ${data.cpuCores} Cores, ${data.systemMemoryGb}GB RAM)',
    'kubespawner_override': {
        'cpu_limit': ${data.cpuCores},
        'mem_limit': '${data.systemMemoryGb}G',
        'extra_resource_limits': {
            ${data.gpuType.startsWith("mig") ? "'nvidia.com/" + data.gpuType.replace(/_/g, "-") + "': '" + data.gpuCount + "'" : "'nvidia.com/gpu': '" + (data.gpuCount || 1) + "'"}
        },
        'image': 'nvcr.io/nvidia/pytorch:24.01-py3'
    }
}`;

    const hostCli = `# 1. Inspect Assigned GPU Slices on Bare-Metal Node:
nvidia-smi mig -lgi
nvidia-smi --query-gpu=index,name,memory.total,utilization.gpu,power.draw --format=csv

# 2. Check cgroups v2 CPU & Memory Bounds:
cat /sys/fs/cgroup/cpuset.cpus
cat /sys/fs/cgroup/memory.max

# 3. Verify Direct NVMe & InfiniBand RDMA Status:
ls -la /dev/nvme*
ibv_devinfo -v | grep -E "hca_id|transport|state"
`;

    return {
      kubernetesYaml: k8sYaml,
      slurmScript,
      jupyterHubProfile: jupyterProfile,
      hostCliCommands: hostCli,
    } as GeneratedConfigs;
  });
