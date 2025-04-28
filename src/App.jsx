import { Route, Routes, Link } from 'react-router-dom'
import ControlPanel from './components/ControlPanel'
import ProcessManagement from './components/ProcessManagement'
import MemoryManagement from './components/MemoryManagement'
import IOManagement from './components/IOManagement'
import OtherOperations from './components/OtherOperations'
import Configurations from './components/Configurations'

import logo from './assets/novaos_logo.png' // Import the logo image

function App() {
  return (
    <div className="app" style={{ backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      {/* Logo at the top */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
        <img src={logo} alt="NovaOS Logo" style={{ width: '50px', height: '50px', marginRight: '15px', filter: 'drop-shadow(0 0 5px #00f0ff)' }} />
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>NovaOS</h1>
      </div>

      {/* Main Routes */}
      <Routes>
        <Route path="/" element={<ControlPanel />} />
        <Route path="/process" element={<ProcessManagement />} />
        <Route path="/memory" element={<MemoryManagement />} />
        <Route path="/io" element={<IOManagement />} />
        <Route path="/other" element={<OtherOperations />} />
        <Route path="/config" element={<Configurations />} />
      </Routes>
    </div>
  )
}

export default App
