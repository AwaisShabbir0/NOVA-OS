import React, { useEffect, useState } from 'react';
import './IOManagement.css';

const states = ["New", "Ready", "Running", "Waiting", "Ready", "Running", "Terminated"];

const delay = 2500;

const IOManagement = () => {
  const [processes, setProcesses] = useState([]);
  const [currentProcessIndex, setCurrentProcessIndex] = useState(0);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [activeState, setActiveState] = useState(null);
  const [visualQueue, setVisualQueue] = useState([]);
  const [history, setHistory] = useState({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pcbProcesses")) || [];
    setProcesses(saved);
  }, []);

  useEffect(() => {
    if (processes.length === 0 || currentProcessIndex >= processes.length) return;

    const currentProcess = processes[currentProcessIndex];
    const currentState = states[currentStateIndex];

    setActiveState({ ...currentProcess, state: currentState });
    setHistory(prev => ({
      ...prev,
      [currentProcess.processID]: [...(prev[currentProcess.processID] || []), currentState]
    }));

    const timeout = setTimeout(() => {
      let nextIndex = currentStateIndex + 1;

      // Logic correction
      if (currentState === "Running") {
        if (currentProcess.ioRequest && states[nextIndex] === "Waiting") {
          // continue to Waiting
          nextIndex = currentStateIndex + 1;
        } else if (!currentProcess.ioRequest && states[nextIndex] === "Waiting") {
          // skip Waiting and go to Terminated
          nextIndex = states.indexOf("Terminated");
        }
      }

      if (states[nextIndex] === "Terminated") {
        setTimeout(() => {
          setHistory(prev => ({
            ...prev,
            [currentProcess.processID]: [...(prev[currentProcess.processID] || []), "Terminated"]
          }));
          setVisualQueue(prev => [...prev, currentProcess]);
          setCurrentProcessIndex(prev => prev + 1);
          setCurrentStateIndex(0);
        }, delay);
      }
      else {
        setCurrentStateIndex(nextIndex);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentStateIndex, currentProcessIndex, processes]);


  return (
    <div className="io-container">
      <h1 className="io-heading">📊 I/O Management Visualizer</h1>

      {currentProcessIndex < processes.length ? (
        activeState && (
          <div
            key={`${activeState.processID}-${activeState.state}`} // 🔁 change key on each state
            className={`io-card animate state-${activeState.state.toLowerCase()}`}
          >
            <h2>🔁 Process: <span className="highlight">P{activeState.processID}</span></h2>
            <p><strong>Name:</strong> {activeState.owner}</p>
            <p>
              <strong>Current State:</strong> {activeState.state}
              {activeState.state === "Waiting" && activeState.ioRequest && (
                <span> (Waiting due to I/O request)</span>
              )}
            </p>
            <p><strong>I/O Required:</strong> {activeState.ioRequest ? "Yes" : "No"}</p>
          </div>
        )
      ) : (
        <div className="io-card animate state-terminated">
          <h2>🎉 All processes have been executed.</h2>
        </div>
      )}



      <div className="completed-section">
        <h2 className="section-title">✅ Completed Visualizations</h2>
        <div className="completed-list">
          {visualQueue.map((p, i) => (
            <div key={i} className="completed-card">
              <p><strong>Process P{p.processID}</strong> - {p.owner}</p>
              <p className="summary-title">State Journey:</p>
              <ul className="state-list">
                {(history[p.processID] || []).map((s, index) => (
                  <li key={index}>
                    {s}
                    {s === "Waiting" && p.ioRequest && " (I/O occurs)"}
                  </li>

                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {processes.length === 0 && (
        <p className="no-process">⚠ No processes found in local storage.</p>
      )}
    </div>
  );
};

export default IOManagement;
