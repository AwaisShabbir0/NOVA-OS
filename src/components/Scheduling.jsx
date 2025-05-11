import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Scheduling.css';

function Scheduling() {
  const location = useLocation();
  const [processes, setProcesses] = useState([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [metrics, setMetrics] = useState({
    avgWaitingTime: 0,
    avgTurnaroundTime: 0,
    throughput: 0
  });
  const [executionHistory, setExecutionHistory] = useState([]);

  useEffect(() => {
    if (location.state?.processes) {
      setProcesses(location.state.processes);
    }
  }, [location.state]);

  useEffect(() => {
  let timer;
  if (isRunning) {
    timer = setInterval(() => {
      setTime(prevTime => {
        const newTime = prevTime + 1;
        
        // Check if current process completed
        if (currentProcess && newTime === currentProcess.startTime + currentProcess.burstTime) {
          const completionTime = newTime;
          const turnaroundTime = completionTime - currentProcess.arrivalTime;
          const waitingTime = turnaroundTime - currentProcess.burstTime;
          
          setCompletedProcesses(prev => [...prev, {
            ...currentProcess,
            completionTime,
            turnaroundTime,
            waitingTime
          }]);
          
          setExecutionHistory(prev => [...prev, {
            process: currentProcess,
            start: currentProcess.startTime,
            end: completionTime
          }]);
          
          setCurrentProcess(null);
          
          // Immediately start next process if available
          const nextProcess = processes
            .sort((a, b) => a.arrivalTime - b.arrivalTime)
            .find(p => p.arrivalTime <= newTime);
            
          if (nextProcess) {
            setCurrentProcess({
              ...nextProcess,
              startTime: newTime // Start immediately after previous process
            });
            setProcesses(prev => prev.filter(p => p.processID !== nextProcess.processID));
          }
          
          return newTime;
        }

        // If no current process, find the next one at the start
        if (!currentProcess && processes.length > 0) {
          const nextProcess = processes
            .sort((a, b) => a.arrivalTime - b.arrivalTime)
            .find(p => p.arrivalTime <= newTime);
            
          if (nextProcess) {
            setCurrentProcess({
              ...nextProcess,
              startTime: Math.max(newTime, nextProcess.arrivalTime)
            });
            setProcesses(prev => prev.filter(p => p.processID !== nextProcess.processID));
          }
        }

        // Stop simulation if all processes completed
        if (processes.length === 0 && !currentProcess && completedProcesses.length > 0) {
          setIsRunning(false);
        }

        return newTime;
      });
    }, 1000);
  }
  return () => clearInterval(timer);
}, [isRunning, processes, currentProcess, completedProcesses]);

  useEffect(() => {
    if (processes.length === 0 && currentProcess === null && completedProcesses.length > 0) {
      const totalWaiting = completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
      const totalTurnaround = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
      
      setMetrics({
        avgWaitingTime: (totalWaiting / completedProcesses.length).toFixed(2),
        avgTurnaroundTime: (totalTurnaround / completedProcesses.length).toFixed(2),
        throughput: (completedProcesses.length / time).toFixed(2)
      });
    }
  }, [processes, currentProcess, completedProcesses, time]);

  const startSimulation = () => {
    if (processes.length > 0) {
      setIsRunning(true);
      setTime(0);
      setCompletedProcesses([]);
      setExecutionHistory([]);
      
      const nextProcess = processes.find(p => p.arrivalTime <= 0);
      if (nextProcess) {
        setCurrentProcess({
          ...nextProcess,
          startTime: 0
        });
        setProcesses(prev => prev.filter(p => p.processID !== nextProcess.processID));
      }
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setTime(0);
    setCurrentProcess(null);
    setCompletedProcesses([]);
    setExecutionHistory([]);
    if (location.state?.processes) {
      setProcesses(location.state.processes);
    }
  };

  // Generate colors for processes
  const getProcessColor = (processID) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F06292', '#7986CB', '#9575CD',
      '#64B5F6', '#4DB6AC', '#81C784', '#FFD54F'
    ];
    return colors[processID % colors.length];
  };

  return (
    <div className="scheduling">
      <h2>Process Scheduling (FCFS)</h2>
      
      <div className="controls">
        <button 
          className="btn" 
          onClick={startSimulation} 
          disabled={isRunning || processes.length === 0}
        >
          {isRunning ? 'Running...' : 'Start Simulation'}
        </button>
        <button className="btn" onClick={resetSimulation}>
          Reset
        </button>
        <div className="time-display">Time: {time}s</div>
      </div>

      <div className="gantt-chart">
        <h3>Gantt Chart</h3>
        <div className="gantt-container">
          {executionHistory.map((item, index) => (
            <div 
              key={index}
              className="gantt-item"
              style={{
                width: `${(item.end - item.start) * 30}px`,
                backgroundColor: getProcessColor(item.process.processID)
              }}
              title={`P${item.process.processID} (${item.start}s-${item.end}s)`}
            >
              <span>P{item.process.processID}</span>
              <span className="gantt-time">{item.start}s-{item.end}s</span>
            </div>
          ))}
          {currentProcess && (
            <div 
              className="gantt-item current"
              style={{
                width: `${(time - currentProcess.startTime) * 30}px`,
                backgroundColor: getProcessColor(currentProcess.processID)
              }}
              title={`P${currentProcess.processID} (${currentProcess.startTime}s-?)`}
            >
              <span>P{currentProcess.processID}</span>
              <span className="gantt-time">{currentProcess.startTime}s-?</span>
            </div>
          )}
        </div>
        <div className="gantt-timeline">
          {Array.from({ length: time + 5 }).map((_, i) => (
            <div key={i} className="gantt-tick">
              {i}
            </div>
          ))}
        </div>
      </div>

      <div className="scheduling-visualization">
        <div className="cpu">
          <h3>CPU/Running Queue {currentProcess ? '⚡' : '💤'}</h3>
          {currentProcess ? (
            <div className="process-running">
              <span>P{currentProcess.processID}</span>
              <span>Ends at: {currentProcess.startTime + currentProcess.burstTime}s</span>
            </div>
          ) : (
            <div className="cpu-idle">
              {processes.length === 0 && completedProcesses.length > 0 
                ? "All processes completed!" 
                : processes.length > 0 ? "Ready to start" : "No processes"}
            </div>
          )}
        </div>

        <div className="queues">
          <div className="ready-queue">
            <h3>📥 Ready Queue ({processes.length})</h3>
            {processes
              .sort((a, b) => a.arrivalTime - b.arrivalTime)
              .map(process => (
                <div key={process.processID} className="process">
                  P{process.processID} 
                  <span>(Arrival: {process.arrivalTime}s, Burst: {process.burstTime}s, Mem: {Math.round(process.memoryRequired/1024)}MB)</span>
                </div>
              ))}
          </div>

          <div className="completed-processes">
            <h3>✅ Completed ({completedProcesses.length})</h3>
            {completedProcesses.map(process => (
              <div key={process.processID} className="process completed">
                <div><strong>P{process.processID}</strong> ({process.owner})</div>
                <div>Arrival: {process.arrivalTime}s</div>
                <div>Burst: {process.burstTime}s</div>
                <div>Memory: {Math.round(process.memoryRequired/1024)}MB</div>
                <div>Completed: {process.completionTime}s</div>
                <div>Turnaround: {process.turnaroundTime}s</div>
                <div>Waiting: {process.waitingTime}s</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {completedProcesses.length > 0 && (
        <div className="metrics">
          <h3>Scheduling Metrics</h3>
          <div className="metrics-grid">
            <div>Average Waiting Time:</div>
            <div>{metrics.avgWaitingTime}s</div>
            
            <div>Average Turnaround Time:</div>
            <div>{metrics.avgTurnaroundTime}s</div>
            
            <div>Throughput:</div>
            <div>{metrics.throughput} processes/second</div>
          </div>
        </div>
      )}

      <Link to="/process" className="back-btn">⬅ Back to Process Management</Link>
    </div>
  );
}

export default Scheduling;