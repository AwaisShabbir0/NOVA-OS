import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PCB from '../models/PCB';
import './ProcessManagement.css';

function ProcessManagement() {
  const [maxProcesses, setMaxProcesses] = useState(() => {
    const saved = sessionStorage.getItem('maxProcesses');
    return saved ? parseInt(saved) : null;
  });
  const [remaining, setRemaining] = useState(() => {
    const saved = sessionStorage.getItem('remainingProcesses');
    return saved ? parseInt(saved) : null;
  });
  const [initialPrompt, setInitialPrompt] = useState(() => {
    const saved = sessionStorage.getItem('maxProcesses');
    return saved ? false : true;
  });

  // Keep processes in localStorage if you want to persist them, or use sessionStorage for session-only
  const [processes, setProcesses] = useState(() => {
    const saved = localStorage.getItem('pcbProcesses');
    return saved ? JSON.parse(saved).map(data => new PCB(data)) : [];
  });

  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({
    owner: '',
    priority: '',
    burstTime: '',
    arrivalTime: '',
    processor: 'CPU-0',
    ioRequest: false,
    memoryRequired: ''
  });

  const [selectedProcessID, setSelectedProcessID] = useState('');
  const [newPriority, setNewPriority] = useState('');

  const [nextProcessID, setNextProcessID] = useState(() => {
    const saved = localStorage.getItem('pcbProcesses');
    const savedID = localStorage.getItem('nextProcessID');
    const maxID = saved ? JSON.parse(saved).reduce((max, p) => Math.max(max, p.processID), 0) : 0;
    return savedID ? Math.max(parseInt(savedID), maxID + 1) : maxID + 1;
  });

  useEffect(() => {
    localStorage.setItem('pcbProcesses', JSON.stringify(processes));
  }, [processes]);

  useEffect(() => {
    localStorage.setItem('nextProcessID', nextProcessID.toString());
  }, [nextProcessID]);

  const processors = ["CPU-0", "CPU-1", "CPU-2", "CPU-3"];

  const handleInitialLimitSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(e.target.elements.processCount.value);
    if (!isNaN(num) && num > 0) {
      setMaxProcesses(num);
      setRemaining(num);
      setInitialPrompt(false);
      sessionStorage.setItem('maxProcesses', num.toString());
      sessionStorage.setItem('remainingProcesses', num.toString());
    }
  };

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (remaining === 0) {
      alert("You have already created the maximum allowed processes.");
      return;
    }

    const newProcess = new PCB({
      owner: formData.owner,
      priority: parseInt(formData.priority),
      burstTime: parseInt(formData.burstTime),
      arrivalTime: parseInt(formData.arrivalTime),
      processor: formData.processor,
      ioRequest: formData.ioRequest,
      memoryRequired: parseInt(formData.memoryRequired)
    });

    newProcess.processID = nextProcessID;
    setProcesses(prev => [...prev, newProcess]);
    setNextProcessID(prev => prev + 1);
    setRemaining(prev => prev - 1);
    localStorage.setItem('remainingProcesses', (remaining - 1).toString());

    setFormData({
      owner: '',
      priority: '',
      burstTime: '',
      arrivalTime: '',
      processor: 'CPU-0',
      ioRequest: false,
      memoryRequired: ''
    });
    setActiveModal(null);
  };

  const handleDestroyProcess = (e) => {
    e.preventDefault();
    if (selectedProcessID) {
      setProcesses(prev => prev.filter(p => p.processID !== parseInt(selectedProcessID)));
      setSelectedProcessID('');
      setActiveModal(null);
    }
  };

  const handleSuspendProcess = (e) => {
    e.preventDefault();
    if (selectedProcessID) {
      setProcesses(prev => prev.map(p =>
        p.processID === parseInt(selectedProcessID) ? { ...p, currentState: 'Suspended' } : p
      ));
      setSelectedProcessID('');
      setActiveModal(null);
    }
  };

  const handleResumeProcess = (e) => {
    e.preventDefault();
    if (selectedProcessID) {
      setProcesses(prev => prev.map(p =>
        p.processID === parseInt(selectedProcessID) ? { ...p, currentState: 'Ready' } : p
      ));
      setSelectedProcessID('');
      setActiveModal(null);
    }
  };

  const handleBlockProcess = (e) => {
    e.preventDefault();
    if (selectedProcessID) {
      setProcesses(prev => prev.map(p =>
        p.processID === parseInt(selectedProcessID) ? { ...p, currentState: 'Waiting', ioState: 'Blocked' } : p
      ));
      setSelectedProcessID('');
      setActiveModal(null);
    }
  };

  const handleWakeupProcess = (e) => {
    e.preventDefault();
    if (selectedProcessID) {
      setProcesses(prev => prev.map(p =>
        p.processID === parseInt(selectedProcessID) ? { ...p, currentState: 'Ready', ioState: 'Idle' } : p
      ));
      setSelectedProcessID('');
      setActiveModal(null);
    }
  };

  const handleDispatchProcess = (e) => {
    e.preventDefault();
    if (selectedProcessID) {
      setProcesses(prev => prev.map(p =>
        p.processID === parseInt(selectedProcessID)
          ? { ...p, currentState: 'Running' }
          : p.currentState === 'Running'
            ? { ...p, currentState: 'Ready' }
            : p
      ));
      setSelectedProcessID('');
      setActiveModal(null);
    }
  };

  const handleChangePriority = (e) => {
    e.preventDefault();
    if (selectedProcessID && newPriority) {
      setProcesses(prev => prev.map(p =>
        p.processID === parseInt(selectedProcessID)
          ? { ...p, priority: parseInt(newPriority) }
          : p
      ));
      setSelectedProcessID('');
      setNewPriority('');
      setActiveModal(null);
    }
  };

  return (
    <div className="process-management">
      {initialPrompt ? (
        <form onSubmit={handleInitialLimitSubmit} className="initial-limit-form">
          <h2>Enter Number of Processes to Create</h2>
          <input type="number" name="processCount" min="1" required />
          <button className='btn' type="submit">Set Limit</button>
        </form>
      ) : (
        <>
          <h2>Process Management</h2>
          <div className="buttons">
            <button className="btn" onClick={() => setActiveModal('create')}>Create Process ({remaining} left)</button>
            <button className="btn" onClick={() => setActiveModal('destroy')}>Destroy</button>
            <button className="btn" onClick={() => setActiveModal('suspend')}>Suspend</button>
            <button className="btn" onClick={() => setActiveModal('resume')}>Resume</button>
            <button className="btn" onClick={() => setActiveModal('block')}>Block</button>
            <button className="btn" onClick={() => setActiveModal('wakeup')}>Wakeup</button>
            <button className="btn" onClick={() => setActiveModal('dispatch')}>Dispatch</button>
            <button className="btn" onClick={() => setActiveModal('changePriority')}>Change Priority</button>
          </div>
          {activeModal && (
            <div className="modal-overlay">
              <div className="modal">
                <button className="close-btn" onClick={() => setActiveModal(null)}>X</button>

                {activeModal === 'create' && (
                  <form onSubmit={handleSubmit} className="create-form">
                    <h3>Create New Process</h3>
                    <input
                      type="text"
                      name="owner"
                      placeholder="Process Name (e.g.P1)"
                      value={formData.owner}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="number"
                      name="burstTime"
                      placeholder="Burst Time (seconds)"
                      min="1"
                      max="30"
                      value={formData.burstTime}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="number"
                      name="arrivalTime"
                      placeholder="Arrival Time (seconds)"
                      min="0"
                      value={formData.arrivalTime}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="number"
                      name="priority"
                      placeholder="Priority (0-9)"
                      min="0"
                      max="9"
                      value={formData.priority}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="number"
                      name="memoryRequired"
                      placeholder="Process Size (Bytes)"
                      min="1"
                      value={formData.memoryRequired}
                      onChange={handleInputChange}
                      required
                    />
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        name="ioRequest"
                        checked={formData.ioRequest}
                        onChange={handleInputChange}
                        className="styled-checkbox"
                      />
                      Does this process require I/O?
                    </label>

                    <select name="processor" value={formData.processor} onChange={handleInputChange}>
                      {processors.map(proc => <option key={proc} value={proc}>{proc}</option>)}
                    </select>
                    <button className="btn-add" type="submit">Add Process</button>
                  </form>
                )}

                {activeModal === 'destroy' && (
                  <form onSubmit={handleDestroyProcess} className="action-form">
                    <h3>Destroy Process</h3>
                    <select
                      value={selectedProcessID}
                      onChange={(e) => setSelectedProcessID(e.target.value)}
                      required
                    >
                      <option value="">Select a process</option>
                      {processes.map(process => (
                        <option key={process.processID} value={process.processID}>
                          {`ID: ${process.processID} - ${process.owner} (${process.currentState})`}
                        </option>
                      ))}
                    </select>
                    <button className="btn-add" type="submit">Destroy</button>
                  </form>
                )}

                {activeModal === 'suspend' && (
                  <form onSubmit={handleSuspendProcess} className="action-form">
                    <h3>Suspend Process</h3>
                    <select
                      value={selectedProcessID}
                      onChange={(e) => setSelectedProcessID(e.target.value)}
                      required
                    >
                      <option value="">Select a process to suspend</option>
                      {processes
                        .filter(p => p.currentState !== 'Suspended' && p.currentState !== 'Terminated' && p.currentState !== 'Waiting')
                        .map(process => (
                          <option key={process.processID} value={process.processID}>
                            {`ID: ${process.processID} - ${process.owner} (${process.currentState})`}
                          </option>
                        ))}
                    </select>
                    <button className="btn-add" type="submit">Suspend Process</button>
                  </form>
                )}

                {activeModal === 'resume' && (
                  <form onSubmit={handleResumeProcess} className="action-form">
                    <h3>Resume Process</h3>
                    <select
                      value={selectedProcessID}
                      onChange={(e) => setSelectedProcessID(e.target.value)}
                      required
                    >
                      <option value="">Select a suspended process</option>
                      {processes
                        .filter(p => p.currentState === 'Suspended')
                        .map(process => (
                          <option key={process.processID} value={process.processID}>
                            {`ID: ${process.processID} - ${process.owner}`}
                          </option>
                        ))}
                    </select>
                    <button className="btn-add" type="submit">Resume Process</button>
                  </form>
                )}

                {activeModal === 'block' && (
                  <form onSubmit={handleBlockProcess} className="action-form">
                    <h3>Block Process</h3>
                    <select
                      value={selectedProcessID}
                      onChange={(e) => setSelectedProcessID(e.target.value)}
                      required
                    >
                      <option value="">Select a process to block</option>
                      {processes
                        .filter(p => p.currentState === 'Running')
                        .map(process => (
                          <option key={process.processID} value={process.processID}>
                            {`ID: ${process.processID} - ${process.owner} (${process.currentState})`}
                          </option>
                        ))}
                    </select>
                    <button className="btn-add" type="submit">Block Process</button>
                  </form>
                )}

                {activeModal === 'wakeup' && (
                  <form onSubmit={handleWakeupProcess} className="action-form">
                    <h3>Wakeup Process</h3>
                    <select
                      value={selectedProcessID}
                      onChange={(e) => setSelectedProcessID(e.target.value)}
                      required
                    >
                      <option value="">Select a blocked process</option>
                      {processes
                        .filter(p => p.currentState === 'Waiting')
                        .map(process => (
                          <option key={process.processID} value={process.processID}>
                            {`ID: ${process.processID} - ${process.owner}`}
                          </option>
                        ))}
                    </select>
                    <button className="btn-add" type="submit">Wakeup Process</button>
                  </form>
                )}

                {activeModal === 'dispatch' && (
                  <form onSubmit={handleDispatchProcess} className="action-form">
                    <h3>Dispatch Process</h3>
                    <select
                      value={selectedProcessID}
                      onChange={(e) => setSelectedProcessID(e.target.value)}
                      required
                    >
                      <option value="">Select a ready process</option>
                      {processes
                        .filter(p => p.currentState === 'Ready')
                        .map(process => (
                          <option key={process.processID} value={process.processID}>
                            {`ID: ${process.processID} - ${process.owner}`}
                          </option>
                        ))}
                    </select>
                    <button className="btn-add" type="submit">Dispatch Process</button>
                  </form>
                )}

                {activeModal === 'changePriority' && (
                  <form onSubmit={handleChangePriority} className="action-form">
                    <h3>Change Process Priority</h3>
                    <select
                      value={selectedProcessID}
                      onChange={(e) => setSelectedProcessID(e.target.value)}
                      required
                    >
                      <option value="">Select a process</option>
                      {processes.map(process => (
                        <option key={process.processID} value={process.processID}>
                          {`ID: ${process.processID} - ${process.owner} (Current Priority: ${process.priority})`}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="New Priority (0-9)"
                      min="0"
                      max="9"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      required
                    />
                    <button className="btn-add" type="submit">Update Priority</button>
                  </form>
                )}
              </div>
            </div>
          )}

          {processes.length > 0 && (
            <div className="process-list">
              <h3>Processes (PCB)</h3>
              <div className="table-container">
                <table className="process-table">
                  <thead>
                    <tr>
                      <th>Process ID</th>
                      <th>State</th>
                      <th>Owner</th>
                      <th>Priority</th>
                      <th>Arrival</th>
                      <th>Burst</th>
                      <th>Process Size</th>
                      <th>Processor</th>
                      <th>I/O State</th>
                      <th>I/O Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map(process => (
                      <tr key={process.processID}>
                        <td>{process.processID}</td>
                        <td className={`state-${process.currentState?.toLowerCase()}`}>{process.currentState}</td>
                        <td>{process.owner}</td>
                        <td className={`priority-${process.priority}`}>{process.priority}</td>
                        <td>{process.arrivalTime}s</td>
                        <td>{process.burstTime}s</td>
                        <td>{process.memoryRequired} Bytes</td>
                        <td>{process.processor}</td>
                        <td>{process.ioState}</td>
                        <td>{process.ioRequest ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Link to="/scheduling" state={{ processes }} className="btn scheduling-btn">
            FCFS Scheduling
          </Link>
          <Link to="/SJF_Scheduling" state={{ processes }} className="btn scheduling-btn">
            SJF preemptive Scheduling
          </Link>
          <Link to="/RR_scheduling" state={{ processes }} className="btn scheduling-btn">
            Round Robin Scheduling
          </Link>
          <Link to="/PriorityScheduling" state={{ processes }} className="btn scheduling-btn">
            Priority Scheduling
          </Link>
          <Link to="/" className="back-btn">⬅ Back to Control Panel</Link>
        </>
      )}
    </div>
  );
}

export default ProcessManagement;
