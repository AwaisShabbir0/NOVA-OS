import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Scheduling.css';

function SJFScheduling() {
  const location = useLocation();
  const [processes, setProcesses] = useState([]);
  
  useEffect(() => {
    if (location.state?.processes) {
      setProcesses(location.state.processes);
    }
  }, [location.state]);

  return (
    <div className="scheduling">
      <h2>Process Scheduling (SJF Preemptive)</h2>
      
      <div className="coming-soon">
        <h3>SJF Preemptive Scheduling - Coming Soon</h3>
        <p>This feature is currently under development.</p>
      </div>

      <Link to="/process" className="back-btn">⬅ Back to Process Management</Link>
    </div>
  );
}

export default SJFScheduling;