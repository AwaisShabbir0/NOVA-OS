import { Link } from 'react-router-dom'

function ControlPanel() {
  return (
    <div className="control-panel">
      <h1>Welcome to NovaOS Control Panel</h1>
      <div className="buttons">
        <Link to="/process" className="btn">Process Management</Link>
        <Link to="/memory" className="btn">Memory Management</Link>
        <Link to="/io" className="btn">I/O Management</Link>
        <Link to="/other" className="btn">Other Operations</Link>
        <Link to="/config" className="btn">Configurations</Link>
      </div>
    </div>
  )
}

export default ControlPanel
