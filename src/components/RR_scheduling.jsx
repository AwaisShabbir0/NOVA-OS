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

  useEffect(() => {
    if (location.state?.processes) {
      const initialProcesses = location.state.processes.map(p => ({
        ...p,
        remainingTime: p.burstTime,
        quantumUsed: 0
      }));
      setProcesses(initialProcesses.filter(p => p.arrivalTime > 0));
      setReadyQueue(initialProcesses.filter(p => p.arrivalTime <= 0));
    }
  }, [location.state]);

  const runSimulation = () => {
    setTime(prevTime => {
      const currentTime = prevTime + 1;
      let newProcesses = [...processes];
      let newReadyQueue = [...readyQueue];
      let newCurrentProcess = currentProcess;
      let newCompletedProcesses = [...completedProcesses];
      let newExecutionHistory = [...executionHistory];

      const arrivals = newProcesses.filter(p => p.arrivalTime === currentTime);
      if (arrivals.length > 0) {
        newReadyQueue = [...newReadyQueue, ...arrivals];
        newProcesses = newProcesses.filter(p => !arrivals.includes(p));
      }

      if (newCurrentProcess) {
        const updatedProcess = {
          ...newCurrentProcess,
          remainingTime: newCurrentProcess.remainingTime - 1,
          quantumUsed: newCurrentProcess.quantumUsed + 1
        };
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
        } else if (updatedProcess.quantumUsed >= timeQuantum) {
          newExecutionHistory.push({
            process: updatedProcess,
            start: updatedProcess.startTime || currentTime - updatedProcess.quantumUsed,
            end: currentTime
          });

          newReadyQueue.push({
            ...updatedProcess,
            quantumUsed: 0
          });
          newCurrentProcess = null;
        } else {
          newCurrentProcess = updatedProcess;
        }
      }

      if (!newCurrentProcess && newReadyQueue.length > 0) {
        newCurrentProcess = {
          ...newReadyQueue[0],
          startTime: currentTime,
          quantumUsed: 0
        };
        newReadyQueue = newReadyQueue.slice(1);
      }

      setProcesses(newProcesses);
      setReadyQueue(newReadyQueue);
      setCurrentProcess(newCurrentProcess);
      setCompletedProcesses(newCompletedProcesses);
      setExecutionHistory(newExecutionHistory);

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
    return () => clearTimeout(timerRef.current);
  }, [isRunning, processes, currentProcess, readyQueue]);

  useEffect(() => {
    if (
      !isRunning &&
      currentProcess === null &&
      processes.length === 0 &&
      readyQueue.length === 0 &&
      completedProcesses.length > 0
    ) {
      const totalWaiting = completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
      const totalTurnaround = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
      const lastCompletion = Math.max(...completedProcesses.map(p => p.completionTime));

      setMetrics({
        avgWaitingTime: (totalWaiting / completedProcesses.length).toFixed(2),
        avgTurnaroundTime: (totalTurnaround / completedProcesses.length).toFixed(2),
        throughput: (completedProcesses.length / lastCompletion).toFixed(2)
      });
    }
  }, [completedProcesses, isRunning, processes, readyQueue, currentProcess]);

  const startSimulation = () => {
    if (processes.length > 0 || readyQueue.length > 0) {
      setIsRunning(true);
      setTime(0);
      setCompletedProcesses([]);
      setExecutionHistory([]);
      if (readyQueue.length > 0 && !currentProcess) {
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
      setProcesses(initialProcesses.filter(p => p.arrivalTime > 0));
      setReadyQueue(initialProcesses.filter(p => p.arrivalTime <= 0));
    }
  };

  const handleTimeQuantumChange = (e) => {
    const newQuantum = parseInt(e.target.value);
    if (newQuantum > 0 && !isRunning) {
      setTimeQuantum(newQuantum);
    }
  };

  const getProcessColor = (processID) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
    return colors[processID % colors.length];
  };

  return (
    <div className="scheduling">
      <h2>Round Robin Scheduling</h2>

      <div className="controls">
        <label>
          Time Quantum:
          <input type="number" min="1" value={timeQuantum} onChange={handleTimeQuantumChange} disabled={isRunning} />
        </label>
        <button onClick={startSimulation} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Start'}
        </button>
        <button onClick={resetSimulation}>Reset</button>
        <span>Time: {time}s</span>
      </div>

      <div className="gantt-chart">
        <h3>Gantt Chart</h3>
        <div className="gantt-container">
          {executionHistory.map((item, index) => (
            <div key={index} className="gantt-item" style={{
              width: `${(item.end - item.start) * 30}px`,
              backgroundColor: getProcessColor(item.process.processID)
            }}>
              <span>P{item.process.processID}</span>
              <span>{item.start}s-{item.end}s</span>
            </div>
          ))}
        </div>
      </div>

      {completedProcesses.length > 0 && (
        <>
          <div className="results-table">
            <h3>Final Results</h3>
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
                {completedProcesses.map(p => (
                  <tr key={p.processID}>
                    <td>P{p.processID}</td>
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
            <h3>Metrics</h3>
            <p>Average Waiting Time: {metrics.avgWaitingTime}s</p>
            <p>Average Turnaround Time: {metrics.avgTurnaroundTime}s</p>
            <p>Throughput: {metrics.throughput} processes/sec</p>
          </div>
        </>
      )}

      <Link to="/process" className="back-btn">⬅ Back</Link>
    </div>
  );
}

export default RRScheduling;
