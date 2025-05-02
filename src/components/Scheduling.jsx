// src/components/Scheduling.jsx
import { Link } from 'react-router-dom';
import './Scheduling.css';

function Scheduling({ processes }) {
  return (
    <div className="scheduling">
      <h2>Process Scheduling</h2>
      
      <div className="scheduling-visualization">
        {/* We'll implement the visualization here later */}
        <p>Scheduling visualization will appear here</p>
      </div>

      <Link to="/process" className="back-btn">⬅ Back to Process Management</Link>
    </div>
  );
}

export default Scheduling;