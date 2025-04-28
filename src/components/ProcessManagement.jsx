import { Link } from 'react-router-dom'

function ProcessManagement() {
  return (
    <div className="process-management">
      <h2>Process Management</h2>
      <div className="buttons">
        <button className="btn">Create Process</button>
        <button className="btn">Destroy Process</button>
        <button className="btn">Suspend Process</button>
        <button className="btn">Resume Process</button>
        <button className="btn">Block Process</button>
        <button className="btn">Wakeup Process</button>
        <button className="btn">Dispatch Process</button>
        <button className="btn">Change Process Priority</button>
        <button className="btn">Process Communication</button>
      </div>
      <Link to="/" className="back-btn">⬅ Back to Control Panel</Link>
    </div>
  )
}

export default ProcessManagement
