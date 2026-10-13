# jupyterhub_config.py - Dynamic Multi-Device Selection Spawner Menu
c.KubeSpawner.profile_list = [
    {
        'display_name': 'Tier 1: Dev Notebook (1/7 MIG GPU [10GB], 4 CPU, 16GB RAM)',
        'default': True,
        'kubespawner_override': {
            'cpu_limit': 4,
            'mem_limit': '16G',
            'extra_resource_limits': {'nvidia.com/mig-1g.10gb': '1'}
        }
    },
    {
        'display_name': 'Tier 2: Fine-Tuning (2/7 MIG GPU [20GB], 16 CPU, 64GB RAM, Local NVMe)',
        'kubespawner_override': {
            'cpu_limit': 16,
            'mem_limit': '64G',
            'extra_resource_limits': {
                'nvidia.com/mig-2g.20gb': '1',
                'ephemeral-storage': '100Gi'
            }
        }
    },
    {
        'display_name': 'Tier 3: Full Compute (1x Full A100/H100 [80GB], 32 CPU, 128GB RAM, InfiniBand RDMA)',
        'kubespawner_override': {
            'cpu_limit': 32,
            'mem_limit': '128G',
            'extra_resource_limits': {
                'nvidia.com/gpu': '1',
                'rdma/hca_shared': '1'
            }
        }
    }
]
