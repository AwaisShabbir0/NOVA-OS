
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
        const currentTime = time;

        // Move newly arrived processes to ready queue
        const newlyArrived = processes.filter(p => p.arrivalTime === currentTime);
        if (newlyArrived.length > 0) {
            setReadyQueue(prev => [...prev, ...newlyArrived]);
            setProcesses(prev => prev.filter(p => !newlyArrived.some(n => n.processID === p.processID)));
        }

        let activeQueue = [...readyQueue];
        if (currentProcess) activeQueue.push(currentProcess);

        activeQueue.sort((a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime);
        const nextProcess = activeQueue[0];

        if (nextProcess) {
            if (!currentProcess || nextProcess.processID !== currentProcess.processID) {
                if (currentProcess && currentProcess.remainingTime > 0) {
                    setExecutionHistory(prev => [...prev, {
                        process: currentProcess,
                        start: currentProcess.startTime,
                        end: currentTime
                    }]);
                }

                if (nextProcess.startTime === null) nextProcess.startTime = currentTime;
            }

            const updated = {
                ...nextProcess,
                remainingTime: nextProcess.remainingTime - 1,
                startTime: nextProcess.startTime ?? currentTime
            };

            if (updated.remainingTime <= 0) {
                const completionTime = currentTime + 1;
                const turnaroundTime = completionTime - updated.arrivalTime;
                const waitingTime = turnaroundTime - updated.burstTime;

                setExecutionHistory(prev => [...prev, {
                    process: updated,
                    start: updated.startTime,
                    end: completionTime
                }]);

                // ✅ Forcefully ensure process isn't added twice
                setCompletedProcesses(prev => {
                    const exists = prev.find(p => p.processID === updated.processID);
                    if (!exists) {
                        return [...prev, {
                            ...updated,
                            completionTime,
                            turnaroundTime,
                            waitingTime
                        }];
                    }
                    return prev;
                });

                setReadyQueue(prev => prev.filter(p => p.processID !== updated.processID));
                setCurrentProcess(null);

                // ✅ Final stop condition: check all sources
              
            }

            else {
                setCurrentProcess(updated);
                setReadyQueue(prev => prev.filter(p => p.processID !== nextProcess.processID));
            }
        }

        setTime(prev => prev + 1);

        if (isRunning) {
            timerRef.current = setTimeout(runSimulation, 1000);
        }
    };

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
        if (isRunning) {
            timerRef.current = setTimeout(runSimulation, 1000);
        } else {
            if (timerRef.current) clearTimeout(timerRef.current);
        }
        return () => clearTimeout(timerRef.current);
    }, [isRunning, processes, readyQueue, currentProcess]);

    useEffect(() => {
        if (!isRunning && completedProcesses.length > 0) {
            const totalTurnaround = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
            const totalWaiting = completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
            const avgTurnaroundTime = (totalTurnaround / completedProcesses.length).toFixed(2);
            const avgWaitingTime = (totalWaiting / completedProcesses.length).toFixed(2);
            const throughput = (completedProcesses.length / time).toFixed(2);

            setMetrics({
                avgWaitingTime,
                avgTurnaroundTime,
                throughput
            });
        }
    }, [isRunning, completedProcesses]);


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
    }, [isRunning, processes, readyQueue, completedProcesses, currentProcess, time]);

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
                <button className="btn" onClick={resetSimulation}>
                    Reset
                </button>
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


            <Link to="/process" className="back-btn">⬅ Back to Process Management</Link>
        </div>
    );
}

export default SJFScheduling;
