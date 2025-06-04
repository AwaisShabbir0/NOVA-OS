import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Scheduling.css';

function RRScheduling() {
  const location = useLocation();
  const [processes, setProcesses] = useState([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [readyQueue, setReadyQueue] = useState([]);
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [metrics, setMetrics] = useState({
    avgWaitingTime: 0,
    avgTurnaroundTime: 0,
    throughput: 0
  });
  const [executionHistory, setExecutionHistory] = useState([]);
  const timerRef = useRef(null);

  // Initialize processes
  useEffect(() => {
    if (location.state?.processes) {
      const initialProcesses = location.state.processes.map(p => ({
        ...p,
        remainingTime: p.burstTime,
        lastPreempted: null
      }));

      setProcesses(initialProcesses);

      // Initialize ready queue with processes that have arrivalTime <= 0
      const initialReady = initialProcesses.filter(p => p.arrivalTime <= 0);
      setReadyQueue(initialReady);

      // Remove these processes from the main processes list
      setProcesses(prev => prev.filter(p => p.arrivalTime > 0));
    }
  }, [location.state]);

  // Round Robin simulation logic
  const runSimulation = () => {
    setTime(prevTime => {
      const currentTime = prevTime + 1;

      // Check for newly arrived processes
      const newArrivals = processes.filter(p =>
        p.arrivalTime === currentTime &&
        !readyQueue.some(q => q.processID === p.processID) &&
        p !== currentProcess
      );

      if (newArrivals.length > 0) {
        setReadyQueue(prev => [...prev, ...newArrivals]);
        setProcesses(prev => prev.filter(p => !newArrivals.some(n => n.processID === p.processID)));
      }

      // Check if current process completed or time quantum expired
      if (currentProcess) {
        const timeInCPU = currentTime - currentProcess.startTime;
        const completed = currentProcess.remainingTime <= 0;
        const quantumExpired = timeInCPU >= timeQuantum && currentProcess.remainingTime > 0;

        if (completed || quantumExpired) {
          // Process completed
          if (completed) {
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
              end: completionTime
            }]);
          }
          // Time quantum expired (preempt)
          else if (quantumExpired) {
            setReadyQueue(prev => [...prev, {
              ...currentProcess,
              remainingTime: currentProcess.remainingTime - timeQuantum,
              lastPreempted: currentTime
            }]);

            setExecutionHistory(prev => [...prev, {
              process: currentProcess,
              start: currentProcess.startTime,
              end: currentTime
            }]);
          }

          setCurrentProcess(null);
        }
      }

      // Select next process if CPU is idle
      if (!currentProcess && (readyQueue.length > 0 || processes.length > 0)) {
        const nextProcess = readyQueue.length > 0
          ? readyQueue[0]
          : processes.sort((a, b) => a.arrivalTime - b.arrivalTime)[0];

        if (nextProcess) {
          setCurrentProcess({
            ...nextProcess,
            startTime: currentTime,
            remainingTime: nextProcess.lastPreempted !== null
              ? nextProcess.remainingTime
              : nextProcess.burstTime
          });

          if (readyQueue.length > 0) {
            setReadyQueue(prev => prev.slice(1));
          } else {
            setProcesses(prev => prev.filter(p => p.processID !== nextProcess.processID));
          }
        }
      }

      // Stop simulation if all processes completed
      if (processes.length === 0 && readyQueue.length === 0 && !currentProcess && completedProcesses.length > 0) {
        setIsRunning(false);
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, processes, currentProcess, readyQueue, timeQuantum]);

  // Calculate metrics when simulation completes
  useEffect(() => {
    if (processes.length === 0 && readyQueue.length === 0 && !currentProcess && completedProcesses.length > 0) {
      const totalWaiting = completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
      const totalTurnaround = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);

      setMetrics({
        avgWaitingTime: (totalWaiting / completedProcesses.length).toFixed(2),
        avgTurnaroundTime: (totalTurnaround / completedProcesses.length).toFixed(2),
        throughput: (completedProcesses.length / time).toFixed(2)
      });
    }
  }, [processes, currentProcess, completedProcesses, time, readyQueue]);

  const startSimulation = () => {
    if (processes.length > 0 || readyQueue.length > 0) {
      setIsRunning(true);
      setTime(0);
      setCompletedProcesses([]);
      setExecutionHistory([]);

      if (!currentProcess && readyQueue.length > 0) {
        const nextProcess = readyQueue[0];
        setCurrentProcess({
          ...nextProcess,
          startTime: 0
        });
        setReadyQueue(prev => prev.slice(1));
      }
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setTime(0);
    setCurrentProcess(null);
    setReadyQueue([]);
    setCompletedProcesses([]);
    setExecutionHistory([]);
    if (location.state?.processes) {
      setProcesses(location.state.processes.map(p => ({
        ...p,
        remainingTime: p.burstTime,
        lastPreempted: null
      })));
    }
  };

  const handleTimeQuantumChange = (e) => {
    const newQuantum = parseInt(e.target.value);
    if (newQuantum > 0) {
      setTimeQuantum(newQuantum);
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
      <h2>Process Scheduling (Round Robin)</h2>

      <div className="controls">
        <div className="time-quantum-control" style={{
          marginRight: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <label style={{ color: '#00d4ff' }}>Time Quantum: </label>
          <input
            type="number"
            min="1"
            max="10"
            value={timeQuantum}
            onChange={handleTimeQuantumChange}
            disabled={isRunning}
            style={{
              width: '50px',
              padding: '5px',
              background: '#2c2c2c',
              border: '1px solid #00d4ff',
              borderRadius: '4px',
              color: 'white',
              textAlign: 'center'
            }}
          />
          <span style={{ color: '#aaa' }}>seconds</span>
        </div>

        <button
          className="btn"
          onClick={startSimulation}
          disabled={isRunning || (processes.length === 0 && readyQueue.length === 0)}
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
              <span>Remaining: {currentProcess.remainingTime}s</span>
              <span>Quantum: {time - currentProcess.startTime}/{timeQuantum}s</span>
            </div>
          ) : (
            <div className="cpu-idle">
              {processes.length === 0 && readyQueue.length === 0 && completedProcesses.length > 0
                ? "All processes completed!"
                : readyQueue.length > 0 || processes.length > 0 ? "Ready to start" : "No processes"}
            </div>
          )}
        </div>

        <div className="queues">
          <div className="ready-queue">
            <h3>📥 Ready Queue ({readyQueue.length})</h3>
            {readyQueue.map(process => (
              <div key={process.processID} className="process">
                <div>
                  <strong>P{process.processID}</strong> ({process.owner})
                </div>
                <div>Arrival: {process.arrivalTime}s</div>
                <div>Remaining: {process.remainingTime}s</div>
                <div>Priority: {process.priority}</div>
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
                <div>Memory: {Math.round(process.memoryRequired / 1024)}MB</div>
                <div>Completed: {process.completionTime}s</div>
                <div>Turnaround: {process.turnaroundTime}s</div>
                <div>Waiting: {process.waitingTime}s</div>
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
              {completedProcesses
                .sort((a, b) => a.processID - b.processID)
                .map(process => (
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

export default RRScheduling;