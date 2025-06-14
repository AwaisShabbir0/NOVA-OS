// src/App.jsx
import { Route, Routes } from 'react-router-dom';
import ControlPanel from './components/ControlPanel';
import ProcessManagement from './components/ProcessManagement';
import MemoryManagement from './components/MemoryManagement';
import FixedSized from './components/FixedSized';
import NonContiguousMemory from './components/NonContiguousMemory';
import IOManagement from './components/IOManagement';
import OtherOperations from './components/OtherOperations';
import Configurations from './components/Configurations';
import Scheduling from './components/Scheduling';
import RR_scheduling from "./components/RR_scheduling";
import ContiguousAllocation from './components/ContiguousAllocation';
import NonContiguousAllocation from './components/NonContiguousAllocation';
import logo from './assets/novaos_logo.png';
<<<<<<< HEAD
import RR_scheduling from "./components/RR_scheduling"
import SJF_Scheduling from "./components/SJF_Scheduling"
import PriorityScheduling from "./components/PriorityScheduling"
import ContiguousAllocation from "./components/ContiguousAllocation"
import VariableSized from "./components/VariableSized"
=======
>>>>>>> 1546fcf387707404fdc234019a761aaff1d3a108

function App() {
  return (
    <div className="app" style={{ backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      {/* Logo and header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
        <img src={logo} alt="NovaOS Logo" style={{ 
          width: '50px', 
          height: '50px', 
          marginRight: '15px', 
          filter: 'drop-shadow(0 0 5px #00f0ff)',
          animation: 'glow 2s infinite alternate' 
        }} />
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #00f0ff, #0080ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>NovaOS</h1>
      </div>

      {/* Updated Routes */}
      <Routes>
        <Route path="/" element={<ControlPanel />} />
        <Route path="/process" element={<ProcessManagement />} />
<<<<<<< HEAD
        <Route path="/scheduling" element={<Scheduling />} /> {/* Add this route */}
        <Route path="/RR_scheduling" element={<RR_scheduling />} /> {/* Add this route */}
        <Route path="/SJF_Scheduling" element={<SJF_Scheduling />} /> {/* Add this route */}
        <Route path="/memory" element={<MemoryManagement />} />
        <Route path="/FixedSized" element={<FixedSized />} />
        <Route path="/contiguous" element={<ContiguousAllocation />} />
        <Route path="/noncontiguous" element={<NonContiguousMemory />} />
=======
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/RR_scheduling" element={<RR_scheduling />} />
        <Route path="/memory" element={<MemoryManagement />} />
        <Route path="/contiguous" element={<ContiguousAllocation />} />
        <Route path='/noncontiguous' element={<NonContiguousAllocation/>} />
>>>>>>> 1546fcf387707404fdc234019a761aaff1d3a108
        <Route path="/io" element={<IOManagement />} />
        <Route path="/other" element={<OtherOperations />} />
        <Route path="/config" element={<Configurations />} />
        <Route path="/PriorityScheduling" element={<PriorityScheduling />} />
        <Route path='/VariableSized' element={<VariableSized />} />

      </Routes>
    </div>
  );
}

export default App;