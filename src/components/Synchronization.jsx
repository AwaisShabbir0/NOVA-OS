import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Synchronization.css";

function Synchronization() {
  const [processes, setProcesses] = useState([]);
  const [semaphore, setSemaphore] = useState(1);
  const [criticalProcess, setCriticalProcess] = useState(null);
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  // Load from localStorage
  useEffect(() => {
    const storedProcesses = localStorage.getItem("pcbProcesses");
    const savedCritical = localStorage.getItem("criticalProcess");
    const savedQueue = localStorage.getItem("syncQueue");
    const savedSemaphore = localStorage.getItem("semaphore");
    const savedLogs = localStorage.getItem("syncLogs");

    if (storedProcesses) {
      try {
        setProcesses(JSON.parse(storedProcesses));
      } catch {
        setProcesses([]);
      }
    }
    if (savedCritical) setCriticalProcess(JSON.parse(savedCritical));
    if (savedQueue) setQueue(JSON.parse(savedQueue));
    if (savedSemaphore) setSemaphore(parseInt(savedSemaphore));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem("semaphore", semaphore.toString());
  }, [semaphore]);

  useEffect(() => {
    localStorage.setItem("criticalProcess", JSON.stringify(criticalProcess));
  }, [criticalProcess]);

  useEffect(() => {
    localStorage.setItem("syncQueue", JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem("syncLogs", JSON.stringify(logs));
  }, [logs]);

  const updateProcessState = (processID, newState) => {
    setProcesses((prev) => {
      const updated = prev.map((p) =>
        p.processID === processID ? { ...p, currentState: newState } : p
      );
      localStorage.setItem("pcbProcesses", JSON.stringify(updated));
      return updated;
    });
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = `[${timestamp}] ${message}`;
    setLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  const wait = (process) => {
    addLog(`Process ${process.owner} requests access.`);
    if (semaphore === 1) {
      setSemaphore(0);
      setCriticalProcess(process);
      updateProcessState(process.processID, "Running");
      addLog(`✅ ${process.owner} entered critical section.`);
    } else {
      if (!queue.some((p) => p.processID === process.processID)) {
        setQueue((prev) => [...prev, process]);
        updateProcessState(process.processID, "Waiting");
        addLog(`🔒 ${process.owner} added to waiting queue.`);
      }
    }
  };

  const signal = () => {
    if (criticalProcess) {
      addLog(`❌ ${criticalProcess.owner} exits critical section.`);
      updateProcessState(criticalProcess.processID, "Ready");

      if (queue.length > 0) {
        const next = queue[0];
        setQueue((prev) => prev.slice(1));
        setCriticalProcess(next);
        updateProcessState(next.processID, "Running");
        addLog(`✅ ${next.owner} enters from queue.`);
      } else {
        setCriticalProcess(null);
        setSemaphore(1);
        addLog("🟢 Critical section is now free.");
      }
    }
  };

  return (
    <div>
      <div className="sync-container">
        <h2 className="sync-title">🔒 Binary Semaphore Synchronization</h2>

        <div className="sync-mutex">
          <strong>Semaphore:</strong> {semaphore === 1 ? "Available ✅" : "Unavailable 🔒"}
        </div>

        <div className="sync-grid">
          {/* Process List */}
          <div className="sync-section">
            <h3 className="sync-subtitle">Available Processes</h3>
            {processes.length === 0 ? (
              <p>No processes found.</p>
            ) : (
              processes.map((p) => (
                <div key={p.processID} className="sync-process-card">
                  <div>
                    <strong>{p.owner}</strong> (ID: {p.processID})
                  </div>
                  <button
                    className="sync-btn"
                    onClick={() => wait(p)}
                    disabled={
                      criticalProcess?.processID === p.processID ||
                      queue.find((proc) => proc.processID === p.processID)
                    }
                  >
                    Wait (Enter Critical Section)
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Critical Section and Queue */}
          <div className="sync-section">
            <h3 className="sync-subtitle">🔐 Critical Section</h3>
            {criticalProcess ? (
              <div className="sync-critical-box animate-entry">
                <p>
                  <strong>{criticalProcess.owner}</strong> (ID: {criticalProcess.processID}) is in the critical section.
                </p>
                <button className="sync-btn danger" onClick={signal}>
                  Signal (Exit Critical Section)
                </button>
              </div>
            ) : (
              <p>No process is currently in the critical section.</p>
            )}

            <h4 className="sync-subtitle mt-4">📋 Waiting Queue</h4>
            {queue.length === 0 ? (
              <p>Queue is empty.</p>
            ) : (
              <div className="sync-waiting-box">
                <ul>
                  {queue.map((p, index) => (
                    <li key={p.processID}>
                      {index + 1}. <strong>{p.owner}</strong> (ID: {p.processID})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="sync-section">
            <h3 className="sync-subtitle">📜 Operation Log</h3>
            {logs.length === 0 ? (
              <p>No activity yet.</p>
            ) : (
              <ul className="log-list">
                {logs.map((log, idx) => (
                  <li key={idx}>{log}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <button className="back-btn" onClick={() => navigate("/other")}>
        ⬅ Back
      </button>
    </div>
  );
}

export default Synchronization;
