// src/App.jsx
import { Route, Routes, Link } from 'react-router-dom';
import ControlPanel from './components/ControlPanel';
import ProcessManagement from './components/ProcessManagement';
import MemoryManagement from './components/MemoryManagement';
import ContiguousMemory from './components/ContiguousMemory';
import NonContiguousMemory from './components/NonContiguousMemory';
import IOManagement from './components/IOManagement';
import OtherOperations from './components/OtherOperations';
import Configurations from './components/Configurations';
import Scheduling from './components/Scheduling';
import logo from './assets/novaos_logo.png';
import RR_scheduling from "./components/RR_scheduling"
import SJF_Scheduling from "./components/SJF_Scheduling"
import PriorityScheduling from "./components/PriorityScheduling"

function App() {
  return (
    <div className="app" style={{ backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      {/* Logo and header remains the same */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
        <img src={logo} alt="NovaOS Logo" style={{ width: '50px', height: '50px', marginRight: '15px', filter: 'drop-shadow(0 0 5px #00f0ff)' }} />
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>NovaOS</h1>
      </div>

      {/* Update Routes to include Scheduling */}
      <Routes>
        <Route path="/" element={<ControlPanel />} />
        <Route path="/process" element={<ProcessManagement />} />
        <Route path="/scheduling" element={<Scheduling />} /> {/* Add this route */}
        <Route path="/RR_scheduling" element={<RR_scheduling />} /> {/* Add this route */}
        <Route path="/SJF_Scheduling" element={<SJF_Scheduling />} /> {/* Add this route */}
        <Route path="/memory" element={<MemoryManagement />} />
        <Route path="/contiguous" element={<ContiguousMemory />} />
        <Route path="/noncontiguous" element={<NonContiguousMemory />} />
        <Route path="/io" element={<IOManagement />} />
        <Route path="/other" element={<OtherOperations />} />
        <Route path="/config" element={<Configurations />} />
        <Route path="/PriorityScheduling" element={<PriorityScheduling />} />
        
      </Routes>
    </div>
  );
}

export default App;