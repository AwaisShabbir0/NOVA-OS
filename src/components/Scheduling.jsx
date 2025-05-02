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

  // Get processes from location state
  useEffect(() => {
    if (location.state?.processes) {
      setProcesses(location.state.processes.map(p => ({
        ...p,
        arrivalTime: 0, // Default arrival time for FCFS
        burstTime: Math.max(1, Math.floor(p.memoryRequired / 512)) // Simulated burst time
      })));
    }
  }, [location.state]);

  // Simulation logic - FIXED VERSION
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;

          // Check if current process completed
          if (currentProcess && newTime >= currentProcess.startTime + currentProcess.burstTime) {
            const completed = {
              ...currentProcess,
              completionTime: newTime,
              turnaroundTime: newTime - currentProcess.arrivalTime,
              waitingTime: currentProcess.startTime - currentProcess.arrivalTime
            };

            setCompletedProcesses(prev => [...prev, completed]);
            setCurrentProcess(null);
          }

          // Get next process if CPU is free and processes remain
          if (!currentProcess && processes.length > 0) {
            const nextProcess = processes[0];
            setCurrentProcess({
              ...nextProcess,
              startTime: newTime
            });
            setProcesses(prev => prev.slice(1));
          }

          // Stop simulation when all processes are done
          if (!currentProcess && processes.length === 0) {
            setIsRunning(false);
          }

          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, processes, currentProcess]);

  const startSimulation = () => {
    setIsRunning(true);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setTime(0);
    setCurrentProcess(null);
    setCompletedProcesses([]);
    if (location.state?.processes) {
      setProcesses(location.state.processes.map(p => ({
        ...p,
        arrivalTime: 0,
        burstTime: Math.max(1, Math.floor(p.memoryRequired / 512))
      })));
    }
  };

  return (
    <div className="scheduling">
      <h2>Process Scheduling (FCFS)</h2>

      <div className="controls">
        <button className="btn" onClick={startSimulation} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Start Simulation'}
        </button>
        <button className="btn" onClick={resetSimulation}>
          Reset
        </button>
        <div className="time-display">Time: {time}s</div>
      </div>

      <div className="scheduling-visualization">
        <div className="cpu">
          <h3>CPU</h3>
          {currentProcess ? (
            <div className="process-running">
              <span>PID: {currentProcess.processID}</span>
              <span>Time Left: {currentProcess.burstTime - (time - currentProcess.startTime)}s</span>
            </div>
          ) : (
            <div className="cpu-idle">
              {processes.length === 0 && completedProcesses.length > 0 ?
                "All processes completed!" : "Idle"}
            </div>
          )}
        </div>

        <div className="queues">
          <div className="ready-queue">
            <h3>Ready Queue ({processes.length})</h3>
            {processes.map(process => (
              <div key={process.processID} className="process">
                PID: {process.processID} (Burst: {process.burstTime}s)
              </div>
            ))}
          </div>

          <div className="completed-processes">
            <h3>Completed ({completedProcesses.length})</h3>
            {completedProcesses.map(process => (
              <div key={process.processID} className="process completed">
                PID: {process.processID} |
                Turnaround: {process.turnaroundTime}s |
                Waiting: {process.waitingTime}s
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link to="/process" className="back-btn">⬅ Back to Process Management</Link>
    </div>
  );
}

export default Scheduling;