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
        quantumUsed: 0
      }));
      setProcesses(initialProcesses);
      // Initialize ready queue with processes that have arrivalTime <= 0
      const initialReady = initialProcesses.filter(p => p.arrivalTime <= 0);
      setReadyQueue(initialReady);
    }
  }, [location.state]);

  // Corrected Round Robin simulation logic
  const runSimulation = () => {
    setTime(prevTime => {
      const currentTime = prevTime + 1;

      let newProcesses = [...processes];
      let newReadyQueue = [...readyQueue];
      let newCurrentProcess = currentProcess;
      let newCompletedProcesses = [...completedProcesses];
      let newExecutionHistory = [...executionHistory];

      // Add newly arrived processes to ready queue
      const arrivals = newProcesses.filter(p => p.arrivalTime === currentTime);
      if (arrivals.length > 0) {
        newReadyQueue = [...newReadyQueue, ...arrivals];
        newProcesses = newProcesses.filter(p => !arrivals.includes(p));
      }

      // Process current CPU task
      if (newCurrentProcess) {
        const updatedProcess = {
          ...newCurrentProcess,
          remainingTime: newCurrentProcess.remainingTime - 1,
          quantumUsed: newCurrentProcess.quantumUsed + 1
        };

        // Check if process completed
        if (updatedProcess.remainingTime <= 0) {
          const completionTime = currentTime;
          const turnaroundTime = completionTime - updatedProcess.arrivalTime;
          const waitingTime = turnaroundTime - updatedProcess.burstTime;

          newCompletedProcesses.push({
            ...updatedProcess,
            completionTime,
            turnaroundTime,
            waitingTime
          });

          newExecutionHistory.push({
            process: updatedProcess,
            start: updatedProcess.startTime || currentTime - 1,
            end: currentTime
          });

          newCurrentProcess = null;
        }
        // Check if quantum expired
        else if (updatedProcess.quantumUsed >= timeQuantum) {
          newExecutionHistory.push({
            process: updatedProcess,
            start: updatedProcess.startTime || currentTime - updatedProcess.quantumUsed,
            end: currentTime
          });

          // Put back in ready queue
          const requeuedProcess = {
            ...updatedProcess,
            quantumUsed: 0
          };
          newReadyQueue.push(requeuedProcess);
          newCurrentProcess = null;
        } else {
          newCurrentProcess = updatedProcess;
        }
      }

      // Schedule new process if CPU is idle and ready queue not empty
      if (!newCurrentProcess && newReadyQueue.length > 0) {
        newCurrentProcess = {
          ...newReadyQueue[0],
          startTime: currentTime,
          quantumUsed: 0
        };
        newReadyQueue = newReadyQueue.slice(1);
      }

      // Update all states
      setProcesses(newProcesses);
      setCurrentProcess(newCurrentProcess);
      setReadyQueue(newReadyQueue);
      setCompletedProcesses(newCompletedProcesses);
      setExecutionHistory(newExecutionHistory);

      // Stop simulation if all processes are done
      if (!newCurrentProcess && newReadyQueue.length === 0 && newProcesses.length === 0) {
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
      clearTimeout(timerRef.current);
    }

    return () => {
      clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line
  }, [isRunning, processes, currentProcess, readyQueue, timeQuantum]);

  // Calculate metrics when simulation completes
  useEffect(() => {
    if (!isRunning && completedProcesses.length > 0) {
      const totalWaiting = completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
      const totalTurnaround = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
      const lastCompletion = Math.max(...completedProcesses.map(p => p.completionTime));

      setMetrics({
        avgWaitingTime: (totalWaiting / completedProcesses.length).toFixed(2),
        avgTurnaroundTime: (totalTurnaround / completedProcesses.length).toFixed(2),
        throughput: (completedProcesses.length / lastCompletion).toFixed(2)
      });
    }
  }, [isRunning, completedProcesses]);

  const startSimulation = () => {
    if (processes.length > 0 || readyQueue.length > 0) {
      setIsRunning(true);
      setTime(0);
      setCompletedProcesses([]);
      setExecutionHistory([]);
      if (!currentProcess && readyQueue.length > 0) {
        setCurrentProcess({
          ...readyQueue[0],
          startTime: 0,
          quantumUsed: 0
        });
        setReadyQueue(prev => prev.slice(1));
      }
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    clearTimeout(timerRef.current);
    setTime(0);
    setCurrentProcess(null);
    setReadyQueue([]);
    setCompletedProcesses([]);
    setExecutionHistory([]);
    if (location.state?.processes) {
      const initialProcesses = location.state.processes.map(p => ({
        ...p,
        remainingTime: p.burstTime,
        quantumUsed: 0
      }));
      setProcesses(initialProcesses);
      setReadyQueue(initialProcesses.filter(p => p.arrivalTime <= 0));
    }
  };

  const handleTimeQuantumChange = (e) => {
    const newQuantum = parseInt(e.target.value);
    if (newQuantum > 0 && !isRunning) {
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
                width: `${30}px`,
                backgroundColor: getProcessColor(currentProcess.processID)
              }}
              title={`P${currentProcess.processID} (${currentProcess.startTime}s-?)`}
            >
              <span>P{currentProcess.processID}</span>
              <span className="gantt-time">{currentProcess.startTime}s</span>
            </div>
          )}
        </div>
        <div className="gantt-timeline">
          {Array.from({ length: time + 2 }).map((_, i) => (
            <div key={i} className="gantt-tick">
              {i}
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
              <span>Quantum Used: {currentProcess.quantumUsed}/{timeQuantum}s</span>
            </div>
          ) : (
            <div className="cpu-idle">
              {readyQueue.length > 0 ? "Ready to schedule" :
                processes.length > 0 ? "Waiting for arrivals" :
                  "All processes completed"}
            </div>
          )}
        </div>

        <div className="queues">
          <div className="ready-queue">
            <h3>📥 Ready Queue ({readyQueue.length})</h3>
            {readyQueue.map(process => (
              <div key={process.processID} className="process">
                <div><strong>P{process.processID}</strong></div>
                <div>Remaining: {process.remainingTime}s</div>
                <div>Arrived: {process.arrivalTime}s</div>
              </div>
            ))}
          </div>

          <div className="completed-processes">
            <h3>✅ Completed ({completedProcesses.length})</h3>
            {completedProcesses.map(process => (
              <div key={process.processID} className="process completed">
                <div><strong>P{process.processID}</strong></div>
                <div>Turnaround: {process.turnaroundTime}s</div>
                <div>Waiting: {process.waitingTime}s</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {completedProcesses.length > 0 && (

        <div className="results">
          <div className="results-table">
            <h3>Process Results</h3>
            <table>
              <thead>
                <tr>
                  <th>Process</th>
                  <th>Arrival</th>
                  <th>Burst</th>
                  <th>Completion</th>
                  <th>Turnaround</th>
                  <th>Waiting</th>
                </tr>
              </thead>
              <tbody>
                {completedProcesses
                  .sort((a, b) => a.processID - b.processID)
                  .map(process => (
                    <tr key={process.processID}>
                      <td>P{process.processID}</td>
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

          <div className="metrics">
            <h3>Performance Metrics</h3>
            <div className="metrics-grid">
              <div>Average Waiting Time:</div>
              <div>{metrics.avgWaitingTime}s</div>
              <div>Average Turnaround Time:</div>
              <div>{metrics.avgTurnaroundTime}s</div>
              <div>Throughput:</div>
              <div>{metrics.throughput} processes/second</div>
            </div>
          </div>

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