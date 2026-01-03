import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "playing" | "levelComplete" | "gameComplete";

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
}

interface GameState {
  phase: GamePhase;
  currentLevel: number;
  levels: Level[];
  nodes: Node[];
  pods: Pod[];
  selectedPodId: string | null;
  hoveredNodeId: string | null;
  objectives: LevelObjective[];
  logs: string[];
  score: number;
  
  start: () => void;
  restart: () => void;
  nextLevel: () => void;
  setPhase: (phase: GamePhase) => void;
  selectPod: (podId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  movePodToNode: (podId: string, nodeId: string) => void;
  addLog: (message: string) => void;
  checkObjectives: () => void;
  loadLevel: (levelIndex: number) => void;
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
    objectives: [],
    logs: [],
    score: 0,
    
    start: () => {
      const state = get();
      state.loadLevel(0);
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
        objectives: [],
        logs: [],
        score: 0,
      });
    },
    
    nextLevel: () => {
      const state = get();
      const nextLevelIndex = state.currentLevel + 1;
      if (nextLevelIndex < LEVELS.length) {
        state.loadLevel(nextLevelIndex);
        set({ phase: "playing" });
      } else {
        set({ phase: "gameComplete" });
      }
    },
    
    setPhase: (phase) => set({ phase }),
    
    selectPod: (podId) => set({ selectedPodId: podId }),
    
    hoverNode: (nodeId) => set({ hoveredNodeId: nodeId }),
    
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
        }
        
        if (!completed) allComplete = false;
        return { ...obj, completed };
      });
      
      set({ objectives: updatedObjectives });
      
      if (allComplete && state.phase === "playing") {
        state.addLog(`[SUCCESS] Level ${level.id} completed!`);
        set({ 
          phase: "levelComplete",
          score: state.score + 100 * level.id,
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
        logs: [`[INFO] Loading level: ${level.name}`],
      });
    },
  }))
);
