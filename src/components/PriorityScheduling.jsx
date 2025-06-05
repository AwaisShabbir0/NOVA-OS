import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Scheduling.css';

function PriorityScheduling() {
  const location = useLocation();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [readyQueue, setReadyQueue] = useState([]);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [metrics, setMetrics] = useState({
    avgWaitingTime: 0,
    avgTurnaroundTime: 0,
    throughput: 0
  });
  const timerRef = useRef(null);

  useEffect(() => {
    if (location.state?.processes) {
      const initialized = location.state.processes.map(p => ({
        ...p,
        remainingTime: p.burstTime
      }));
      setProcesses(initialized);
    }
  }, [location.state]);

  const runSimulation = () => {
    setTime(prevTime => {
      const currentTime = prevTime + 1;

      // Add new arrivals to readyQueue
      const arrivals = processes.filter(p => p.arrivalTime === currentTime);
      if (arrivals.length > 0) {
        setReadyQueue(prev => [...prev, ...arrivals]);
        setProcesses(prev => prev.filter(p => !arrivals.includes(p)));
      }

      if (!currentProcess && readyQueue.length > 0) {
        // Sort by priority (lower number = higher priority), then by arrival time
        const sorted = [...readyQueue].sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority;
          return a.arrivalTime - b.arrivalTime;
        });
        const next = sorted[0];
        setCurrentProcess({ ...next, startTime: currentTime });
        setReadyQueue(prev => prev.filter(p => p.processID !== next.processID));
      }

      if (currentProcess) {
        const remaining = currentProcess.remainingTime - 1;
        if (remaining <= 0) {
          const completionTime = currentTime;
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
            end: currentTime
          }]);
          setCurrentProcess(null);
        } else {
          setCurrentProcess(prev => ({
            ...prev,
            remainingTime: remaining
          }));
        }
      }

      return currentTime;
    });

    if (isRunning) {
      timerRef.current = setTimeout(runSimulation, 1000);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setTimeout(runSimulation, 1000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    return () => clearTimeout(timerRef.current);
  }, [isRunning, processes, readyQueue, currentProcess]);

  useEffect(() => {
    if (!isRunning && processes.length === 0 && readyQueue.length === 0 && !currentProcess && completedProcesses.length > 0) {
      const totalWaiting = completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
      const totalTurnaround = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
      setMetrics({
        avgWaitingTime: (totalWaiting / completedProcesses.length).toFixed(2),
        avgTurnaroundTime: (totalTurnaround / completedProcesses.length).toFixed(2),
        throughput: (completedProcesses.length / time).toFixed(2)
      });
    }
  }, [isRunning, completedProcesses, processes, readyQueue, time, currentProcess]);

  const startSimulation = () => {
    if (processes.length > 0 || readyQueue.length > 0) {
      setIsRunning(true);
      setTime(0);
      setCompletedProcesses([]);
      setExecutionHistory([]);
      setCurrentProcess(null);
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setTime(0);
    setProcesses([]);
    setReadyQueue([]);
    setCompletedProcesses([]);
    setExecutionHistory([]);
    setCurrentProcess(null);
    if (location.state?.processes) {
      const initialized = location.state.processes.map(p => ({
        ...p,
        remainingTime: p.burstTime
      }));
      setProcesses(initialized);
    }
  };

  const getProcessColor = (id) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    return colors[id % colors.length];
  };

  return (
    <div className="scheduling">
      <h2>Priority Scheduling (Non-Preemptive)</h2>

      <div className="controls">
        <button className="btn" onClick={startSimulation} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Start Simulation'}
        </button>
        <button className="btn" onClick={resetSimulation}>Reset</button>
        <div className="time-display">Time: {time}s</div>
      </div>

      <div className="gantt-chart">
        <h3>Gantt Chart</h3>
        <div className="gantt-container">
          {executionHistory.map((item, index) => (
            <div key={index} className="gantt-item"
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
        </div>
      </div>

      <div className="scheduling-visualization">
        <div className="cpu">
          <h3>CPU {currentProcess ? '⚡' : '💤'}</h3>
          {currentProcess ? (
            <div className="process-running">
              <span>P{currentProcess.processID}</span>
              <span>Remaining: {currentProcess.remainingTime}s</span>
            </div>
          ) : <div className="cpu-idle">Idle</div>}
        </div>

        <div className="queues">
          <div className="ready-queue">
            <h3>📥 Ready Queue ({readyQueue.length})</h3>
            {readyQueue.map(p => (
              <div key={p.processID} className="process">
                <div><strong>P{p.processID}</strong> ({p.owner})</div>
                <div>Arrival: {p.arrivalTime}s</div>
                <div>Priority: {p.priority}</div>
                <div>Remaining: {p.remainingTime}s</div>
              </div>
            ))}
          </div>

          <div className="completed-processes">
            <h3>✅ Completed ({completedProcesses.length})</h3>
            {completedProcesses.map(p => (
              <div key={p.processID} className="process completed">
                <div><strong>P{p.processID}</strong> ({p.owner})</div>
                <div>Arrival: {p.arrivalTime}s</div>
                <div>Burst: {p.burstTime}s</div>
                <div>Priority: {p.priority}</div>
                <div>Completed: {p.completionTime}s</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {completedProcesses.length > 0 && (
        <>
          <div className="results-table">
            <h3>Scheduling Results</h3>
            <table>
              <thead>
                <tr>
                  <th>Process ID</th>
                  <th>Process Name</th>
                  <th>Arrival Time</th>
                  <th>Burst Time</th>
                  <th>Completion Time</th>
                  <th>Turnaround Time</th>
                  <th>Waiting Time</th>
                </tr>
              </thead>
              <tbody>
                {completedProcesses.map(p => (
                  <tr key={p.processID}>
                    <td>P{p.processID}</td>
                    <td>{p.owner}</td>
                    <td>{p.arrivalTime}s</td>
                    <td>{p.burstTime}s</td>
                    <td>{p.completionTime}s</td>
                    <td>{p.turnaroundTime}s</td>
                    <td>{p.waitingTime}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="metrics">
            <h3>Scheduling Metrics</h3>
            <div className="metrics-grid">
              <div>Average Waiting Time:</div>
              <div>{metrics.avgWaitingTime}s</div>
              <div>Average Turnaround Time:</div>
              <div>{metrics.avgTurnaroundTime}s</div>
              <div>Throughput:</div>
              <div>{metrics.throughput} processes/sec</div>
            </div>
          </div>
        </>
      )}

      <Link to="/process" className="back-btn">⬅ Back to Process Management</Link>
    </div>
  );
}

export default PriorityScheduling;