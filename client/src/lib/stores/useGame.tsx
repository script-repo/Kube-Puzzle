import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "briefing" | "playing" | "levelComplete" | "gameComplete";

export interface Pod {
  id: string;
  name: string;
  color: string;
  nodeId: string | null;
  status: "pending" | "running" | "terminating" | "failed";
  position: [number, number, number];
  resources: {
    vCPURequest: number;
    memoryRequest: number;  // GB
  };
  storage?: {
    required: boolean;
    type: 'block' | 'nfs' | 'object' | null;
    size: number;  // GB
  };
  scheduling?: {
    requiresBaremetal?: boolean;
    antiAffinityKey?: string;
    nodeSelector?: Record<string, string>;
  };
}

export interface Node {
  id: string;
  name: string;
  capacity: number;
  position: [number, number, number];
  pods: string[];
  resources: {
    vCPU: number;
    vCPUUsed: number;
    memory: number;        // GB
    memoryUsed: number;    // GB
  };
  infrastructure: {
    nodeType: 'worker' | 'control-plane' | 'storage' | 'compute';
    hypervisor: 'kvm' | 'vmware' | 'baremetal' | null;
    physicalHostId: string | null;
    storageTypes: Array<'block' | 'nfs' | 'object'>;
    zone?: string;
  };
  controlPlane?: {
    components: Array<'etcd' | 'apiserver' | 'scheduler' | 'controller-manager'>;
    healthy: boolean;
  };
}

export interface LevelObjective {
  description: string;
  completed: boolean;
}

export interface PhysicalHost {
  id: string;
  name: string;
  resources: {
    pCPU: number;
    pCPUUsed: number;
    memory: number;
    memoryUsed: number;
  };
  vms: string[];  // Node IDs
  zone?: string;
}

export interface ControlPlaneNode {
  id: string;
  name: string;
  componentType: 'etcd' | 'apiserver' | 'scheduler' | 'controller-manager';
  position: [number, number, number];
  healthy: boolean;
  metadata?: {
    version?: string;
    endpoint?: string;
  };
}

export interface Level {
  id: number;
  name: string;
  description: string;
  nodes: Node[];
  pods: Pod[];
  objectives: LevelObjective[];
  targetConfiguration: Record<string, string[]>;
  hint?: string;
  analysis?: string;
  infrastructure?: {
    physicalHosts?: PhysicalHost[];
    controlPlane?: ControlPlaneNode[];
    enableResourceValidation: boolean;
    enableStorageValidation: boolean;
    enableAntiAffinity: boolean;
  };
}

interface GameState {
  phase: GamePhase;
  currentLevel: number;
  levels: Level[];
  nodes: Node[];
  pods: Pod[];
  selectedPodId: string | null;
  hoveredNodeId: string | null;
  hoveredPodId: string | null;
  objectives: LevelObjective[];
  logs: string[];
  score: number;
  revealsRemaining: number;
  solutionRevealed: boolean;
  completedLevels: Set<number>;
  physicalHosts: PhysicalHost[];
  controlPlane: ControlPlaneNode[];
  hoveredPhysicalHostId: string | null;
  hoveredControlPlaneId: string | null;

