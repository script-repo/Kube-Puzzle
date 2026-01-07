import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "briefing" | "playing" | "levelComplete" | "gameComplete";

export interface Pod {
  id: string;
  name: string;
  color: string;
  nodeId: string | null;
  status: "pending" | "running" | "terminating";
  position: [number, number, number];
}

export interface Node {
  id: string;
  name: string;
  capacity: number;
  position: [number, number, number];
  pods: string[];
}

export interface LevelObjective {
  description: string;
  completed: boolean;
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

  start: () => void;
  startLevel: () => void;
  restart: () => void;
  nextLevel: () => void;
  setPhase: (phase: GamePhase) => void;
  selectPod: (podId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  hoverPod: (podId: string | null) => void;
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
      { id: "node-1", name: "worker-1", capacity: 3, position: [-6, 0, 0], pods: [] },
      { id: "node-2", name: "worker-2", capacity: 3, position: [0, 0, 0], pods: [] },
      { id: "node-3", name: "worker-3", capacity: 3, position: [6, 0, 0], pods: [] },
    ],
    pods: [
      { id: "pod-1", name: "frontend-a", color: "#3b82f6", nodeId: null, status: "pending", position: [-4, 5, 8] },
      { id: "pod-2", name: "frontend-b", color: "#3b82f6", nodeId: null, status: "pending", position: [0, 5, 8] },
      { id: "pod-3", name: "backend-a", color: "#10b981", nodeId: null, status: "pending", position: [4, 5, 8] },
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
  },
  {
    id: 2,
    name: "Load Balancing",
    description: "Distribute pods evenly across all available nodes.",
    nodes: [
      { id: "node-1", name: "worker-1", capacity: 2, position: [-6, 0, 0], pods: [] },
      { id: "node-2", name: "worker-2", capacity: 2, position: [0, 0, 0], pods: [] },
      { id: "node-3", name: "worker-3", capacity: 2, position: [6, 0, 0], pods: [] },
    ],
    pods: [
      { id: "pod-1", name: "api-1", color: "#f59e0b", nodeId: null, status: "pending", position: [-6, 5, 8] },
      { id: "pod-2", name: "api-2", color: "#f59e0b", nodeId: null, status: "pending", position: [-2, 5, 8] },
      { id: "pod-3", name: "api-3", color: "#f59e0b", nodeId: null, status: "pending", position: [2, 5, 8] },
      { id: "pod-4", name: "cache-1", color: "#8b5cf6", nodeId: null, status: "pending", position: [6, 5, 8] },
      { id: "pod-5", name: "cache-2", color: "#8b5cf6", nodeId: null, status: "pending", position: [-4, 5, 12] },
      { id: "pod-6", name: "db-1", color: "#ef4444", nodeId: null, status: "pending", position: [4, 5, 12] },
    ],
    objectives: [
      { description: "Each node must have exactly 2 pods", completed: false },
      { description: "No two pods of the same type on one node", completed: false },
    ],
    targetConfiguration: {},
    hint: "Distribute pods evenly - each node needs exactly 2 pods. Make sure no node has two pods of the same color!",
    analysis: "Multiple valid solutions exist for this level. The optimal approach is even distribution (2 pods per node) while avoiding pod type collocation. This prevents single points of failure - if one node fails, you still have instances of each service type running on other nodes. Any configuration that spreads different service types across all nodes is equally valid. The key principle: maximize availability through distribution and diversity.",
  },
  {
    id: 3,
    name: "Resource Constraints",
    description: "Schedule pods while respecting node capacity limits.",
    nodes: [
      { id: "node-1", name: "high-mem", capacity: 4, position: [-6, 0, 0], pods: [] },
      { id: "node-2", name: "high-cpu", capacity: 2, position: [0, 0, 0], pods: [] },
      { id: "node-3", name: "gpu-node", capacity: 1, position: [6, 0, 0], pods: [] },
    ],
    pods: [
      { id: "pod-1", name: "ml-train", color: "#ec4899", nodeId: null, status: "pending", position: [-6, 5, 8] },
      { id: "pod-2", name: "data-proc-1", color: "#06b6d4", nodeId: null, status: "pending", position: [-2, 5, 8] },
      { id: "pod-3", name: "data-proc-2", color: "#06b6d4", nodeId: null, status: "pending", position: [2, 5, 8] },
      { id: "pod-4", name: "mem-cache-1", color: "#84cc16", nodeId: null, status: "pending", position: [6, 5, 8] },
      { id: "pod-5", name: "mem-cache-2", color: "#84cc16", nodeId: null, status: "pending", position: [-4, 5, 12] },
      { id: "pod-6", name: "mem-cache-3", color: "#84cc16", nodeId: null, status: "pending", position: [0, 5, 12] },
      { id: "pod-7", name: "mem-cache-4", color: "#84cc16", nodeId: null, status: "pending", position: [4, 5, 12] },
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
  },
  {
    id: 4,
    name: "High Availability Deployment",
    description: "Ensure redundancy across nodes - no single point of failure.",
    nodes: [
      { id: "node-1", name: "worker-1", capacity: 2, position: [-8, 0, 0], pods: [] },
      { id: "node-2", name: "worker-2", capacity: 2, position: [-3, 0, 0], pods: [] },
      { id: "node-3", name: "worker-3", capacity: 2, position: [3, 0, 0], pods: [] },
      { id: "node-4", name: "worker-4", capacity: 2, position: [8, 0, 0], pods: [] },
    ],
    pods: [
      { id: "pod-1", name: "web-replica-1", color: "#3b82f6", nodeId: null, status: "pending", position: [-8, 5, 8] },
      { id: "pod-2", name: "web-replica-2", color: "#3b82f6", nodeId: null, status: "pending", position: [-6, 5, 8] },
      { id: "pod-3", name: "api-replica-1", color: "#10b981", nodeId: null, status: "pending", position: [-4, 5, 8] },
      { id: "pod-4", name: "api-replica-2", color: "#10b981", nodeId: null, status: "pending", position: [-2, 5, 8] },
      { id: "pod-5", name: "cache-replica-1", color: "#8b5cf6", nodeId: null, status: "pending", position: [2, 5, 8] },
      { id: "pod-6", name: "cache-replica-2", color: "#8b5cf6", nodeId: null, status: "pending", position: [4, 5, 8] },
      { id: "pod-7", name: "db-replica-1", color: "#ef4444", nodeId: null, status: "pending", position: [6, 5, 8] },
      { id: "pod-8", name: "db-replica-2", color: "#ef4444", nodeId: null, status: "pending", position: [8, 5, 8] },
    ],
    objectives: [
      { description: "Each replica pair must be on different nodes", completed: false },
      { description: "All nodes must have exactly 2 pods", completed: false },
      { description: "No single point of failure for any service", completed: false },
    ],
    targetConfiguration: {},
    hint: "Separate replica pairs! Each matching color pair (web-1/web-2, api-1/api-2, etc.) must be on different nodes for high availability.",
    analysis: "Multiple valid solutions exist. The best practice is anti-affinity scheduling - ensuring replica pairs never share a node. If worker-1 fails, you still have web-replica-2 on another node. Any distribution that keeps pairs separated AND balances 2 pods per node is optimal. This mimics Kubernetes PodAntiAffinity rules. The key principle: eliminate single points of failure by distributing replicas across failure domains (nodes).",
  },
  {
    id: 5,
    name: "Namespace Isolation",
    description: "Separate production, staging, and development workloads.",
    nodes: [
      { id: "node-1", name: "prod-1", capacity: 3, position: [-6, 0, 0], pods: [] },
      { id: "node-2", name: "prod-2", capacity: 3, position: [0, 0, 0], pods: [] },
      { id: "node-3", name: "dev-1", capacity: 4, position: [6, 0, 0], pods: [] },
    ],
    pods: [
      { id: "pod-1", name: "prod-web", color: "#fbbf24", nodeId: null, status: "pending", position: [-6, 5, 8] },
      { id: "pod-2", name: "prod-api", color: "#fbbf24", nodeId: null, status: "pending", position: [-4, 5, 8] },
      { id: "pod-3", name: "prod-db", color: "#fbbf24", nodeId: null, status: "pending", position: [-2, 5, 8] },
      { id: "pod-4", name: "staging-web", color: "#fb923c", nodeId: null, status: "pending", position: [0, 5, 8] },
      { id: "pod-5", name: "staging-api", color: "#fb923c", nodeId: null, status: "pending", position: [2, 5, 8] },
      { id: "pod-6", name: "staging-db", color: "#fb923c", nodeId: null, status: "pending", position: [4, 5, 8] },
      { id: "pod-7", name: "dev-web", color: "#06b6d4", nodeId: null, status: "pending", position: [-4, 5, 12] },
      { id: "pod-8", name: "dev-api", color: "#06b6d4", nodeId: null, status: "pending", position: [-2, 5, 12] },
      { id: "pod-9", name: "dev-db", color: "#06b6d4", nodeId: null, status: "pending", position: [2, 5, 12] },
      { id: "pod-10", name: "dev-test", color: "#06b6d4", nodeId: null, status: "pending", position: [4, 5, 12] },
    ],
    objectives: [
      { description: "Production pods ONLY on prod nodes", completed: false },
      { description: "No dev pods on production nodes", completed: false },
      { description: "All pods must be scheduled", completed: false },
    ],
    targetConfiguration: {},
    hint: "Keep environments separate! Gold pods only on prod nodes, cyan pods on dev node, orange staging pods can go on either prod-2 or dev-1.",
    analysis: "Multiple valid solutions exist, but the BEST solution isolates production workloads completely. Production pods (gold) go on prod-1, staging pods (orange) on prod-2, and development/test workloads (cyan) on dev-1. Alternative: putting staging on dev-1 is also valid but less ideal. The optimal approach maintains strict namespace isolation - production never shares resources with lower environments, preventing dev workloads from impacting production stability or security.",
  },
  {
    id: 6,
    name: "Priority & Preemption",
    description: "Schedule critical workloads first, optimize resource usage.",
    nodes: [
      { id: "node-1", name: "worker-1", capacity: 3, position: [-6, 0, 0], pods: [] },
      { id: "node-2", name: "worker-2", capacity: 3, position: [6, 0, 0], pods: [] },
    ],
    pods: [
      { id: "pod-1", name: "critical-auth", color: "#ef4444", nodeId: null, status: "pending", position: [-6, 5, 8] },
      { id: "pod-2", name: "critical-billing", color: "#ef4444", nodeId: null, status: "pending", position: [-4, 5, 8] },
      { id: "pod-3", name: "business-checkout", color: "#f59e0b", nodeId: null, status: "pending", position: [-2, 5, 8] },
      { id: "pod-4", name: "business-analytics", color: "#f59e0b", nodeId: null, status: "pending", position: [2, 5, 8] },
      { id: "pod-5", name: "business-reports", color: "#f59e0b", nodeId: null, status: "pending", position: [4, 5, 8] },
      { id: "pod-6", name: "batch-cleanup", color: "#6b7280", nodeId: null, status: "pending", position: [-4, 5, 12] },
      { id: "pod-7", name: "batch-export", color: "#6b7280", nodeId: null, status: "pending", position: [-2, 5, 12] },
      { id: "pod-8", name: "batch-archive", color: "#6b7280", nodeId: null, status: "pending", position: [2, 5, 12] },
      { id: "pod-9", name: "batch-backup", color: "#6b7280", nodeId: null, status: "pending", position: [4, 5, 12] },
    ],
    objectives: [
      { description: "All critical pods must be scheduled", completed: false },
      { description: "All business pods must be scheduled", completed: false },
      { description: "Schedule as many batch jobs as possible", completed: false },
    ],
    targetConfiguration: {},
    hint: "Priority matters! Schedule red (critical) and orange (business) pods first. Gray batch jobs are lowest priority - fit them in remaining space.",
    analysis: "This demonstrates Kubernetes priority classes and resource optimization. The BEST solution schedules all critical (red) and business (orange) pods first, using 6 of 6 available slots. This leaves NO room for batch jobs - and that's correct! In real clusters, low-priority batch jobs are preemptible and yield resources to higher-priority workloads. Critical services (auth, billing) must never be starved. This is the optimal solution: prioritize business continuity over best-effort batch processing.",
  },
  {
    id: 7,
    name: "Stateful Services & Quorum",
    description: "Deploy distributed stateful workloads with quorum requirements.",
    nodes: [
      { id: "node-1", name: "zone-us-east-1a", capacity: 4, position: [-9, 0, 0], pods: [] },
      { id: "node-2", name: "zone-us-east-1b", capacity: 3, position: [-3, 0, 0], pods: [] },
      { id: "node-3", name: "zone-us-east-1c", capacity: 3, position: [3, 0, 0], pods: [] },
      { id: "node-4", name: "zone-us-west-2a", capacity: 2, position: [9, 0, 0], pods: [] },
    ],
    pods: [
      { id: "pod-1", name: "etcd-0", color: "#10b981", nodeId: null, status: "pending", position: [-8, 5, 8] },
      { id: "pod-2", name: "etcd-1", color: "#10b981", nodeId: null, status: "pending", position: [-6, 5, 8] },
      { id: "pod-3", name: "etcd-2", color: "#10b981", nodeId: null, status: "pending", position: [-4, 5, 8] },
      { id: "pod-4", name: "zookeeper-0", color: "#8b5cf6", nodeId: null, status: "pending", position: [-2, 5, 8] },
      { id: "pod-5", name: "zookeeper-1", color: "#8b5cf6", nodeId: null, status: "pending", position: [0, 5, 8] },
      { id: "pod-6", name: "zookeeper-2", color: "#8b5cf6", nodeId: null, status: "pending", position: [2, 5, 8] },
      { id: "pod-7", name: "redis-0", color: "#ef4444", nodeId: null, status: "pending", position: [4, 5, 8] },
      { id: "pod-8", name: "redis-1", color: "#ef4444", nodeId: null, status: "pending", position: [6, 5, 8] },
      { id: "pod-9", name: "redis-2", color: "#ef4444", nodeId: null, status: "pending", position: [8, 5, 8] },
      { id: "pod-10", name: "prometheus-0", color: "#f59e0b", nodeId: null, status: "pending", position: [-6, 5, 12] },
      { id: "pod-11", name: "prometheus-1", color: "#f59e0b", nodeId: null, status: "pending", position: [-2, 5, 12] },
      { id: "pod-12", name: "prometheus-2", color: "#f59e0b", nodeId: null, status: "pending", position: [2, 5, 12] },
    ],
    objectives: [
      { description: "Each stateful set must have replicas in different zones", completed: false },
      { description: "Quorum requirement: At least 2 of 3 replicas in us-east-1", completed: false },
      { description: "All pods must be scheduled within capacity", completed: false },
    ],
    targetConfiguration: {},
    hint: "Quorum-based systems need majority in the primary region (us-east-1). Spread each StatefulSet (etcd, zookeeper, redis, prometheus) across zones, but keep 2/3 replicas in us-east-1 for low-latency consensus.",
    analysis: "This demonstrates advanced stateful scheduling with quorum awareness. The BEST solution places 2 replicas of each StatefulSet in us-east-1 (zones a/b/c) and 1 in us-west-2a. This ensures: (1) Cross-zone redundancy - no single zone failure loses data, (2) Regional quorum - consensus protocols (etcd, zookeeper) maintain majority in us-east-1 for low latency, (3) Disaster recovery - us-west-2a replica survives regional failures. Capacity-aware scheduling is critical: zone-1a has 4 slots for flexibility. This mirrors real production StatefulSet topologySpreadConstraints with zone anti-affinity and regional quorum.",
  },
  {
    id: 8,
    name: "Chaos Engineering",
    description: "Handle node failure and reschedule pods quickly.",
    nodes: [
      { id: "node-1", name: "worker-1", capacity: 3, position: [-8, 0, 0], pods: [] },
      { id: "node-2", name: "worker-2", capacity: 3, position: [-3, 0, 0], pods: [] },
      { id: "node-3", name: "worker-3", capacity: 3, position: [3, 0, 0], pods: [] },
      { id: "node-4", name: "worker-4", capacity: 3, position: [8, 0, 0], pods: [] },
    ],
    pods: [
      { id: "pod-1", name: "api-1", color: "#3b82f6", nodeId: "node-2", status: "running", position: [-4, 1.5, 0] },
      { id: "pod-2", name: "api-2", color: "#3b82f6", nodeId: "node-2", status: "running", position: [-3, 1.5, 0] },
      { id: "pod-3", name: "api-3", color: "#3b82f6", nodeId: "node-2", status: "running", position: [-2, 1.5, 0] },
      { id: "pod-4", name: "web-1", color: "#10b981", nodeId: "node-1", status: "running", position: [-9, 1.5, 0] },
      { id: "pod-5", name: "web-2", color: "#10b981", nodeId: "node-1", status: "running", position: [-8, 1.5, 0] },
      { id: "pod-6", name: "cache-1", color: "#8b5cf6", nodeId: "node-3", status: "running", position: [2, 1.5, 0] },
      { id: "pod-7", name: "cache-2", color: "#8b5cf6", nodeId: "node-3", status: "running", position: [4, 1.5, 0] },
      { id: "pod-8", name: "db-1", color: "#ef4444", nodeId: "node-4", status: "running", position: [7, 1.5, 0] },
      { id: "pod-9", name: "db-2", color: "#ef4444", nodeId: "node-4", status: "running", position: [9, 1.5, 0] },
    ],
    objectives: [
      { description: "Reschedule all pods from failed node", completed: false },
      { description: "Maintain balanced pod distribution", completed: false },
      { description: "No node over capacity", completed: false },
    ],
    targetConfiguration: {},
    hint: "Worker-2 has failed! Quickly move the 3 blue API pods to the remaining healthy nodes. Balance the load - don't overload any single node!",
    analysis: "The BEST solution distributes the 3 failed API pods evenly: one to worker-1, one to worker-3, one to worker-4. This maintains balanced load (3-3-3 distribution). Alternative solutions exist but are suboptimal - putting 2 API pods on one node creates uneven load. This scenario demonstrates Kubernetes' self-healing: when a node fails, pods are rescheduled across healthy nodes. The optimal strategy: balance load evenly while respecting capacity constraints. Fast, balanced recovery minimizes service disruption.",
  },
];

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
    
    movePodToNode: (podId, nodeId) => {
      const state = get();
      const pod = state.pods.find(p => p.id === podId);
      const targetNode = state.nodes.find(n => n.id === nodeId);
      
      if (!pod || !targetNode) return;
      
      if (targetNode.pods.length >= targetNode.capacity) {
        state.addLog(`[ERROR] Node ${targetNode.name} is at capacity!`);
        return;
      }
      
      const updatedNodes = state.nodes.map(node => {
        if (node.id === pod.nodeId) {
          return { ...node, pods: node.pods.filter(p => p !== podId) };
        }
        if (node.id === nodeId) {
          return { ...node, pods: [...node.pods, podId] };
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
        solutionRevealed: false,
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
      }

      // Apply the solution
      const updatedNodes = state.nodes.map(node => ({ ...node, pods: [] }));
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
