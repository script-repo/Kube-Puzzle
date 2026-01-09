import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Circle,
  Server,
  Box,
  Cpu,
  ArrowRight,
  Trophy,
  Zap,
  Shield,
  BookOpen,
  Lightbulb
} from "lucide-react";
import { useState } from "react";

function MainMenu() {
  const { start, levels, completedLevels, jumpToLevel } = useGame();
  const { isMuted, toggleMute } = useAudio();
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  if (showLevelSelect) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900/90 to-indigo-900/90 backdrop-blur-md p-8">
        <Card className="p-8 bg-slate-900/95 border-indigo-500/40 max-w-4xl w-full shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">Select Level</h2>
            <Button
              onClick={() => setShowLevelSelect(false)}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Back
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {levels.map((level, index) => {
              const isCompleted = completedLevels.has(index);

              return (
                <button
                  key={level.id}
                  onClick={() => {
                    jumpToLevel(index);
                    setShowLevelSelect(false);
                  }}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-green-500/10 border-green-500/40 hover:bg-green-500/20 hover:border-green-500/60'
                      : 'bg-indigo-500/10 border-indigo-500/40 hover:bg-indigo-500/20 hover:border-indigo-500/60'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {isCompleted ? (
                        <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" />
                      ) : (
                        <Play className="w-8 h-8 text-indigo-400 mx-auto" />
                      )}
                    </div>
                    <p className="text-lg font-semibold text-white mb-1">Level {level.id}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{level.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900/90 to-indigo-900/90 backdrop-blur-md">
      <div className="max-w-2xl w-full px-8">
        <Card className="p-10 bg-slate-900/95 border-indigo-500/40 text-center shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <Cpu className="w-16 h-16 text-indigo-400 animate-pulse" />
                <div className="absolute -inset-1 bg-indigo-500/20 blur-xl rounded-full"></div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Cluster Conductor
              </h1>
            </div>
            <p className="text-slate-300 text-xl mb-2">
              Master the Art of Kubernetes Orchestration
            </p>
            <p className="text-slate-500 text-sm">
              Learn real container scheduling through interactive 3D gameplay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <Box className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 mb-1">{levels.length} Levels</h3>
              <p className="text-xs text-slate-400">Progressive difficulty</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 mb-1">Achievements</h3>
              <p className="text-xs text-slate-400">Track your progress</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
              <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 mb-1">Learn K8s</h3>
              <p className="text-xs text-slate-400">Real concepts</p>
            </div>
          </div>

          <div className="space-y-3 mb-8 text-left bg-slate-800/30 rounded-lg p-5 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              How to Play
            </h3>
            <div className="flex items-start gap-3 text-sm">
              <div className="bg-indigo-500/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-300 font-bold text-xs">1</span>
              </div>
              <div>
                <span className="text-slate-200 font-medium">Click floating pods</span>
                <span className="text-slate-400"> to select them</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="bg-indigo-500/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-300 font-bold text-xs">2</span>
              </div>
              <div>
                <span className="text-slate-200 font-medium">Click nodes</span>
                <span className="text-slate-400"> to schedule selected pods</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="bg-indigo-500/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-300 font-bold text-xs">3</span>
              </div>
              <div>
                <span className="text-slate-200 font-medium">Complete objectives</span>
                <span className="text-slate-400"> to finish each level</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-4 justify-center">
              <Button
                onClick={start}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-10 shadow-lg shadow-indigo-500/30"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Adventure
              </Button>
              <Button
                onClick={toggleMute}
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>

            <Button
              onClick={() => setShowLevelSelect(true)}
              variant="outline"
              size="lg"
              className="border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/60"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Select Level {completedLevels.size > 0 && `(${completedLevels.size}/${levels.length} completed)`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LevelBriefing() {
  const { currentLevel, levels, startLevel, restart } = useGame();
  const level = levels[currentLevel];

  const getLevelConcept = (levelId: number): string => {
    const concepts: Record<number, string> = {
      1: "Pod Scheduling - Basic deployment to specific nodes",
      2: "Load Balancing - Even distribution and workload spreading",
      3: "Resource Constraints - Respecting capacity limits and node types",
      4: "Pod Anti-Affinity - High availability through replica separation",
      5: "Node Selectors - Environment isolation and namespace separation",
      6: "Pod Priority - Critical workloads and resource preemption",
      7: "StatefulSets - Ordered deployment with storage topology",
      8: "Self-Healing - Handling node failures and pod rescheduling",
      9: "CSI Storage - PV binding & topology awareness",
      10: "CNI Segmentation - edge vs internal traffic",
      11: "Auth & RBAC - identity plane isolation",
      12: "Cluster API - control-plane separation & quorum",
      13: "Fleet GitOps - hub/spoke management"
    };
    return concepts[levelId] || "Kubernetes Orchestration";
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900/90 to-indigo-900/90 backdrop-blur-md">
      <Card className="p-8 bg-slate-900/95 border-indigo-500/40 max-w-2xl shadow-2xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">Mission Briefing</h2>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="inline-block bg-indigo-500/20 px-3 py-1 rounded-full text-indigo-300 text-sm font-medium mb-2">
              Level {level?.id} of {levels.length}
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{level?.name}</h3>
            <p className="text-slate-400 text-lg">{level?.description}</p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              Resources Available
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Nodes:</span>
                <span className="text-white font-semibold ml-2">{level?.nodes.length}</span>
              </div>
              <div>
                <span className="text-slate-400">Pods:</span>
                <span className="text-white font-semibold ml-2">{level?.pods.length}</span>
              </div>
              <div>
                <span className="text-slate-400">Total Capacity:</span>
                <span className="text-white font-semibold ml-2">
                  {level?.nodes.reduce((sum, n) => sum + n.capacity, 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Objectives:</span>
                <span className="text-white font-semibold ml-2">{level?.objectives.length}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Mission Objectives
            </h4>
            <ul className="space-y-2">
              {level?.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Circle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">{obj.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
            <h4 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Kubernetes Concept
            </h4>
            <p className="text-sm text-slate-300">{getLevelConcept(level?.id || 1)}</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <Button
            onClick={startLevel}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-8 shadow-lg shadow-green-500/30"
          >
            <Play className="w-5 h-5 mr-2" />
            Begin Mission
          </Button>
          <Button
            onClick={restart}
            variant="outline"
            size="lg"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Back to Menu
          </Button>
        </div>
      </Card>
    </div>
  );
}

function GameHUD() {
  const {
    currentLevel,
    levels,
    nodes,
    pods,
    objectives,
    logs,
    score,
    selectedPodId,
    hoveredNodeId,
    hoveredPodId,
    revealsRemaining,
    solutionRevealed,
    controlPlane,
    hoveredControlPlaneId,
    loadLevel,
    restart,
    revealSolution
  } = useGame();
  const { isMuted, toggleMute } = useAudio();
  const [showHint, setShowHint] = useState(false);

  const level = levels[currentLevel];
  const scheduledPods = pods.filter(p => p.nodeId !== null).length;
  const progress = (scheduledPods / pods.length) * 100;
  const completedObjectives = objectives.filter(o => o.completed).length;

  // Get hovered node/pod info
  const hoveredNode = hoveredNodeId ? nodes.find(n => n.id === hoveredNodeId) : null;
  const hoveredPod = hoveredPodId ? pods.find(p => p.id === hoveredPodId) : null;

  // Helper function to get node type
  const getNodeType = (nodeName: string) => {
    const name = nodeName.toLowerCase();
    if (name.includes('worker')) return 'Worker Node';
    if (name.includes('prod')) return 'Production';
    if (name.includes('dev')) return 'Development';
    if (name.includes('high-mem')) return 'High Memory';
    if (name.includes('high-cpu')) return 'High CPU';
    if (name.includes('gpu')) return 'GPU Node';
    if (name.includes('storage')) {
      if (name.includes('zone-a')) return 'Storage Zone A';
      if (name.includes('zone-b')) return 'Storage Zone B';
      if (name.includes('zone-c')) return 'Storage Zone C';
    }
    return 'Compute Node';
  };

  return (
    <>
      {/* Solution Revealed Banner */}
      {solutionRevealed && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="p-4 px-8 bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-yellow-500/60 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-center gap-3">
              <Lightbulb className="w-7 h-7 text-yellow-400 animate-pulse" />
              <div className="text-center">
                <h3 className="text-2xl font-bold text-yellow-200">Solution Revealed</h3>
                <p className="text-sm text-yellow-300/80 mt-1">Study the pod placement to learn the optimal configuration</p>
              </div>
              <Lightbulb className="w-7 h-7 text-yellow-400 animate-pulse" />
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced Hover Info Display */}
      {!solutionRevealed && (hoveredNode || hoveredPod || hoveredControlPlaneId) && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="p-4 px-6 bg-slate-900/98 border-indigo-500/50 shadow-2xl max-w-md">
            {/* Control Plane Node Info */}
            {hoveredControlPlaneId && (() => {
              const cpNode = controlPlane.find(cp => cp.id === hoveredControlPlaneId);
              if (!cpNode) return null;

              return (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Cpu className="w-6 h-6 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white">{cpNode.name}</h3>
                  </div>
                  <p className="text-lg text-purple-300 mb-2">Control Plane: {cpNode.componentType}</p>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="text-slate-400">
                      Status: <span className={`font-semibold ${
                        cpNode.healthy ? 'text-green-400' : 'text-red-400'
                      }`}>{cpNode.healthy ? 'Healthy' : 'Unhealthy'}</span>
                    </span>
                  </div>
                  {cpNode.componentType === 'etcd' && (
                    <p className="text-xs text-slate-500 mt-2">
                      Stores cluster state and configuration
                    </p>
                  )}
                  {cpNode.componentType === 'apiserver' && (
                    <p className="text-xs text-slate-500 mt-2">
                      API endpoint for all cluster operations
                    </p>
                  )}
                  {cpNode.componentType === 'scheduler' && (
                    <p className="text-xs text-slate-500 mt-2">
                      Assigns pods to nodes based on resources
                    </p>
                  )}
                  {cpNode.componentType === 'controller-manager' && (
                    <p className="text-xs text-slate-500 mt-2">
                      Manages cluster controllers
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Worker Node Info (Enhanced) */}
            {hoveredNode && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Server className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-2xl font-bold text-white">{hoveredNode.name}</h3>
                </div>
                <p className="text-lg text-indigo-300 mb-3">{getNodeType(hoveredNode.name)}</p>

                {/* Resource Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  {/* Pod Capacity */}
                  <div className="bg-slate-800/50 p-2 rounded">
                    <div className="text-slate-400 text-xs mb-1">Pod Capacity</div>
                    <div className={`font-semibold ${
                      hoveredNode.pods.length >= hoveredNode.capacity ? 'text-red-400' :
                      hoveredNode.pods.length > 0 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {hoveredNode.pods.length}/{hoveredNode.capacity}
                    </div>
                  </div>

                  {/* vCPU */}
                  <div className="bg-slate-800/50 p-2 rounded">
                    <div className="text-slate-400 text-xs mb-1">vCPU</div>
                    <div className="text-blue-400 font-semibold">
                      {hoveredNode.resources.vCPUUsed}/{hoveredNode.resources.vCPU} cores
                    </div>
                  </div>

                  {/* Memory */}
                  <div className="bg-slate-800/50 p-2 rounded">
                    <div className="text-slate-400 text-xs mb-1">Memory</div>
                    <div className="text-green-400 font-semibold">
                      {hoveredNode.resources.memoryUsed}/{hoveredNode.resources.memory} GB
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="bg-slate-800/50 p-2 rounded">
                    <div className="text-slate-400 text-xs mb-1">Storage</div>
                    <div className="text-purple-400 font-semibold text-xs">
                      {hoveredNode.infrastructure.storageTypes.join(', ') || 'none'}
                    </div>
                  </div>
                </div>

                {/* Infrastructure Details */}
                <div className="text-xs text-slate-400 space-y-1 border-t border-slate-700 pt-2">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="text-slate-300">{hoveredNode.infrastructure.hypervisor || 'baremetal'}</span>
                  </div>
                  {hoveredNode.infrastructure.physicalHostId && (
                    <div className="flex justify-between">
                      <span>Physical Host:</span>
                      <span className="text-purple-300">{hoveredNode.infrastructure.physicalHostId}</span>
                    </div>
                  )}
                  {hoveredNode.infrastructure.zone && (
                    <div className="flex justify-between">
                      <span>Zone:</span>
                      <span className="text-blue-300">{hoveredNode.infrastructure.zone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pod Info (Enhanced) */}
            {hoveredPod && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Box className="w-6 h-6" style={{ color: hoveredPod.color }} />
                  <h3 className="text-2xl font-bold text-white">{hoveredPod.name}</h3>
                </div>

                {/* Resource Requests */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="bg-slate-800/50 p-2 rounded">
                    <div className="text-slate-400 text-xs mb-1">vCPU Request</div>
                    <div className="text-blue-400 font-semibold">
                      {hoveredPod.resources.vCPURequest} cores
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded">
                    <div className="text-slate-400 text-xs mb-1">Memory Request</div>
                    <div className="text-green-400 font-semibold">
                      {hoveredPod.resources.memoryRequest} GB
                    </div>
                  </div>
                </div>

                {/* Storage Requirements */}
                {hoveredPod.storage?.required && (
                  <div className="bg-purple-500/10 border border-purple-500/30 p-2 rounded mb-3">
                    <div className="text-xs text-purple-300">
                      Requires {hoveredPod.storage.type} storage ({hoveredPod.storage.size}GB)
                    </div>
                  </div>
                )}

                {/* Status and Node */}
                <div className="flex items-center justify-center gap-4 text-sm border-t border-slate-700 pt-2">
                  <span className="text-slate-400">
                    Status: <span className={`font-semibold ${
                      hoveredPod.status === 'running' ? 'text-green-400' :
                      hoveredPod.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{hoveredPod.status}</span>
                  </span>
                  {hoveredPod.nodeId && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">
                        Node: <span className="text-white font-semibold">
                          {nodes.find(n => n.id === hoveredPod.nodeId)?.name || 'Unknown'}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-20 left-4 right-4 flex items-center justify-between">
        <Card className="p-3 px-5 bg-slate-900/95 border-indigo-500/30 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-slate-200">Level {level?.id}/{levels.length}</span>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <span className="text-sm text-slate-300">{level?.name}</span>
        </Card>

        <Card className="p-3 px-5 bg-slate-900/95 border-indigo-500/30 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-semibold text-slate-200">{score} pts</span>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm text-slate-300">{completedObjectives}/{objectives.length}</span>
          </div>
        </Card>
      </div>

      {/* Left Panel - Objectives */}
      <div className="absolute top-36 left-4 w-80">
        <Card className="p-4 bg-slate-900/95 border-indigo-500/30">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400 flex items-center gap-2">
                <Box className="w-4 h-4" />
                Deployment Progress
              </span>
              <span className="text-slate-300 font-medium">{scheduledPods}/{pods.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" /> Mission Objectives
            </h3>
            {objectives.map((obj, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 text-sm p-2.5 rounded-lg transition-all ${
                  obj.completed
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-slate-800/50 border border-slate-700/50'
                }`}
              >
                {obj.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                )}
                <span className={obj.completed ? 'text-green-300 font-medium' : 'text-slate-400'}>
                  {obj.description}
                </span>
              </div>
            ))}
          </div>

          {revealsRemaining > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <Button
                onClick={revealSolution}
                variant="outline"
                size="sm"
                className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Reveal Solution ({revealsRemaining} left)
              </Button>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Auto-solve this level instantly
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Right Panel - Cluster Status */}
      <div className="absolute top-36 right-4 w-72">
        <Card className="p-4 bg-slate-900/95 border-indigo-500/30">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Server className="w-4 h-4" /> Cluster Status
          </h3>
          <div className="space-y-3">
            {nodes.map(node => {
              const utilization = node.capacity > 0 ? (node.pods.length / node.capacity) * 100 : 0;
              const vCPUUtilization = node.resources?.vCPU > 0 ? (node.resources.vCPUUsed / node.resources.vCPU) * 100 : 0;
              const memoryUtilization = node.resources?.memory > 0 ? (node.resources.memoryUsed / node.resources.memory) * 100 : 0;

              return (
                <div key={node.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-300 font-medium">{node.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      node.pods.length >= node.capacity
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : node.pods.length > 0
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {node.pods.length}/{node.capacity}
                    </span>
                  </div>

                  {/* Pod Capacity Progress Bar */}
                  <Progress value={utilization} className="h-1.5 mb-2" />

                  {/* Resource Utilization Bars */}
                  {node.resources && (
                    <div className="space-y-1.5 mb-2">
                      {/* vCPU Utilization */}
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs text-slate-400">vCPU</span>
                          <span className="text-xs text-blue-400 font-medium">
                            {node.resources.vCPUUsed.toFixed(1)}/{node.resources.vCPU}
                          </span>
                        </div>
                        <Progress
                          value={vCPUUtilization}
                          className="h-1 bg-blue-950"
                        />
                      </div>

                      {/* Memory Utilization */}
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs text-slate-400">Memory</span>
                          <span className="text-xs text-green-400 font-medium">
                            {node.resources.memoryUsed.toFixed(1)}/{node.resources.memory}GB
                          </span>
                        </div>
                        <Progress
                          value={memoryUtilization}
                          className="h-1 bg-green-950"
                        />
                      </div>
                    </div>
                  )}

                  {/* Pod Visual Slots */}
                  <div className="flex gap-1">
                    {Array.from({ length: node.capacity }).map((_, i) => {
                      const podId = node.pods[i];
                      const pod = pods.find(p => p.id === podId);
                      return (
                        <div
                          key={i}
                          className="flex-1 h-6 rounded border border-slate-700"
                          style={{
                            backgroundColor: pod ? pod.color : '#1e293b',
                            opacity: pod ? 1 : 0.3,
                          }}
                          title={pod?.name}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => loadLevel(currentLevel)}
              variant="outline"
              size="sm"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button
              onClick={toggleMute}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </Card>
      </div>

      {/* Control Plane Status Panel */}
      {controlPlane.length > 0 && (
        <div className="absolute top-36 right-80 w-72">
          <Card className="p-4 bg-slate-900/95 border-purple-500/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" /> Control Plane
            </h3>

            {/* Overall Cluster Health */}
            <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Cluster Health</span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  controlPlane.every(cp => cp.healthy)
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {controlPlane.every(cp => cp.healthy) ? '✓ Healthy' : '✗ Degraded'}
                </span>
              </div>
            </div>

            {/* Control Plane Components */}
            <div className="space-y-2">
              {controlPlane.map(cpNode => {
                const getComponentColor = () => {
                  switch (cpNode.componentType) {
                    case 'etcd': return 'green';
                    case 'apiserver': return 'red';
                    case 'scheduler': return 'orange';
                    case 'controller-manager': return 'purple';
                    default: return 'gray';
                  }
                };

                const color = getComponentColor();
                const colorClasses = {
                  green: 'bg-green-500/10 border-green-500/30 text-green-400',
                  red: 'bg-red-500/10 border-red-500/30 text-red-400',
                  orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
                  purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                  gray: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
                };

                return (
                  <div
                    key={cpNode.id}
                    className={`p-2.5 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{cpNode.componentType}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                        cpNode.healthy
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {cpNode.healthy ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {cpNode.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Component Legend */}
            <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>etcd</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>API</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>Scheduler</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Controller</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Selection Hint */}
      {selectedPodId && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg animate-pulse">
            Click a node to deploy the selected pod
          </div>
        </div>
      )}

      {/* kubectl Logs */}
      <div className="absolute bottom-4 left-4 w-96">
        <Card className="p-3 bg-slate-900/95 border-indigo-500/30">
          <h3 className="text-xs font-medium text-slate-500 mb-2 font-mono">kubectl logs --tail=10</h3>
          <ScrollArea className="h-24">
            <div className="space-y-1 font-mono text-xs">
              {logs.slice(-10).map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes('[ERROR]') ? 'text-red-400' :
                    log.includes('[SUCCESS]') ? 'text-green-400' :
                    'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Hints Panel */}
      <div className="absolute bottom-4 right-4">
        <Card className="p-3 bg-slate-900/95 border-indigo-500/30 w-80">
          {!showHint ? (
            <Button
              onClick={() => setShowHint(true)}
              variant="outline"
              size="sm"
              className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/50"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Need a Hint?
            </Button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Level Hint
                </h3>
                <Button
                  onClick={() => setShowHint(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-slate-500 hover:text-slate-300"
                >
                  ✕
                </Button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {level?.hint || "No hint available for this level."}
              </p>
            </div>
          )}
        </Card>

        {/* Controls */}
        <Card className="p-3 bg-slate-900/95 border-indigo-500/30 mt-2">
          <h3 className="text-xs font-medium text-slate-500 mb-2">Controls</h3>
          <div className="text-xs text-slate-400 space-y-1">
            <div><kbd className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono">Click</kbd> Select/Deploy</div>
            <div><kbd className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono">Drag</kbd> Rotate View</div>
            <div><kbd className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono">Scroll</kbd> Zoom</div>
          </div>
        </Card>
      </div>
    </>
  );
}

function LevelComplete() {
  const { currentLevel, levels, score, nextLevel, restart } = useGame();
  const level = levels[currentLevel];
  const isLastLevel = currentLevel >= levels.length - 1;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-8">
      <Card className="p-10 bg-slate-900/95 border-green-500/40 text-center max-w-3xl shadow-2xl">
        <div className="mb-6">
          <div className="relative inline-block">
            <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto" />
            <div className="absolute -inset-2 bg-green-500/20 blur-2xl rounded-full"></div>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Mission Complete!</h2>
        <p className="text-slate-400 mb-6">{level?.name}</p>

        <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
          <p className="text-4xl font-bold text-green-400 mb-1">+{100 * (currentLevel + 1)}</p>
          <p className="text-sm text-slate-400">Points Earned</p>
        </div>

        <p className="text-slate-300 mb-6 flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Total Score: <span className="font-bold text-white">{score}</span>
        </p>

        {level?.analysis && (
          <div className="mb-8 p-6 bg-indigo-500/10 rounded-xl border border-indigo-500/30 text-left">
            <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Solution Analysis
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {level.analysis}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          {!isLastLevel ? (
            <Button
              onClick={nextLevel}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/30"
            >
              Next Level <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={restart}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
            >
              Complete Game <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function GameComplete() {
  const { score, restart, levels } = useGame();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-md">
      <Card className="p-12 bg-slate-900/95 border-purple-500/40 text-center max-w-lg shadow-2xl">
        <div className="mb-6">
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <div className="relative inline-block mb-4">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
            <div className="absolute -inset-4 bg-yellow-500/20 blur-2xl rounded-full"></div>
          </div>
        </div>

        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Kubernetes Master!
        </h2>
        <p className="text-slate-300 text-lg mb-8">
          You've completed all {levels.length} levels and mastered container orchestration!
        </p>

        <div className="mb-8 p-6 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl border border-purple-500/40">
          <p className="text-5xl font-bold text-purple-400 mb-2">{score}</p>
          <p className="text-slate-400">Final Score</p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>All {levels.length} Levels Completed</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
            <Shield className="w-4 h-4" />
            <span>Kubernetes Concepts Mastered</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-purple-400">
            <Trophy className="w-4 h-4" />
            <span>Cluster Conductor Certified</span>
          </div>
        </div>

        <Button
          onClick={restart}
          size="lg"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-10 shadow-lg shadow-purple-500/30"
        >
          <RotateCcw className="w-5 h-5 mr-2" /> Play Again
        </Button>
      </Card>
    </div>
  );
}

export function GameUI() {
  const { phase } = useGame();

  return (
    <>
      {phase === "menu" && <MainMenu />}
      {phase === "briefing" && <LevelBriefing />}
      {phase === "playing" && <GameHUD />}
      {phase === "levelComplete" && <LevelComplete />}
      {phase === "gameComplete" && <GameComplete />}
    </>
  );
}