  start: () => void;
  startLevel: () => void;
  restart: () => void;
  nextLevel: () => void;
  setPhase: (phase: GamePhase) => void;
  selectPod: (podId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  hoverPod: (podId: string | null) => void;
  hoverPhysicalHost: (hostId: string | null) => void;
  hoverControlPlane: (cpId: string | null) => void;
  movePodToNode: (podId: string, nodeId: string) => void;
  addLog: (message: string) => void;
  checkObjectives: () => void;
  loadLevel: (levelIndex: number) => void;
  revealSolution: () => void;
  jumpToLevel: (levelIndex: number) => void;
}

const LEVELS: Level[] = [
  {
    id: 1,
    name: "Pod Scheduling 101",
    description: "Deploy pods to the correct nodes to match the deployment manifest.",
    nodes: [
      {
        id: "node-1",
        name: "worker-1",
        capacity: 3,
        position: [-6, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-2",
        name: "worker-2",
        capacity: 3,
        position: [0, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-3",
        name: "worker-3",
        capacity: 3,
        position: [6, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "frontend-a",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-2",
        name: "frontend-b",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [0, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-3",
        name: "backend-a",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [4, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
    ],
    objectives: [
      { description: "Deploy 2 frontend pods to worker-1", completed: false },
      { description: "Deploy 1 backend pod to worker-2", completed: false },
    ],
    targetConfiguration: {
      "node-1": ["pod-1", "pod-2"],
      "node-2": ["pod-3"],
    },
    hint: "Deploy pods with matching colors to the correct nodes. Read the objectives carefully - frontend pods go to worker-1, backend pods go to worker-2.",
    analysis: "This solution demonstrates basic pod scheduling in Kubernetes. Frontend pods are grouped on worker-1 to enable efficient horizontal scaling and load balancing. Backend pods are isolated on worker-2 to separate concerns and prevent resource contention. This architecture follows the principle of workload segregation - keeping similar workloads together while separating different application tiers. Worker-3 remains available for future scaling needs.",
    infrastructure: {
      enableResourceValidation: false,
      enableStorageValidation: false,
      enableAntiAffinity: false
    }
  },
  {
    id: 2,
    name: "Load Balancing",
    description: "Distribute pods evenly across all available nodes.",
    nodes: [
      {
        id: "node-1",
        name: "worker-1",
        capacity: 2,
        position: [-6, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-2",
        name: "worker-2",
        capacity: 2,
        position: [0, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-3",
        name: "worker-3",
        capacity: 2,
        position: [6, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "api-1",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-2",
        name: "api-2",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-3",
        name: "api-3",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-4",
        name: "cache-1",
        color: "#8b5cf6",
        nodeId: null,
        status: "pending",
        position: [6, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-5",
        name: "cache-2",
        color: "#8b5cf6",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 12],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-6",
        name: "db-1",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [4, 5, 12],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
    ],
    objectives: [
      { description: "Each node must have exactly 2 pods", completed: false },
      { description: "No two pods of the same type on one node", completed: false },
    ],
    targetConfiguration: {},
    hint: "Distribute pods evenly - each node needs exactly 2 pods. Make sure no node has two pods of the same color!",
    analysis: "Multiple valid solutions exist for this level. The optimal approach is even distribution (2 pods per node) while avoiding pod type collocation. This prevents single points of failure - if one node fails, you still have instances of each service type running on other nodes. Any configuration that spreads different service types across all nodes is equally valid. The key principle: maximize availability through distribution and diversity.",
    infrastructure: {
      enableResourceValidation: false,
      enableStorageValidation: false,
      enableAntiAffinity: false
    }
  },
  {
    id: 3,
    name: "Resource Constraints",
    description: "Schedule pods while respecting node capacity limits.",
    nodes: [
      {
        id: "node-1",
        name: "high-mem",
        capacity: 4,
        position: [-6, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-2",
        name: "high-cpu",
        capacity: 2,
        position: [0, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'compute' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-3",
        name: "gpu-node",
        capacity: 1,
        position: [6, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'compute' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "ml-train",
        color: "#ec4899",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 4, memoryRequest: 8 }
      },
      {
        id: "pod-2",
        name: "data-proc-1",
        color: "#06b6d4",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 2 }
      },
      {
        id: "pod-3",
        name: "data-proc-2",
        color: "#06b6d4",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 2 }
      },
      {
        id: "pod-4",
        name: "mem-cache-1",
        color: "#84cc16",
        nodeId: null,
        status: "pending",
        position: [6, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 3 }
      },
      {
        id: "pod-5",
        name: "mem-cache-2",
        color: "#84cc16",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 12],
        resources: { vCPURequest: 0.5, memoryRequest: 3 }
      },
      {
        id: "pod-6",
        name: "mem-cache-3",
        color: "#84cc16",
        nodeId: null,
        status: "pending",
        position: [0, 5, 12],
        resources: { vCPURequest: 0.5, memoryRequest: 3 }
      },
      {
        id: "pod-7",
        name: "mem-cache-4",
        color: "#84cc16",
        nodeId: null,
        status: "pending",
        position: [4, 5, 12],
        resources: { vCPURequest: 0.5, memoryRequest: 3 }
      },
    ],
    objectives: [
      { description: "Deploy ml-train to gpu-node", completed: false },
      { description: "Deploy data processors to high-cpu", completed: false },
      { description: "Deploy all memory caches to high-mem", completed: false },
    ],
    targetConfiguration: {
      "node-3": ["pod-1"],
      "node-2": ["pod-2", "pod-3"],
      "node-1": ["pod-4", "pod-5", "pod-6", "pod-7"],
    },
    hint: "Match workloads to node types: ML training needs GPU, data processors need CPU, memory caches need high memory nodes.",
    analysis: "This solution demonstrates resource-aware scheduling in Kubernetes. GPU-intensive ML training must run on the specialized GPU node. CPU-heavy data processing workloads are matched to high-CPU nodes for optimal performance. Memory caches are placed on high-memory nodes to maximize cache capacity. This is the ONLY valid solution - matching workload characteristics to node capabilities is critical for performance. Mismatched scheduling would cause resource contention or performance degradation.",
    infrastructure: {
      enableResourceValidation: false,
      enableStorageValidation: false,
      enableAntiAffinity: false
    }
  },
  {
    id: 4,
    name: "High Availability Deployment",
    description: "Ensure redundancy across nodes - no single point of failure.",
    nodes: [
      {
        id: "node-1",
        name: "worker-1",
        capacity: 2,
        position: [-8, 0, 0],
        pods: [],
        resources: { vCPU: 3, vCPUUsed: 0, memory: 6, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-2",
        name: "worker-2",
        capacity: 2,
        position: [-3, 0, 0],
        pods: [],
        resources: { vCPU: 3, vCPUUsed: 0, memory: 6, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-3",
        name: "worker-3",
        capacity: 2,
        position: [3, 0, 0],
        pods: [],
        resources: { vCPU: 3, vCPUUsed: 0, memory: 6, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-4",
        name: "worker-4",
        capacity: 2,
        position: [8, 0, 0],
        pods: [],
        resources: { vCPU: 3, vCPUUsed: 0, memory: 6, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "web-replica-1",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [-8, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-2",
        name: "web-replica-2",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-3",
        name: "api-replica-1",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 8],
        resources: { vCPURequest: 1.5, memoryRequest: 2 }
      },
      {
        id: "pod-4",
        name: "api-replica-2",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 1.5, memoryRequest: 2 }
      },
      {
        id: "pod-5",
        name: "cache-replica-1",
        color: "#8b5cf6",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-6",
        name: "cache-replica-2",
        color: "#8b5cf6",
        nodeId: null,
        status: "pending",
        position: [4, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-7",
        name: "db-replica-1",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [6, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-8",
        name: "db-replica-2",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [8, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
    ],
    objectives: [
      { description: "Each replica pair must be on different nodes", completed: false },
      { description: "All nodes must have exactly 2 pods", completed: false },
      { description: "No single point of failure for any service", completed: false },
    ],
    targetConfiguration: {},
    hint: "Separate replica pairs! Each matching color pair (web-1/web-2, api-1/api-2, etc.) must be on different nodes for high availability.",
    analysis: "Multiple valid solutions exist. The best practice is anti-affinity scheduling - ensuring replica pairs never share a node. If worker-1 fails, you still have web-replica-2 on another node. Any distribution that keeps pairs separated AND balances 2 pods per node is optimal. This mimics Kubernetes PodAntiAffinity rules. The key principle: eliminate single points of failure by distributing replicas across failure domains (nodes).",
    infrastructure: {
      enableResourceValidation: true,
      enableStorageValidation: false,
      enableAntiAffinity: false
    }
  },
  {
    id: 5,
    name: "Namespace Isolation",
    description: "Separate production, staging, and development workloads.",
    nodes: [
      {
        id: "node-1",
        name: "prod-1",
        capacity: 3,
        position: [-6, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'vmware' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-2",
        name: "prod-2",
        capacity: 3,
        position: [0, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'vmware' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-3",
        name: "dev-1",
        capacity: 4,
        position: [6, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "prod-web",
        color: "#fbbf24",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-2",
        name: "prod-api",
        color: "#fbbf24",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-3",
        name: "prod-db",
        color: "#fbbf24",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-4",
        name: "staging-web",
        color: "#fb923c",
        nodeId: null,
        status: "pending",
        position: [0, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-5",
        name: "staging-api",
        color: "#fb923c",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-6",
        name: "staging-db",
        color: "#fb923c",
        nodeId: null,
        status: "pending",
        position: [4, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-7",
        name: "dev-web",
        color: "#06b6d4",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 12],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-8",
        name: "dev-api",
        color: "#06b6d4",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 12],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-9",
        name: "dev-db",
        color: "#06b6d4",
        nodeId: null,
        status: "pending",
        position: [2, 5, 12],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-10",
        name: "dev-test",
        color: "#06b6d4",
        nodeId: null,
        status: "pending",
        position: [4, 5, 12],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
    ],
    objectives: [
      { description: "Production pods ONLY on prod nodes", completed: false },
      { description: "No dev pods on production nodes", completed: false },
      { description: "All pods must be scheduled", completed: false },
    ],
    targetConfiguration: {},
    hint: "Keep environments separate! Gold pods only on prod nodes, cyan pods on dev node, orange staging pods can go on either prod-2 or dev-1.",
    analysis: "Multiple valid solutions exist, but the BEST solution isolates production workloads completely. Production pods (gold) go on prod-1, staging pods (orange) on prod-2, and development/test workloads (cyan) on dev-1. Alternative: putting staging on dev-1 is also valid but less ideal. The optimal approach maintains strict namespace isolation - production never shares resources with lower environments, preventing dev workloads from impacting production stability or security.",
    infrastructure: {
      enableResourceValidation: true,
      enableStorageValidation: false,
      enableAntiAffinity: false
    }
  },
  {
    id: 6,
    name: "Priority & Preemption",
    description: "Schedule critical workloads first, optimize resource usage.",
    nodes: [
      {
        id: "node-1",
        name: "worker-1",
        capacity: 3,
        position: [-6, 0, 0],
        pods: [],
        resources: { vCPU: 5, vCPUUsed: 0, memory: 10, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-2",
        name: "worker-2",
        capacity: 3,
        position: [6, 0, 0],
        pods: [],
        resources: { vCPU: 5, vCPUUsed: 0, memory: 10, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "critical-auth",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-2",
        name: "critical-billing",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-3",
        name: "business-checkout",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-4",
        name: "business-analytics",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 1.5, memoryRequest: 3 }
      },
      {
        id: "pod-5",
        name: "business-reports",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [4, 5, 8],
        resources: { vCPURequest: 1.5, memoryRequest: 3 }
      },
      {
        id: "pod-6",
        name: "batch-cleanup",
        color: "#6b7280",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 12],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-7",
        name: "batch-export",
        color: "#6b7280",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 12],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-8",
        name: "batch-archive",
        color: "#6b7280",
        nodeId: null,
        status: "pending",
        position: [2, 5, 12],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-9",
        name: "batch-backup",
        color: "#6b7280",
        nodeId: null,
        status: "pending",
        position: [4, 5, 12],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
    ],
    objectives: [
      { description: "All critical pods must be scheduled", completed: false },
      { description: "All business pods must be scheduled", completed: false },
      { description: "Schedule as many batch jobs as possible", completed: false },
    ],
    targetConfiguration: {},
    hint: "Priority matters! Schedule red (critical) and orange (business) pods first. Gray batch jobs are lowest priority - fit them in remaining space.",
    analysis: "This demonstrates Kubernetes priority classes and resource optimization. The BEST solution schedules all critical (red) and business (orange) pods first, using 6 of 6 available slots. This leaves NO room for batch jobs - and that's correct! In real clusters, low-priority batch jobs are preemptible and yield resources to higher-priority workloads. Critical services (auth, billing) must never be starved. This is the optimal solution: prioritize business continuity over best-effort batch processing.",
    infrastructure: {
      enableResourceValidation: true,
      enableStorageValidation: false,
      enableAntiAffinity: false
    }
  },
  {
    id: 7,
    name: "Stateful Services & Quorum",
    description: "Deploy distributed stateful workloads with quorum requirements.",
    nodes: [
      {
        id: "node-1",
        name: "zone-us-east-1a",
        capacity: 4,
        position: [-9, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'storage' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: null,
          storageTypes: ['block' as const, 'nfs' as const],
          zone: 'us-east-1a'
        }
      },
      {
        id: "node-2",
        name: "zone-us-east-1b",
        capacity: 3,
        position: [-3, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'storage' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: null,
          storageTypes: ['block' as const, 'nfs' as const],
          zone: 'us-east-1b'
        }
      },
      {
        id: "node-3",
        name: "zone-us-east-1c",
        capacity: 3,
        position: [3, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'storage' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: null,
          storageTypes: ['block' as const],
          zone: 'us-east-1c'
        }
      },
      {
        id: "node-4",
        name: "zone-us-west-2a",
        capacity: 2,
        position: [9, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'storage' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: null,
          storageTypes: ['block' as const, 'object' as const],
          zone: 'us-west-2a'
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "etcd-0",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [-8, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        storage: { required: true, type: 'block' as const, size: 10 }
      },
      {
        id: "pod-2",
        name: "etcd-1",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        storage: { required: true, type: 'block' as const, size: 10 }
      },
      {
        id: "pod-3",
        name: "etcd-2",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        storage: { required: true, type: 'block' as const, size: 10 }
      },
      {
        id: "pod-4",
        name: "zookeeper-0",
        color: "#8b5cf6",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        storage: { required: true, type: 'block' as const, size: 5 }
      },
      {
        id: "pod-5",
        name: "zookeeper-1",
        color: "#8b5cf6",
        nodeId: null,
        status: "pending",
        position: [0, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        storage: { required: true, type: 'block' as const, size: 5 }
      },
      {
        id: "pod-6",
        name: "zookeeper-2",
        color: "#8b5cf6",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        storage: { required: true, type: 'block' as const, size: 5 }
      },
      {
        id: "pod-7",
        name: "redis-0",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [4, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 },
        storage: { required: true, type: 'nfs' as const, size: 3 }
      },
      {
        id: "pod-8",
        name: "redis-1",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [6, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 },
        storage: { required: true, type: 'nfs' as const, size: 3 }
      },
      {
        id: "pod-9",
        name: "redis-2",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [8, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 },
        storage: { required: true, type: 'block' as const, size: 3 }
      },
      {
        id: "pod-10",
        name: "prometheus-0",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 12],
        resources: { vCPURequest: 1.5, memoryRequest: 3 },
        storage: { required: true, type: 'block' as const, size: 20 }
      },
      {
        id: "pod-11",
        name: "prometheus-1",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 12],
        resources: { vCPURequest: 1.5, memoryRequest: 3 },
        storage: { required: true, type: 'block' as const, size: 20 }
      },
      {
        id: "pod-12",
        name: "prometheus-2",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [2, 5, 12],
        resources: { vCPURequest: 1.5, memoryRequest: 3 },
        storage: { required: true, type: 'block' as const, size: 20 }
      },
    ],
    objectives: [
      { description: "Each stateful set must have replicas in different zones", completed: false },
      { description: "Quorum requirement: At least 2 of 3 replicas in us-east-1", completed: false },
      { description: "All pods must be scheduled within capacity", completed: false },
    ],
    targetConfiguration: {},
    hint: "Quorum-based systems need majority in the primary region (us-east-1). Spread each StatefulSet (etcd, zookeeper, redis, prometheus) across zones, but keep 2/3 replicas in us-east-1 for low-latency consensus. Watch storage requirements!",
    analysis: "This demonstrates advanced stateful scheduling with quorum awareness. The BEST solution places 2 replicas of each StatefulSet in us-east-1 (zones a/b/c) and 1 in us-west-2a. This ensures: (1) Cross-zone redundancy - no single zone failure loses data, (2) Regional quorum - consensus protocols (etcd, zookeeper) maintain majority in us-east-1 for low latency, (3) Disaster recovery - us-west-2a replica survives regional failures. Capacity-aware scheduling is critical: zone-1a has 4 slots for flexibility. This mirrors real production StatefulSet topologySpreadConstraints with zone anti-affinity and regional quorum.",
    infrastructure: {
      enableResourceValidation: true,
      enableStorageValidation: true,
      enableAntiAffinity: false
    }
  },
  {
    id: 8,
    name: "Chaos Engineering",
    description: "Handle node failure and reschedule pods quickly.",
    nodes: [
      {
        id: "node-1",
        name: "worker-1",
        capacity: 3,
        position: [-8, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
      {
        id: "node-2",
        name: "worker-2",
        capacity: 3,
        position: [-3, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
      {
        id: "node-3",
        name: "worker-3",
        capacity: 3,
        position: [3, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const, 'object' as const]
        }
      },
      {
        id: "node-4",
        name: "worker-4",
        capacity: 3,
        position: [8, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "api-1",
        color: "#3b82f6",
        nodeId: "node-2",
        status: "running",
        position: [-4, 1.5, 0],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        storage: { required: true, type: 'nfs' as const, size: 5 }
      },
      {
        id: "pod-2",
        name: "api-2",
        color: "#3b82f6",
        nodeId: "node-2",
        status: "running",
        position: [-3, 1.5, 0],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        storage: { required: true, type: 'nfs' as const, size: 5 }
      },
      {
        id: "pod-3",
        name: "api-3",
        color: "#3b82f6",
        nodeId: "node-2",
        status: "running",
        position: [-2, 1.5, 0],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        storage: { required: true, type: 'nfs' as const, size: 5 }
      },
      {
        id: "pod-4",
        name: "web-1",
        color: "#10b981",
        nodeId: "node-1",
        status: "running",
        position: [-9, 1.5, 0],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-5",
        name: "web-2",
        color: "#10b981",
        nodeId: "node-1",
        status: "running",
        position: [-8, 1.5, 0],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-6",
        name: "cache-1",
        color: "#8b5cf6",
        nodeId: "node-3",
        status: "running",
        position: [2, 1.5, 0],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-7",
        name: "cache-2",
        color: "#8b5cf6",
        nodeId: "node-3",
        status: "running",
        position: [4, 1.5, 0],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-8",
        name: "db-1",
        color: "#ef4444",
        nodeId: "node-4",
        status: "running",
        position: [7, 1.5, 0],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        storage: { required: true, type: 'block' as const, size: 20 }
      },
      {
        id: "pod-9",
        name: "db-2",
        color: "#ef4444",
        nodeId: "node-4",
        status: "running",
        position: [9, 1.5, 0],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        storage: { required: true, type: 'block' as const, size: 20 }
      },
    ],
    objectives: [
      { description: "Reschedule all pods from failed node", completed: false },
      { description: "Maintain balanced pod distribution", completed: false },
      { description: "No node over capacity", completed: false },
    ],
    targetConfiguration: {},
    hint: "Worker-2 has failed! Quickly move the 3 blue API pods (which need NFS storage) to the remaining healthy nodes. Balance the load - don't overload any single node!",
    analysis: "The BEST solution distributes the 3 failed API pods evenly: one to worker-1, one to worker-3, one to worker-4. This maintains balanced load (3-3-3 distribution). Alternative solutions exist but are suboptimal - putting 2 API pods on one node creates uneven load. This scenario demonstrates Kubernetes' self-healing: when a node fails, pods are rescheduled across healthy nodes. The optimal strategy: balance load evenly while respecting capacity constraints. Fast, balanced recovery minimizes service disruption.",
    infrastructure: {
      enableResourceValidation: true,
      enableStorageValidation: true,
      enableAntiAffinity: false
    }
  },
  {
    id: 9,
    name: "CSI Persistent Volumes",
    description: "Schedule stateful pods onto storage nodes with spread for resilience.",
    nodes: [
      {
        id: "node-1",
        name: "storage-a",
        capacity: 3,
        position: [-8, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'storage' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: null,
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
      {
        id: "node-2",
        name: "storage-b",
        capacity: 3,
        position: [-3, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'storage' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: null,
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
      {
        id: "node-3",
        name: "compute-1",
        capacity: 3,
        position: [3, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'compute' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['object' as const]
        }
      },
      {
        id: "node-4",
        name: "compute-2",
        capacity: 3,
        position: [8, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'compute' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: null,
          storageTypes: ['object' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "db-0",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-8, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 4 },
        storage: { required: true, type: 'block' as const, size: 50 }
      },
      {
        id: "pod-2",
        name: "db-1",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 4 },
        storage: { required: true, type: 'block' as const, size: 50 }
      },
      {
        id: "pod-3",
        name: "logs-0",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 2 },
        storage: { required: true, type: 'nfs' as const, size: 100 }
      },
      {
        id: "pod-4",
        name: "logs-1",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 2 },
        storage: { required: true, type: 'nfs' as const, size: 100 }
      },
      {
        id: "pod-5",
        name: "api-0",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 2 }
      },
      {
        id: "pod-6",
        name: "api-1",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [4, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 2 }
      },
      {
        id: "pod-7",
        name: "api-2",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [6, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 2 }
      },
    ],
    objectives: [
      { description: "Stateful pods must run only on storage nodes", completed: false },
      { description: "db-0 and db-1 must be on different storage nodes", completed: false },
      { description: "All pods must be scheduled", completed: false },
    ],
    targetConfiguration: {},
    hint: "CSI-backed pods (db, logs) need storage nodes with the right storage type. API pods are stateless and belong on compute nodes. Spread database replicas for resilience!",
    analysis: "This level emphasizes storage topology awareness and PV binding. Stateful pods must land on storage-capable nodes, while db replicas must be separated across storage nodes to keep data resilient during failures. Database pods need block storage, log pods need NFS (shared storage), and stateless API pods run on compute nodes. This mirrors real CSI driver constraints where persistent volumes are bound to specific node pools.",
    infrastructure: {
      enableResourceValidation: true,
      enableStorageValidation: true,
      enableAntiAffinity: false
    }
  },
  {
    id: 10,
    name: "CNI Network Segmentation",
    description: "Keep edge ingress separate from internal services.",
    nodes: [
      {
        id: "node-1",
        name: "edge-1",
        capacity: 3,
        position: [-8, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: 'host-1',
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-2",
        name: "edge-2",
        capacity: 3,
        position: [-3, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: 'host-2',
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-3",
        name: "internal-1",
        capacity: 3,
        position: [3, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'vmware' as const,
          physicalHostId: 'host-3',
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
      {
        id: "node-4",
        name: "internal-2",
        capacity: 3,
        position: [8, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'vmware' as const,
          physicalHostId: 'host-3',
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "ingress-0",
        color: "#f97316",
        nodeId: null,
        status: "pending",
        position: [-8, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        scheduling: { antiAffinityKey: 'ingress' }
      },
      {
        id: "pod-2",
        name: "ingress-1",
        color: "#f97316",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        scheduling: { antiAffinityKey: 'ingress' }
      },
      {
        id: "pod-3",
        name: "frontend-0",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 8],
        resources: { vCPURequest: 1.5, memoryRequest: 3 }
      },
      {
        id: "pod-4",
        name: "frontend-1",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 1.5, memoryRequest: 3 }
      },
      {
        id: "pod-5",
        name: "backend-0",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        storage: { required: true, type: 'nfs' as const, size: 10 },
        scheduling: { antiAffinityKey: 'backend' }
      },
      {
        id: "pod-6",
        name: "backend-1",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [4, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        storage: { required: true, type: 'nfs' as const, size: 10 },
        scheduling: { antiAffinityKey: 'backend' }
      },
      {
        id: "pod-7",
        name: "metrics-0",
        color: "#a855f7",
        nodeId: null,
        status: "pending",
        position: [6, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
    ],
    objectives: [
      { description: "Ingress pods must run only on edge nodes", completed: false },
      { description: "Backend and metrics pods must run only on internal nodes", completed: false },
      { description: "Each edge node must host exactly one ingress pod", completed: false },
    ],
    targetConfiguration: {},
    hint: "Treat edge as north–south traffic and internal as east–west services. Ingress pods need anti-affinity (separate physical hosts), backend pods need NFS storage and also need physical separation.",
    analysis: "This level highlights network segmentation and CNI-enforced boundaries. Edge nodes terminate ingress traffic, while internal nodes host backend services and metrics to reduce exposure. Anti-affinity rules prevent ingress pods from sharing physical hosts (avoiding single point of failure), while backend replicas are also separated for high availability.",
    infrastructure: {
      physicalHosts: [
        { id: 'host-1', name: 'Physical Host 1', resources: { pCPU: 8, pCPUUsed: 0, memory: 16, memoryUsed: 0 }, vms: ['node-1'], zone: 'edge-zone' },
        { id: 'host-2', name: 'Physical Host 2', resources: { pCPU: 8, pCPUUsed: 0, memory: 16, memoryUsed: 0 }, vms: ['node-2'], zone: 'edge-zone' },
        { id: 'host-3', name: 'Physical Host 3', resources: { pCPU: 16, pCPUUsed: 0, memory: 32, memoryUsed: 0 }, vms: ['node-3', 'node-4'], zone: 'internal-zone' }
      ],
      enableResourceValidation: true,
      enableStorageValidation: true,
      enableAntiAffinity: true
    }
  },
  {
    id: 11,
    name: "Authentication & RBAC Hardening",
    description: "Isolate identity services from general workloads.",
    nodes: [
      {
        id: "node-1",
        name: "secure-1",
        capacity: 3,
        position: [-8, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: 'host-1',
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-2",
        name: "secure-2",
        capacity: 3,
        position: [-3, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: 'host-2',
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-3",
        name: "general-1",
        capacity: 3,
        position: [3, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: 'host-3',
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
      {
        id: "node-4",
        name: "general-2",
        capacity: 3,
        position: [8, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: 'host-3',
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "auth-api-0",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-8, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        storage: { required: true, type: 'block' as const, size: 10 },
        scheduling: { antiAffinityKey: 'auth' }
      },
      {
        id: "pod-2",
        name: "auth-api-1",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        storage: { required: true, type: 'block' as const, size: 10 },
        scheduling: { antiAffinityKey: 'auth' }
      },
      {
        id: "pod-3",
        name: "oidc-0",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-4",
        name: "cert-manager-0",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-5",
        name: "frontend-0",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-6",
        name: "frontend-1",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [4, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-7",
        name: "batch-report-0",
        color: "#6b7280",
        nodeId: null,
        status: "pending",
        position: [6, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
    ],
    objectives: [
      { description: "Auth/security pods must run only on secure nodes", completed: false },
      { description: "Non-auth pods must run only on general nodes", completed: false },
      { description: "All pods must be scheduled", completed: false },
    ],
    targetConfiguration: {},
    hint: "Keep identity/security plane isolated. Auth-api replicas need anti-affinity for high availability and block storage for session data.",
    analysis: "This level connects RBAC and identity services to isolated node pools. Keeping auth services on secure nodes reduces blast radius and limits access to sensitive components. Auth API replicas use anti-affinity to ensure they run on separate physical hosts, preventing a single hardware failure from taking down authentication.",
    infrastructure: {
      physicalHosts: [
        { id: 'host-1', name: 'Physical Host 1', resources: { pCPU: 8, pCPUUsed: 0, memory: 16, memoryUsed: 0 }, vms: ['node-1'], zone: 'secure-zone' },
        { id: 'host-2', name: 'Physical Host 2', resources: { pCPU: 8, pCPUUsed: 0, memory: 16, memoryUsed: 0 }, vms: ['node-2'], zone: 'secure-zone' },
        { id: 'host-3', name: 'Physical Host 3', resources: { pCPU: 16, pCPUUsed: 0, memory: 32, memoryUsed: 0 }, vms: ['node-3', 'node-4'], zone: 'general-zone' }
      ],
      enableResourceValidation: true,
      enableStorageValidation: true,
      enableAntiAffinity: true
    }
  },
  {
    id: 12,
    name: "Cluster API Control Plane",
    description: "Separate management plane from workloads and maintain etcd quorum.",
    nodes: [
      {
        id: "node-1",
        name: "control-1",
        capacity: 2,
        position: [-10, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'control-plane' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: 'host-1',
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-2",
        name: "control-2",
        capacity: 2,
        position: [-6, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'control-plane' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: 'host-2',
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-3",
        name: "control-3",
        capacity: 2,
        position: [-2, 0, 0],
        pods: [],
        resources: { vCPU: 4, vCPUUsed: 0, memory: 8, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'control-plane' as const,
          hypervisor: 'baremetal' as const,
          physicalHostId: 'host-3',
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-4",
        name: "worker-1",
        capacity: 3,
        position: [2, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: 'host-4',
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
      {
        id: "node-5",
        name: "worker-2",
        capacity: 3,
        position: [6, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: 'host-4',
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
      {
        id: "node-6",
        name: "worker-3",
        capacity: 3,
        position: [10, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: 'host-5',
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "kube-apiserver-0",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-10, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        scheduling: { antiAffinityKey: 'apiserver' }
      },
      {
        id: "pod-2",
        name: "kube-apiserver-1",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-8, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        scheduling: { antiAffinityKey: 'apiserver' }
      },
      {
        id: "pod-3",
        name: "kube-apiserver-2",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 },
        scheduling: { antiAffinityKey: 'apiserver' }
      },
      {
        id: "pod-4",
        name: "etcd-0",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        storage: { required: true, type: 'block' as const, size: 20 },
        scheduling: { antiAffinityKey: 'etcd' }
      },
      {
        id: "pod-5",
        name: "etcd-1",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        storage: { required: true, type: 'block' as const, size: 20 },
        scheduling: { antiAffinityKey: 'etcd' }
      },
      {
        id: "pod-6",
        name: "etcd-2",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [0, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        storage: { required: true, type: 'block' as const, size: 20 },
        scheduling: { antiAffinityKey: 'etcd' }
      },
      {
        id: "pod-7",
        name: "capi-controller-0",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-8",
        name: "machine-controller-0",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [4, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-9",
        name: "workload-0",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [6, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-10",
        name: "workload-1",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [8, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-11",
        name: "workload-2",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [10, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
    ],
    objectives: [
      { description: "Control-plane pods must run only on control nodes", completed: false },
      { description: "etcd replicas must be on three distinct control nodes", completed: false },
      { description: "Workloads must run only on worker nodes", completed: false },
    ],
    targetConfiguration: {},
    hint: "Keep the management plane on control nodes; spread etcd for quorum. etcd and apiserver pods must use anti-affinity (separate physical hosts).",
    analysis: "This level reinforces CAPI separation and control-plane resiliency. Control-plane services remain isolated, etcd replicas are spread across control nodes for quorum, and workloads stay on worker nodes. Anti-affinity rules ensure etcd members run on separate physical hosts for maximum fault tolerance.",
    infrastructure: {
      physicalHosts: [
        { id: 'host-1', name: 'Physical Host 1', resources: { pCPU: 8, pCPUUsed: 0, memory: 16, memoryUsed: 0 }, vms: ['node-1'], zone: 'control-zone' },
        { id: 'host-2', name: 'Physical Host 2', resources: { pCPU: 8, pCPUUsed: 0, memory: 16, memoryUsed: 0 }, vms: ['node-2'], zone: 'control-zone' },
        { id: 'host-3', name: 'Physical Host 3', resources: { pCPU: 8, pCPUUsed: 0, memory: 16, memoryUsed: 0 }, vms: ['node-3'], zone: 'control-zone' },
        { id: 'host-4', name: 'Physical Host 4', resources: { pCPU: 16, pCPUUsed: 0, memory: 32, memoryUsed: 0 }, vms: ['node-4', 'node-5'], zone: 'worker-zone' },
        { id: 'host-5', name: 'Physical Host 5', resources: { pCPU: 16, pCPUUsed: 0, memory: 32, memoryUsed: 0 }, vms: ['node-6'], zone: 'worker-zone' }
      ],
      controlPlane: [
        { id: 'cp-etcd-1', name: 'etcd-1', componentType: 'etcd' as const, position: [-10, 3, -8], healthy: true },
        { id: 'cp-etcd-2', name: 'etcd-2', componentType: 'etcd' as const, position: [-6, 3, -8], healthy: true },
        { id: 'cp-etcd-3', name: 'etcd-3', componentType: 'etcd' as const, position: [-2, 3, -8], healthy: true },
        { id: 'cp-api-1', name: 'api-1', componentType: 'apiserver' as const, position: [2, 3, -8], healthy: true },
        { id: 'cp-sched-1', name: 'sched-1', componentType: 'scheduler' as const, position: [6, 3, -8], healthy: true },
        { id: 'cp-ctrl-1', name: 'ctrl-1', componentType: 'controller-manager' as const, position: [10, 3, -8], healthy: true }
      ],
      enableResourceValidation: true,
      enableStorageValidation: true,
      enableAntiAffinity: true
    }
  },
  {
    id: 13,
    name: "Fleet Management & GitOps",
    description: "Place GitOps agents, fleet controllers, and workloads across hub and spokes.",
    nodes: [
      {
        id: "node-1",
        name: "hub-1",
        capacity: 3,
        position: [-8, 0, 0],
        pods: [],
        resources: { vCPU: 8, vCPUUsed: 0, memory: 16, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'vmware' as const,
          physicalHostId: 'host-1',
          storageTypes: ['block' as const, 'nfs' as const]
        }
      },
      {
        id: "node-2",
        name: "spoke-1",
        capacity: 3,
        position: [-3, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: 'host-2',
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-3",
        name: "spoke-2",
        capacity: 3,
        position: [3, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: 'host-3',
          storageTypes: ['block' as const]
        }
      },
      {
        id: "node-4",
        name: "spoke-3",
        capacity: 3,
        position: [8, 0, 0],
        pods: [],
        resources: { vCPU: 6, vCPUUsed: 0, memory: 12, memoryUsed: 0 },
        infrastructure: {
          nodeType: 'worker' as const,
          hypervisor: 'kvm' as const,
          physicalHostId: 'host-4',
          storageTypes: ['block' as const]
        }
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "gitops-agent-hub",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-8, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-2",
        name: "gitops-agent-spoke1",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-3",
        name: "gitops-agent-spoke2",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-4, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-4",
        name: "gitops-agent-spoke3",
        color: "#f59e0b",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 8],
        resources: { vCPURequest: 0.5, memoryRequest: 1 }
      },
      {
        id: "pod-5",
        name: "fleet-controller-0",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [2, 5, 8],
        resources: { vCPURequest: 2, memoryRequest: 4 },
        storage: { required: true, type: 'nfs' as const, size: 10 }
      },
      {
        id: "pod-6",
        name: "policy-controller-0",
        color: "#ef4444",
        nodeId: null,
        status: "pending",
        position: [4, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-7",
        name: "config-sync-1",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [6, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-8",
        name: "config-sync-2",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [8, 5, 8],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-9",
        name: "config-sync-3",
        color: "#10b981",
        nodeId: null,
        status: "pending",
        position: [-6, 5, 12],
        resources: { vCPURequest: 1, memoryRequest: 2 }
      },
      {
        id: "pod-10",
        name: "workload-1",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [-2, 5, 12],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-11",
        name: "workload-2",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [2, 5, 12],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
      {
        id: "pod-12",
        name: "workload-3",
        color: "#3b82f6",
        nodeId: null,
        status: "pending",
        position: [6, 5, 12],
        resources: { vCPURequest: 2, memoryRequest: 4 }
      },
    ],
    objectives: [
      { description: "Each node must run its matching GitOps agent", completed: false },
      { description: "Fleet and policy controllers must run on the hub node only", completed: false },
      { description: "Config sync and workloads must run on spoke nodes only", completed: false },
    ],
    targetConfiguration: {},
    hint: "Hub hosts controllers, spokes host sync + workloads. Fleet controller needs NFS storage for state sharing.",
    analysis: "This level explains the fleet management pattern with GitOps agents per cluster. The hub hosts central controllers, while spokes run config sync and workloads. The fleet controller requires NFS storage to share state across the fleet.",
    infrastructure: {
      physicalHosts: [
        { id: 'host-1', name: 'Physical Host 1', resources: { pCPU: 16, pCPUUsed: 0, memory: 32, memoryUsed: 0 }, vms: ['node-1'], zone: 'hub-zone' },
        { id: 'host-2', name: 'Physical Host 2', resources: { pCPU: 8, pCPUUsed: 0, memory: 16, memoryUsed: 0 }, vms: ['node-2'], zone: 'spoke-zone-1' },
        { id: 'host-3', name: 'Physical Host 3', resources: { pCPU: 8, pCPUUsed: 0, memory: 16, memoryUsed: 0 }, vms: ['node-3'], zone: 'spoke-zone-2' },
        { id: 'host-4', name: 'Physical Host 4', resources: { pCPU: 8, pCPUUsed: 0, memory: 16, memoryUsed: 0 }, vms: ['node-4'], zone: 'spoke-zone-3' }
      ],
      controlPlane: [
        { id: 'cp-etcd-1', name: 'etcd-1', componentType: 'etcd' as const, position: [-8, 3, -8], healthy: true },
        { id: 'cp-api-1', name: 'api-1', componentType: 'apiserver' as const, position: [-3, 3, -8], healthy: true },
        { id: 'cp-sched-1', name: 'sched-1', componentType: 'scheduler' as const, position: [3, 3, -8], healthy: true },
        { id: 'cp-ctrl-1', name: 'ctrl-1', componentType: 'controller-manager' as const, position: [8, 3, -8], healthy: true }
      ],
      enableResourceValidation: true,
      enableStorageValidation: true,
      enableAntiAffinity: true
    }
  },
];

/**
 * Validates if a pod can be scheduled on a node based on resource constraints (vCPU and memory)
 */
const validateResourceConstraints = (
  pod: Pod,
  node: Node,
  enableValidation: boolean
): { valid: boolean; reason?: string } => {
  if (!enableValidation) return { valid: true };

  // Check vCPU availability
  const availableVCPU = node.resources.vCPU - node.resources.vCPUUsed;
  if (pod.resources.vCPURequest > availableVCPU) {
    return {
      valid: false,
      reason: `Insufficient vCPU: needs ${pod.resources.vCPURequest}, available ${availableVCPU.toFixed(1)}`
    };
  }

  // Check memory availability
  const availableMemory = node.resources.memory - node.resources.memoryUsed;
  if (pod.resources.memoryRequest > availableMemory) {
    return {
      valid: false,
      reason: `Insufficient memory: needs ${pod.resources.memoryRequest}GB, available ${availableMemory.toFixed(1)}GB`
    };
  }

  return { valid: true };
};

/**
 * Validates storage requirements - ensures pod storage type matches node capabilities
 */
const validateStorageConstraints = (
  pod: Pod,
  node: Node,
  enableValidation: boolean
): { valid: boolean; reason?: string } => {
  if (!enableValidation || !pod.storage?.required) return { valid: true };

  const requiredType = pod.storage.type;
  if (!requiredType) return { valid: true };

  if (!node.infrastructure.storageTypes.includes(requiredType)) {
    return {
      valid: false,
      reason: `Node does not support ${requiredType} storage. Available: ${node.infrastructure.storageTypes.join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * Validates anti-affinity rules based on physical host collocation
 * Prevents pods with the same antiAffinityKey from running on VMs hosted by the same physical machine
 */
const validateAntiAffinity = (
  pod: Pod,
  node: Node,
  allNodes: Node[],
  allPods: Pod[],
  enableValidation: boolean
): { valid: boolean; reason?: string } => {
  if (!enableValidation || !pod.scheduling?.antiAffinityKey) return { valid: true };

  const physicalHostId = node.infrastructure.physicalHostId;
  if (!physicalHostId) return { valid: true }; // Baremetal nodes have no affinity constraints

  // Find all nodes on the same physical host
  const colocatedNodes = allNodes.filter(n =>
    n.infrastructure.physicalHostId === physicalHostId && n.id !== node.id
  );

  // Check if any pods with the same anti-affinity key are already on this physical host
  const conflictingPods = allPods.filter(p =>
    p.scheduling?.antiAffinityKey === pod.scheduling?.antiAffinityKey &&
    p.id !== pod.id &&
    colocatedNodes.some(n => n.id === p.nodeId)
  );

  if (conflictingPods.length > 0) {
    return {
      valid: false,
      reason: `Anti-affinity violation: ${conflictingPods[0].name} already on physical host ${physicalHostId}`
    };
  }

  return { valid: true };
};

export const useGame = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    currentLevel: 0,
    levels: LEVELS,
    nodes: [],
    pods: [],
    selectedPodId: null,
    hoveredNodeId: null,
    hoveredPodId: null,
    objectives: [],
    logs: [],
    score: 0,
    revealsRemaining: 2,
    solutionRevealed: false,
    completedLevels: new Set<number>(),
    physicalHosts: [],
    controlPlane: [],
    hoveredPhysicalHostId: null,
    hoveredControlPlaneId: null,

    start: () => {
      const state = get();
      state.loadLevel(0);
      set({ phase: "briefing" });
    },

    startLevel: () => {
      set({ phase: "playing" });
    },
    
    restart: () => {
      set({
        phase: "menu",
        currentLevel: 0,
        nodes: [],
        pods: [],
        selectedPodId: null,
        hoveredNodeId: null,
        hoveredPodId: null,
        objectives: [],
        logs: [],
        score: 0,
        revealsRemaining: 2,
      });
    },
    
    nextLevel: () => {
      const state = get();
      const nextLevelIndex = state.currentLevel + 1;
      if (nextLevelIndex < LEVELS.length) {
        state.loadLevel(nextLevelIndex);
        set({ phase: "briefing" });
      } else {
        set({ phase: "gameComplete" });
      }
    },
    
    setPhase: (phase) => set({ phase }),
    
    selectPod: (podId) => set({ selectedPodId: podId }),

    hoverNode: (nodeId) => set({ hoveredNodeId: nodeId }),

    hoverPod: (podId) => set({ hoveredPodId: podId }),

    hoverPhysicalHost: (hostId) => set({ hoveredPhysicalHostId: hostId }),

    hoverControlPlane: (cpId) => set({ hoveredControlPlaneId: cpId }),

    movePodToNode: (podId, nodeId) => {
      const state = get();
      const level = LEVELS[state.currentLevel];
      const pod = state.pods.find(p => p.id === podId);
      const targetNode = state.nodes.find(n => n.id === nodeId);

      if (!pod || !targetNode) return;

      // Check capacity
      if (targetNode.pods.length >= targetNode.capacity) {
        state.addLog(`[ERROR] Node ${targetNode.name} is at capacity!`);
        return;
      }

      // Validate resources (vCPU and memory)
      const resourceCheck = validateResourceConstraints(
        pod,
        targetNode,
        level.infrastructure?.enableResourceValidation || false
      );
      if (!resourceCheck.valid) {
        state.addLog(`[ERROR] ${resourceCheck.reason}`);
        return;
      }

      // Validate storage requirements
      const storageCheck = validateStorageConstraints(
        pod,
        targetNode,
        level.infrastructure?.enableStorageValidation || false
      );
      if (!storageCheck.valid) {
        state.addLog(`[ERROR] ${storageCheck.reason}`);
        return;
      }

      // Validate anti-affinity rules
      const affinityCheck = validateAntiAffinity(
        pod,
        targetNode,
        state.nodes,
        state.pods,
        level.infrastructure?.enableAntiAffinity || false
      );
      if (!affinityCheck.valid) {
        state.addLog(`[ERROR] ${affinityCheck.reason}`);
        return;
      }

      // Update nodes: remove from old node, add to new node, and update resource tracking
      const updatedNodes = state.nodes.map(node => {
        if (node.id === pod.nodeId) {
          // Remove pod from old node and free up resources
          return {
            ...node,
            pods: node.pods.filter(p => p !== podId),
            resources: {
              ...node.resources,
              vCPUUsed: node.resources.vCPUUsed - pod.resources.vCPURequest,
              memoryUsed: node.resources.memoryUsed - pod.resources.memoryRequest
            }
          };
        }
        if (node.id === nodeId) {
          // Add pod to new node and allocate resources
          return {
            ...node,
            pods: [...node.pods, podId],
            resources: {
              ...node.resources,
              vCPUUsed: node.resources.vCPUUsed + pod.resources.vCPURequest,
              memoryUsed: node.resources.memoryUsed + pod.resources.memoryRequest
            }
          };
        }
        return node;
      });
      
      const targetNodeData = updatedNodes.find(n => n.id === nodeId)!;
      const podIndex = targetNodeData.pods.indexOf(podId);
      const podOffset = (podIndex - (targetNodeData.pods.length - 1) / 2) * 1.5;
      
      const updatedPods = state.pods.map(p => {
        if (p.id === podId) {
          return { 
            ...p, 
            nodeId,
            status: "running" as const,
            position: [
              targetNode.position[0] + podOffset,
              1.5,
              targetNode.position[2]
            ] as [number, number, number]
          };
        }
        return p;
      });
      
      set({ 
        nodes: updatedNodes, 
        pods: updatedPods,
        selectedPodId: null,
      });
      
      state.addLog(`[INFO] Pod ${pod.name} scheduled on ${targetNode.name}`);
      
      setTimeout(() => get().checkObjectives(), 100);
    },
    
    addLog: (message) => {
      set(state => ({ 
        logs: [...state.logs.slice(-19), `${new Date().toLocaleTimeString()} ${message}`] 
      }));
    },
    
    checkObjectives: () => {
      const state = get();
      const level = LEVELS[state.currentLevel];
      let allComplete = true;
      
      const updatedObjectives = level.objectives.map((obj, index) => {
        let completed = false;
        
        if (level.id === 1) {
          if (index === 0) {
            const node1 = state.nodes.find(n => n.id === "node-1");
            const frontendPods = state.pods.filter(p => p.name.startsWith("frontend") && p.nodeId === "node-1");
            completed = frontendPods.length >= 2;
          } else if (index === 1) {
            const backendPods = state.pods.filter(p => p.name.startsWith("backend") && p.nodeId === "node-2");
            completed = backendPods.length >= 1;
          }
        } else if (level.id === 2) {
          if (index === 0) {
            completed = state.nodes.every(n => n.pods.length === 2);
          } else if (index === 1) {
            completed = state.nodes.every(node => {
              const nodePods = state.pods.filter(p => p.nodeId === node.id);
              const colors = nodePods.map(p => p.color);
              return new Set(colors).size === colors.length;
            });
          }
        } else if (level.id === 3) {
          if (index === 0) {
            const mlPod = state.pods.find(p => p.name === "ml-train");
            completed = mlPod?.nodeId === "node-3";
          } else if (index === 1) {
            const dataProcs = state.pods.filter(p => p.name.startsWith("data-proc"));
            completed = dataProcs.every(p => p.nodeId === "node-2");
          } else if (index === 2) {
            const memCaches = state.pods.filter(p => p.name.startsWith("mem-cache"));
            completed = memCaches.every(p => p.nodeId === "node-1");
          }
        } else if (level.id === 4) {
          const replicaPairs = [
            ["web-replica-1", "web-replica-2"],
            ["api-replica-1", "api-replica-2"],
            ["cache-replica-1", "cache-replica-2"],
            ["db-replica-1", "db-replica-2"],
          ];
          const allPairsSeparated = replicaPairs.every(pair => {
            const pod1 = state.pods.find(p => p.name === pair[0]);
            const pod2 = state.pods.find(p => p.name === pair[1]);
            return pod1?.nodeId && pod2?.nodeId && pod1.nodeId !== pod2.nodeId;
          });

          if (index === 0) {
            // Each replica pair must be on different nodes
            completed = allPairsSeparated;
          } else if (index === 1) {
            // All nodes must have exactly 2 pods
            completed = state.nodes.every(n => n.pods.length === 2);
          } else if (index === 2) {
            // No single point of failure (same as objective 0 - pairs separated)
            completed = allPairsSeparated;
          }
        } else if (level.id === 5) {
          if (index === 0) {
            const prodPods = state.pods.filter(p => p.name.startsWith("prod-"));
            const prodNodes = ["node-1", "node-2"];
            completed = prodPods.every(p => prodNodes.includes(p.nodeId || ""));
          } else if (index === 1) {
            const devPods = state.pods.filter(p => p.name.startsWith("dev-"));
            const prodNodes = ["node-1", "node-2"];
            completed = devPods.every(p => !prodNodes.includes(p.nodeId || ""));
          } else if (index === 2) {
            completed = state.pods.every(p => p.nodeId !== null);
          }
        } else if (level.id === 6) {
          if (index === 0) {
            const criticalPods = state.pods.filter(p => p.name.startsWith("critical-"));
            completed = criticalPods.every(p => p.nodeId !== null);
          } else if (index === 1) {
            const businessPods = state.pods.filter(p => p.name.startsWith("business-"));
            completed = businessPods.every(p => p.nodeId !== null);
          } else if (index === 2) {
            const batchPods = state.pods.filter(p => p.name.startsWith("batch-"));
            const scheduledBatch = batchPods.filter(p => p.nodeId !== null);
            completed = scheduledBatch.length >= 1;
          }
        } else if (level.id === 7) {
          if (index === 0) {
            // Each StatefulSet must have replicas in different zones
            const statefulSets = [
              ["etcd-0", "etcd-1", "etcd-2"],
              ["zookeeper-0", "zookeeper-1", "zookeeper-2"],
              ["redis-0", "redis-1", "redis-2"],
              ["prometheus-0", "prometheus-1", "prometheus-2"]
            ];

            completed = statefulSets.every(setNames => {
              const pods = setNames.map(name => state.pods.find(p => p.name === name));
              const nodeIds = pods.map(p => p?.nodeId).filter(Boolean);
              // All 3 replicas must be scheduled on different nodes
              return nodeIds.length === 3 && new Set(nodeIds).size === 3;
            });
          } else if (index === 1) {
            // Quorum requirement: At least 2 of 3 replicas in us-east-1 (nodes 1, 2, 3)
            const usEast1Nodes = ["node-1", "node-2", "node-3"];
            const statefulSets = [
              ["etcd-0", "etcd-1", "etcd-2"],
              ["zookeeper-0", "zookeeper-1", "zookeeper-2"],
              ["redis-0", "redis-1", "redis-2"],
              ["prometheus-0", "prometheus-1", "prometheus-2"]
            ];

            completed = statefulSets.every(setNames => {
              const pods = setNames.map(name => state.pods.find(p => p.name === name));
              const inUsEast1 = pods.filter(p => p?.nodeId && usEast1Nodes.includes(p.nodeId)).length;
              return inUsEast1 >= 2;
            });
          } else if (index === 2) {
            // All pods must be scheduled within capacity
            const allScheduled = state.pods.every(p => p.nodeId !== null);
            const withinCapacity = state.nodes.every(n => n.pods.length <= n.capacity);
            completed = allScheduled && withinCapacity;
          }
        } else if (level.id === 8) {
          if (index === 0) {
            const node2Pods = state.pods.filter(p => p.name.startsWith("api-"));
            completed = node2Pods.every(p => p.nodeId && p.nodeId !== "node-2");
          } else if (index === 1) {
            const activeNodes = state.nodes.filter(n => n.id !== "node-2");
            const avgPods = state.pods.filter(p => p.nodeId && p.nodeId !== "node-2").length / activeNodes.length;
            completed = activeNodes.every(n => Math.abs(n.pods.length - avgPods) <= 1);
          } else if (index === 2) {
            completed = state.nodes.filter(n => n.id !== "node-2").every(n => n.pods.length <= n.capacity);
          }
        } else if (level.id === 9) {
          if (index === 0) {
            const storageNodes = ["node-1", "node-2"];
            const statefulPods = state.pods.filter(p => p.name.startsWith("db-") || p.name.startsWith("logs-"));
            completed = statefulPods.every(p => storageNodes.includes(p.nodeId || ""));
          } else if (index === 1) {
            const db0 = state.pods.find(p => p.name === "db-0");
            const db1 = state.pods.find(p => p.name === "db-1");
            const storageNodes = ["node-1", "node-2"];
            completed =
              !!db0?.nodeId &&
              !!db1?.nodeId &&
              storageNodes.includes(db0.nodeId) &&
              storageNodes.includes(db1.nodeId) &&
              db0.nodeId !== db1.nodeId;
          } else if (index === 2) {
            completed = state.pods.every(p => p.nodeId !== null);
          }
        } else if (level.id === 10) {
          const edgeNodes = ["node-1", "node-2"];
          const internalNodes = ["node-3", "node-4"];
          if (index === 0) {
            const ingressPods = state.pods.filter(p => p.name.startsWith("ingress-"));
            completed = ingressPods.every(p => edgeNodes.includes(p.nodeId || ""));
          } else if (index === 1) {
            const backendPods = state.pods.filter(p => p.name.startsWith("backend-"));
            const metricsPods = state.pods.filter(p => p.name.startsWith("metrics-"));
            completed = [...backendPods, ...metricsPods].every(p => internalNodes.includes(p.nodeId || ""));
          } else if (index === 2) {
            const ingressPods = state.pods.filter(p => p.name.startsWith("ingress-"));
            const node1Count = ingressPods.filter(p => p.nodeId === "node-1").length;
            const node2Count = ingressPods.filter(p => p.nodeId === "node-2").length;
            completed = node1Count === 1 && node2Count === 1;
          }
        } else if (level.id === 11) {
          const secureNodes = ["node-1", "node-2"];
          const generalNodes = ["node-3", "node-4"];
          const securityPods = state.pods.filter(p =>
            p.name.startsWith("auth-") || p.name.startsWith("oidc-") || p.name.startsWith("cert-manager-")
          );
          const nonSecurityPods = state.pods.filter(
            p => !p.name.startsWith("auth-") && !p.name.startsWith("oidc-") && !p.name.startsWith("cert-manager-")
          );
          if (index === 0) {
            completed = securityPods.every(p => secureNodes.includes(p.nodeId || ""));
          } else if (index === 1) {
            completed = nonSecurityPods.every(p => generalNodes.includes(p.nodeId || ""));
          } else if (index === 2) {
            completed = state.pods.every(p => p.nodeId !== null);
          }
        } else if (level.id === 12) {
          const controlNodes = ["node-1", "node-2", "node-3"];
          const workerNodes = ["node-4", "node-5", "node-6"];
          const controlPlanePods = state.pods.filter(p =>
            p.name.startsWith("kube-apiserver-") ||
            p.name.startsWith("etcd-") ||
            p.name.startsWith("capi-controller-") ||
            p.name.startsWith("machine-controller-")
          );
          if (index === 0) {
            completed = controlPlanePods.every(p => !p.nodeId || controlNodes.includes(p.nodeId));
          } else if (index === 1) {
            const etcdPods = state.pods.filter(p => p.name.startsWith("etcd-"));
            const etcdNodes = etcdPods.map(p => p.nodeId).filter(Boolean) as string[];
            completed = etcdNodes.length === 3 && new Set(etcdNodes).size === 3 && etcdNodes.every(node => controlNodes.includes(node));
          } else if (index === 2) {
            const workloads = state.pods.filter(p => p.name.startsWith("workload-"));
            completed = workloads.every(p => workerNodes.includes(p.nodeId || ""));
          }
        } else if (level.id === 13) {
          const agentTargets: Record<string, string> = {
            "gitops-agent-hub": "node-1",
            "gitops-agent-spoke1": "node-2",
            "gitops-agent-spoke2": "node-3",
            "gitops-agent-spoke3": "node-4",
          };
          const spokeNodes = ["node-2", "node-3", "node-4"];
          if (index === 0) {
            const agents = state.pods.filter(p => p.name.startsWith("gitops-agent-"));
            completed = agents.every(p => agentTargets[p.name] === p.nodeId);
          } else if (index === 1) {
            const controllers = state.pods.filter(
              p => p.name.startsWith("fleet-controller-") || p.name.startsWith("policy-controller-")
            );
            completed = controllers.every(p => p.nodeId === "node-1");
          } else if (index === 2) {
            const spokePods = state.pods.filter(p => p.name.startsWith("config-sync-") || p.name.startsWith("workload-"));
            completed = spokePods.every(p => spokeNodes.includes(p.nodeId || ""));
          }
        }
        
        if (!completed) allComplete = false;
        return { ...obj, completed };
      });
      
      set({ objectives: updatedObjectives });

      if (allComplete && state.phase === "playing") {
        state.addLog(`[SUCCESS] Level ${level.id} completed!`);
        const newCompletedLevels = new Set(state.completedLevels);
        newCompletedLevels.add(state.currentLevel);
        set({
          phase: "levelComplete",
          score: state.score + 100 * level.id,
          completedLevels: newCompletedLevels,
        });
      }
    },
    
    loadLevel: (levelIndex) => {
      const level = LEVELS[levelIndex];
      set({
        currentLevel: levelIndex,
        nodes: JSON.parse(JSON.stringify(level.nodes)),
        pods: JSON.parse(JSON.stringify(level.pods)),
        objectives: JSON.parse(JSON.stringify(level.objectives)),
        selectedPodId: null,
        hoveredNodeId: null,
        hoveredPodId: null,
        hoveredPhysicalHostId: null,
        hoveredControlPlaneId: null,
        solutionRevealed: false,
        physicalHosts: level.infrastructure?.physicalHosts ? JSON.parse(JSON.stringify(level.infrastructure.physicalHosts)) : [],
        controlPlane: level.infrastructure?.controlPlane ? JSON.parse(JSON.stringify(level.infrastructure.controlPlane)) : [],
        logs: [`[INFO] Loading level: ${level.name}`],
      });
    },

    revealSolution: () => {
      const state = get();

      if (state.revealsRemaining <= 0) {
        state.addLog("[ERROR] No solution reveals remaining!");
        return;
      }

      const level = LEVELS[state.currentLevel];
      const levelId = level.id;

      // Create solution mappings for each level
      let solutionMap: Record<string, string> = {};

      if (levelId === 1) {
        solutionMap = {
          "pod-1": "node-1",
          "pod-2": "node-1",
          "pod-3": "node-2",
        };
      } else if (levelId === 2) {
        solutionMap = {
          "pod-1": "node-1", // api-1
          "pod-4": "node-1", // cache-1
          "pod-2": "node-2", // api-2
          "pod-6": "node-2", // db-1
          "pod-3": "node-3", // api-3
          "pod-5": "node-3", // cache-2
        };
      } else if (levelId === 3) {
        solutionMap = {
          "pod-1": "node-3", // ml-train to gpu
          "pod-2": "node-2", // data-proc-1 to high-cpu
          "pod-3": "node-2", // data-proc-2 to high-cpu
          "pod-4": "node-1", // mem-cache-1 to high-mem
          "pod-5": "node-1", // mem-cache-2 to high-mem
          "pod-6": "node-1", // mem-cache-3 to high-mem
          "pod-7": "node-1", // mem-cache-4 to high-mem
        };
      } else if (levelId === 4) {
        solutionMap = {
          "pod-1": "node-1", // web-replica-1
          "pod-2": "node-2", // web-replica-2
          "pod-3": "node-1", // api-replica-1
          "pod-4": "node-3", // api-replica-2
          "pod-5": "node-2", // cache-replica-1
          "pod-6": "node-4", // cache-replica-2
          "pod-7": "node-3", // db-replica-1
          "pod-8": "node-4", // db-replica-2
        };
      } else if (levelId === 5) {
        solutionMap = {
          "pod-1": "node-1", // prod-web
          "pod-2": "node-1", // prod-api
          "pod-3": "node-1", // prod-db
          "pod-4": "node-2", // staging-web
          "pod-5": "node-2", // staging-api
          "pod-6": "node-2", // staging-db
          "pod-7": "node-3", // dev-web
          "pod-8": "node-3", // dev-api
          "pod-9": "node-3", // dev-db
          "pod-10": "node-3", // dev-test
        };
      } else if (levelId === 6) {
        solutionMap = {
          "pod-1": "node-1", // critical-auth
          "pod-2": "node-1", // critical-billing
          "pod-3": "node-1", // business-checkout
          "pod-4": "node-2", // business-analytics
          "pod-5": "node-2", // business-reports
          "pod-6": "node-2", // batch-cleanup
        };
      } else if (levelId === 7) {
        solutionMap = {
          "pod-1": "node-1",  // etcd-0 -> us-east-1a
          "pod-2": "node-2",  // etcd-1 -> us-east-1b
          "pod-3": "node-3",  // etcd-2 -> us-east-1c (all 3 in us-east-1)
          "pod-4": "node-1",  // zookeeper-0 -> us-east-1a
          "pod-5": "node-2",  // zookeeper-1 -> us-east-1b
          "pod-6": "node-4",  // zookeeper-2 -> us-west-2a (2 in us-east-1, 1 cross-region)
          "pod-7": "node-1",  // redis-0 -> us-east-1a
          "pod-8": "node-3",  // redis-1 -> us-east-1c
          "pod-9": "node-4",  // redis-2 -> us-west-2a (2 in us-east-1, 1 cross-region)
          "pod-10": "node-1", // prometheus-0 -> us-east-1a
          "pod-11": "node-2", // prometheus-1 -> us-east-1b
          "pod-12": "node-3", // prometheus-2 -> us-east-1c (all 3 in us-east-1)
        };
      } else if (levelId === 8) {
        solutionMap = {
          "pod-1": "node-1", // api-1 (from failed node-2)
          "pod-2": "node-3", // api-2 (from failed node-2)
          "pod-3": "node-4", // api-3 (from failed node-2)
          // Leave others where they are
          "pod-4": "node-1", // web-1 (already there)
          "pod-5": "node-1", // web-2 (already there)
          "pod-6": "node-3", // cache-1 (already there)
          "pod-7": "node-3", // cache-2 (already there)
          "pod-8": "node-4", // db-1 (already there)
          "pod-9": "node-4", // db-2 (already there)
        };
      } else if (levelId === 9) {
        solutionMap = {
          "pod-1": "node-1", // db-0
          "pod-2": "node-2", // db-1
          "pod-3": "node-1", // logs-0
          "pod-4": "node-2", // logs-1
          "pod-5": "node-3", // api-0
          "pod-6": "node-3", // api-1
          "pod-7": "node-4", // api-2
        };
      } else if (levelId === 10) {
        solutionMap = {
          "pod-1": "node-1", // ingress-0
          "pod-2": "node-2", // ingress-1
          "pod-3": "node-1", // frontend-0
          "pod-4": "node-2", // frontend-1
          "pod-5": "node-3", // backend-0
          "pod-6": "node-3", // backend-1
          "pod-7": "node-3", // metrics-0
        };
      } else if (levelId === 11) {
        solutionMap = {
          "pod-1": "node-1", // auth-api-0
          "pod-2": "node-2", // auth-api-1
          "pod-3": "node-1", // oidc-0
          "pod-4": "node-1", // cert-manager-0
          "pod-5": "node-3", // frontend-0
          "pod-6": "node-3", // frontend-1
          "pod-7": "node-4", // batch-report-0
        };
      } else if (levelId === 12) {
        solutionMap = {
          "pod-1": "node-1", // kube-apiserver-0
          "pod-2": "node-2", // kube-apiserver-1
          "pod-3": "node-3", // kube-apiserver-2
          "pod-4": "node-1", // etcd-0
          "pod-5": "node-2", // etcd-1
          "pod-6": "node-3", // etcd-2
          "pod-9": "node-4", // workload-0
          "pod-10": "node-5", // workload-1
          "pod-11": "node-6", // workload-2
        };
      } else if (levelId === 13) {
        solutionMap = {
          "pod-1": "node-1", // gitops-agent-hub
          "pod-2": "node-2", // gitops-agent-spoke1
          "pod-3": "node-3", // gitops-agent-spoke2
          "pod-4": "node-4", // gitops-agent-spoke3
          "pod-5": "node-1", // fleet-controller-0
          "pod-6": "node-1", // policy-controller-0
          "pod-7": "node-2", // config-sync-1
          "pod-8": "node-3", // config-sync-2
          "pod-9": "node-4", // config-sync-3
          "pod-10": "node-2", // workload-1
          "pod-11": "node-3", // workload-2
          "pod-12": "node-4", // workload-3
        };
      }

      // Apply the solution
      const updatedNodes = state.nodes.map(node => ({ ...node, pods: [] as string[] }));
      const updatedPods = state.pods.map(pod => {
        const targetNodeId = solutionMap[pod.id];
        if (targetNodeId) {
          const targetNode = updatedNodes.find(n => n.id === targetNodeId);
          if (targetNode) {
            targetNode.pods.push(pod.id);
            const podIndex = targetNode.pods.length - 1;
            const podOffset = (podIndex - (targetNode.pods.length - 1) / 2) * 1.5;
            const nodePosition = level.nodes.find(n => n.id === targetNodeId)?.position || [0, 0, 0];

            return {
              ...pod,
              nodeId: targetNodeId,
              status: "running" as const,
              position: [
                nodePosition[0] + podOffset,
                1.5,
                nodePosition[2]
              ] as [number, number, number]
            };
          }
        }
        return pod;
      });

      set({
        nodes: updatedNodes,
        pods: updatedPods,
        selectedPodId: null,
        revealsRemaining: state.revealsRemaining - 1,
        solutionRevealed: true,
      });

      state.addLog(`[INFO] Solution revealed! Study the layout. (${state.revealsRemaining - 1} reveals remaining)`);
    },

    jumpToLevel: (levelIndex) => {
      const state = get();

      // Allow jumping to any level
      if (levelIndex < 0 || levelIndex >= LEVELS.length) {
        state.addLog(`[ERROR] Invalid level index!`);
        return;
      }

      state.loadLevel(levelIndex);
      set({ phase: "briefing" });
      state.addLog(`[INFO] Jumped to Level ${levelIndex + 1}`);
    },
  }))
);
