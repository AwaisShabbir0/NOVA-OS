import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Scheduling.css';

function SJFScheduling() {
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
        remainingTime: p.burstTime,
        startTime: null
      }));
      setProcesses(initialized);
    }
  }, [location.state]);

  const runSimulation = () => {
    setTime(prevTime => {
      const currentTime = prevTime;

      // Move newly arrived processes
      const newlyArrived = processes.filter(p => p.arrivalTime === currentTime);
      const remainingProcesses = processes.filter(p => p.arrivalTime > currentTime);
      setProcesses(remainingProcesses);
      const updatedQueue = [...readyQueue, ...newlyArrived];

      // If a process is running, add it to queue for preemption check
      if (currentProcess) updatedQueue.push(currentProcess);

      // Sort ready queue by shortest remaining time
      updatedQueue.sort((a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime);

      if (updatedQueue.length > 0) {
        const executing = { ...updatedQueue[0] };

        if (executing.startTime === null) executing.startTime = currentTime;
        executing.remainingTime -= 1;

        if (executing.remainingTime === 0) {
          const completionTime = currentTime + 1;
          const turnaroundTime = completionTime - executing.arrivalTime;
          const waitingTime = turnaroundTime - executing.burstTime;

          setCompletedProcesses(prev => [
            ...prev,
            {
              ...executing,
              completionTime,
              turnaroundTime,
              waitingTime
            }
          ]);

          setExecutionHistory(prev => [
            ...prev,
            {
              process: executing,
              start: executing.startTime,
              end: completionTime
            }
          ]);

          setCurrentProcess(null);
          setReadyQueue(updatedQueue.slice(1));
        } else {
          setCurrentProcess(executing);
          setReadyQueue(updatedQueue.slice(1));
        }
      } else {
        setCurrentProcess(null); // CPU idle
      }

      return currentTime + 1;
    });
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setTimeout(runSimulation, 1000);
    } else {
      clearTimeout(timerRef.current);
    }

    return () => clearTimeout(timerRef.current);
  }, [isRunning, time, readyQueue, currentProcess]);

  useEffect(() => {
    if (
      isRunning &&
      processes.length === 0 &&
      readyQueue.length === 0 &&
      currentProcess === null
    ) {
      setIsRunning(false);
    }
  }, [processes, readyQueue, currentProcess, isRunning]);

  useEffect(() => {
    if (!isRunning && completedProcesses.length > 0) {
      const totalTurnaround = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
      const totalWaiting = completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
      const avgTurnaroundTime = (totalTurnaround / completedProcesses.length).toFixed(2);
      const avgWaitingTime = (totalWaiting / completedProcesses.length).toFixed(2);
      const throughput = (completedProcesses.length / time).toFixed(2);

      setMetrics({ avgWaitingTime, avgTurnaroundTime, throughput });
    }
  }, [isRunning, completedProcesses, time]);

  const startSimulation = () => {
    if (processes.length > 0) {
      setIsRunning(true);
      setTime(0);
      setCompletedProcesses([]);
      setExecutionHistory([]);
      setCurrentProcess(null);
      setReadyQueue([]);
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setTime(0);
    setReadyQueue([]);
    setCompletedProcesses([]);
    setExecutionHistory([]);
    setCurrentProcess(null);

    if (location.state?.processes) {
      const initialized = location.state.processes.map(p => ({
        ...p,
        remainingTime: p.burstTime,
        startTime: null
      }));
      setProcesses(initialized);
    }
  };

  const getProcessColor = (processID) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292'];
    return colors[processID % colors.length];
  };

  return (
    <div className="scheduling">
      <h2>Process Scheduling (SJF Preemptive)</h2>

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
              title={`P${item.process.processID} (${item.start}s-${item.end}s)`}>
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
                <div>Completed: {p.completionTime}s</div>
                <div>Turnaround: {p.turnaroundTime}s</div>
                <div>Waiting: {p.waitingTime}s</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {completedProcesses.length > 0 && (
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
              {completedProcesses.map(process => (
                <tr key={process.processID}>
                  <td>P{process.processID}</td>
                  <td>{process.owner}</td>
                  <td>{process.arrivalTime}s</td>
                  <td>{process.burstTime}s</td>
                  <td>{process.completionTime}s</td>
                  <td>{process.turnaroundTime}s</td>
                  <td>{process.waitingTime}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isRunning && completedProcesses.length > 0 && (
  <div className="metrics-container">
    <h3 className="metrics-heading">Scheduling Metrics</h3>
    <div className="metrics-box">
      <p><strong>Average Waiting Time:</strong> {metrics.avgWaitingTime}s</p>
      <p><strong>Average Turnaround Time:</strong> {metrics.avgTurnaroundTime}s</p>
      <p><strong>Throughput:</strong> {metrics.throughput} processes/second</p>
    </div>
  </div>
)}


      <Link to="/process" className="back-btn">⬅ Back to Process Management</Link>
    </div>
  );
}

export default SJFScheduling;
