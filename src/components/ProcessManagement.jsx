import { useState } from 'react';
import { Link } from 'react-router-dom';
import PCB from '../models/PCB';
import './ProcessManagement.css';

function ProcessManagement() {
  const [processes, setProcesses] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({
    owner: '',
    priority: '',
    memoryRequired: '',
    currentState: 'New',
    processor: 'CPU-0'
  });
  const [selectedProcessID, setSelectedProcessID] = useState(''); // 🆕 for Destroy selection
  const [nextProcessID, setNextProcessID] = useState(1);

  const states = ["New", "Ready", "Running", "Waiting", "Terminated"];
  const processors = ["CPU-0", "CPU-1", "CPU-2", "CPU-3"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDestroyProcess = (e) => {
    e.preventDefault();
    if (selectedProcessID) {
      setProcesses(prev => prev.filter(p => p.processID !== parseInt(selectedProcessID)));
      setSelectedProcessID('');
      setActiveModal(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProcess = new PCB({
      owner: formData.owner,
      priority: parseInt(formData.priority),
      memoryRequired: parseInt(formData.memoryRequired),
      currentState: formData.currentState,
      processor: formData.processor,
    });

    newProcess.processID = nextProcessID;
    setProcesses(prev => [...prev, newProcess]);
    setNextProcessID(prevID => prevID + 1);

    setActiveModal(null);
    setFormData({
      owner: '',
      priority: '',
      memoryRequired: '',
      currentState: 'New',
      processor: 'CPU-0'
    });
  };

  return (
    <div className="process-management">
      <h2>Process Management</h2>

      <div className="buttons">
        <button className="btn" onClick={() => setActiveModal('create')}>Create Process</button>
        <button className="btn" onClick={() => setActiveModal('destroy')}>Destroy Process</button>
        <button className="btn" onClick={() => setActiveModal('suspend')}>Suspend Process</button>
        <button className="btn" onClick={() => setActiveModal('resume')}>Resume Process</button>
        <button className="btn" onClick={() => setActiveModal('block')}>Block Process</button>
        <button className="btn" onClick={() => setActiveModal('wakeup')}>Wakeup Process</button>
        <button className="btn" onClick={() => setActiveModal('dispatch')}>Dispatch Process</button>
        <button className="btn" onClick={() => setActiveModal('changePriority')}>Change Process Priority</button>
        <button className="btn" onClick={() => setActiveModal('communicate')}>Process Communication</button>
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
                  placeholder="Owner Name"
                  value={formData.owner}
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
                  placeholder="Memory Required (MB)"
                  min="512"
                  max="4096"
                  value={formData.memoryRequired}
                  onChange={handleInputChange}
                  required
                />

                <select name="currentState" value={formData.currentState} onChange={handleInputChange}>
                  {states.map(state => <option key={state} value={state}>{state}</option>)}
                </select>

                <select name="processor" value={formData.processor} onChange={handleInputChange}>
                  {processors.map(proc => <option key={proc} value={proc}>{proc}</option>)}
                </select>

                <button className="btn" type="submit">Add Process</button>
              </form>
            )}

            {activeModal === 'destroy' && (
              <form onSubmit={handleDestroyProcess} className="destroy-form">
                <h3>Destroy Process</h3>

                <select
                  value={selectedProcessID}
                  onChange={(e) => setSelectedProcessID(e.target.value)}
                  required
                >
                  <option value="">Select a process</option>
                  {processes.map(process => (
                    <option key={process.processID} value={process.processID}>
                      {`ID: ${process.processID} - ${process.owner}`}
                    </option>
                  ))}
                </select>

                <button className="btn" type="submit">Destroy</button>
              </form>
            )}

            {activeModal !== 'create' && activeModal !== 'destroy' && (
              <div className="coming-soon">
                <h3>{activeModal} - Coming Soon 🚀</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {processes.length > 0 && (
        <div className="process-list">
          <h3>Processes:</h3>
          <table className="process-table">
            <thead>
              <tr>
                <th>Process ID</th>
                <th>State</th>
                <th>Owner</th>
                <th>Priority</th>
                <th>Memory (MB)</th>
                <th>Processor</th>
              </tr>
            </thead>
            <tbody>
              {processes.map(process => (
                <tr key={process.processID}>
                  <td>{process.processID}</td>
                  <td>{process.currentState}</td>
                  <td>{process.owner}</td>
                  <td>{process.priority}</td>
                  <td>{(process.memoryRequired / 1024).toFixed(1)}</td>
                  <td>{process.processor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link to="/" className="back-btn">⬅ Back to Control Panel</Link>
    </div>
  );
}

export default ProcessManagement;
