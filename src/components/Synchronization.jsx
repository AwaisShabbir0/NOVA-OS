import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Synchronization.css";

function Synchronization() {
  const [processes, setProcesses] = useState([]);
  const [mutex, setMutex] = useState(1); // 1 = unlocked, 0 = locked
  const [criticalProcess, setCriticalProcess] = useState(null);
  const [queue, setQueue] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("pcbProcesses");
    if (stored) {
      setProcesses(JSON.parse(stored));
    }
  }, []);

  const enterCriticalSection = (process) => {
    if (mutex === 1) {
      setMutex(0);
      setCriticalProcess(process);
    } else {
      if (!queue.find((p) => p.processID === process.processID)) {
        setQueue((prev) => [...prev, process]);
      }
    }
  };

  const exitCriticalSection = () => {
    if (queue.length > 0) {
      const next = queue[0];
      setQueue((prev) => prev.slice(1));
      setCriticalProcess(next);
    } else {
      setCriticalProcess(null);
      setMutex(1);
    }
  };

  return (
    <div>
      <div className="sync-container">
        <h2 className="sync-title">🔒 Semaphore Synchronization</h2>

        <div className="sync-mutex">
          <strong>Mutex:</strong> {mutex === 1 ? "Unlocked ✅" : "Locked 🔒"}
        </div>

        <div className="sync-grid">
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
                    onClick={() => enterCriticalSection(p)}
                    disabled={
                      criticalProcess?.processID === p.processID ||
                      queue.find((proc) => proc.processID === p.processID)
                    }
                  >
                    Enter Critical Section
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="sync-section">
            <h3 className="sync-subtitle">🔐 Critical Section</h3>
            {criticalProcess ? (
              <div className="sync-critical-box">
                <p>
                  <strong>{criticalProcess.owner}</strong> (ID:{" "}
                  {criticalProcess.processID}) is in the critical section.
                </p>
                <button
                  className="sync-btn danger"
                  onClick={exitCriticalSection}
                >
                  Exit Critical Section
                </button>
              </div>
            ) : (
              <p>No process is currently in the critical section.</p>
            )}

            <h4 className="sync-subtitle mt-4">📋 Waiting Queue</h4>
            {queue.length === 0 ? (
              <p>Queue is empty.</p>
            ) : (
              <ul>
                {queue.map((p, index) => (
                  <li key={p.processID}>
                    {index + 1}. {p.owner} (ID: {p.processID})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <button className="back-btn" onClick={() => navigate('/')}>
          Back
        </button>
    </div>
  );
}

export default Synchronization;
