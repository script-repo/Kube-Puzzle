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
  ArrowRight
} from "lucide-react";

function MainMenu() {
  const { start } = useGame();
  const { isMuted, toggleMute } = useAudio();
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900/80 to-indigo-900/80 backdrop-blur-sm">
      <Card className="p-8 bg-slate-900/90 border-indigo-500/30 text-center max-w-lg">
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Cpu className="w-10 h-10 text-indigo-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Cluster Conductor
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Master the art of Kubernetes orchestration
          </p>
        </div>
        
        <div className="space-y-4 mb-8 text-left">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
            <Box className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-slate-200">Schedule Pods</h3>
              <p className="text-sm text-slate-400">Click pods to select, then click nodes to deploy</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
            <Server className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-slate-200">Manage Nodes</h3>
              <p className="text-sm text-slate-400">Respect capacity limits and placement rules</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
            <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-slate-200">Complete Objectives</h3>
              <p className="text-sm text-slate-400">Deploy pods to match the cluster manifest</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={start}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game
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
    loadLevel,
    restart
  } = useGame();
  const { isMuted, toggleMute } = useAudio();
  
  const level = levels[currentLevel];
  const scheduledPods = pods.filter(p => p.nodeId !== null).length;
  const progress = (scheduledPods / pods.length) * 100;
  
  return (
    <>
      <div className="absolute top-4 left-4 w-80">
        <Card className="p-4 bg-slate-900/90 border-indigo-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold text-slate-200">Level {level?.id}</span>
            </div>
            <span className="text-sm text-slate-400">Score: {score}</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">{level?.name}</h2>
          <p className="text-sm text-slate-400 mb-4">{level?.description}</p>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Deployment Progress</span>
              <span className="text-slate-300">{scheduledPods}/{pods.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Server className="w-4 h-4" /> Objectives
            </h3>
            {objectives.map((obj, i) => (
              <div 
                key={i} 
                className={`flex items-start gap-2 text-sm p-2 rounded ${
                  obj.completed ? 'bg-green-900/30' : 'bg-slate-800/50'
                }`}
              >
                {obj.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                )}
                <span className={obj.completed ? 'text-green-400' : 'text-slate-400'}>
                  {obj.description}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <div className="absolute top-4 right-4 w-72">
        <Card className="p-4 bg-slate-900/90 border-indigo-500/30">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Box className="w-4 h-4" /> Cluster Status
          </h3>
          <div className="space-y-3">
            {nodes.map(node => (
              <div key={node.id} className="p-2 rounded bg-slate-800/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-300">{node.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    node.pods.length >= node.capacity 
                      ? 'bg-red-500/20 text-red-400' 
                      : node.pods.length > 0 
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                  }`}>
                    {node.pods.length}/{node.capacity}
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: node.capacity }).map((_, i) => {
                    const podId = node.pods[i];
                    const pod = pods.find(p => p.id === podId);
                    return (
                      <div
                        key={i}
                        className="w-6 h-6 rounded"
                        style={{
                          backgroundColor: pod ? pod.color : '#1e293b',
                          opacity: pod ? 1 : 0.3,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => loadLevel(currentLevel)}
              variant="outline"
              size="sm"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Reset Level
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
      
      {selectedPodId && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-indigo-600/90 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
            Click a node to deploy the pod
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 w-96">
        <Card className="p-3 bg-slate-900/90 border-indigo-500/30">
          <h3 className="text-xs font-medium text-slate-500 mb-2">kubectl logs</h3>
          <ScrollArea className="h-24">
            <div className="space-y-1 font-mono text-xs">
              {logs.map((log, i) => (
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
      
      <div className="absolute bottom-4 right-4">
        <Card className="p-3 bg-slate-900/90 border-indigo-500/30">
          <div className="text-xs text-slate-400 space-y-1">
            <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">W A S D</kbd> Move</div>
            <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Click</kbd> Select/Deploy</div>
            <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Scroll</kbd> Zoom</div>
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
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <Card className="p-8 bg-slate-900/90 border-green-500/30 text-center max-w-md">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Level Complete!</h2>
        <p className="text-slate-400 mb-4">{level?.name}</p>
        <p className="text-3xl font-bold text-green-400 mb-6">+{100 * (currentLevel + 1)} points</p>
        <p className="text-slate-300 mb-6">Total Score: {score}</p>
        
        <div className="flex gap-4 justify-center">
          {!isLastLevel ? (
            <Button 
              onClick={nextLevel}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Next Level <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={restart}
              size="lg"
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              Play Again <RotateCcw className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function GameComplete() {
  const { score, restart } = useGame();
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <Card className="p-8 bg-slate-900/90 border-purple-500/30 text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Congratulations!
        </h2>
        <p className="text-slate-300 mb-2">You've mastered Kubernetes orchestration!</p>
        <p className="text-4xl font-bold text-purple-400 mb-6">Final Score: {score}</p>
        
        <Button 
          onClick={restart}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Play Again
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
      {phase === "playing" && <GameHUD />}
      {phase === "levelComplete" && <LevelComplete />}
      {phase === "gameComplete" && <GameComplete />}
    </>
  );
}
