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
import SJF_Scheduling from "./components/SJF_Scheduling";
import PriorityScheduling from "./components/PriorityScheduling";
import ContiguousAllocation from './components/ContiguousAllocation';
import NonContiguousAllocation from './components/NonContiguousAllocation';
import VariableSized from "./components/VariableSized";
import logo from './assets/novaos_logo.png';

function App() {
  return (
    <div className="app" style={{ backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
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

      <Routes>
        <Route path="/" element={<ControlPanel />} />
        <Route path="/process" element={<ProcessManagement />} />
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/RR_scheduling" element={<RR_scheduling />} />
        <Route path="/SJF_Scheduling" element={<SJF_Scheduling />} />
        <Route path="/PriorityScheduling" element={<PriorityScheduling />} />
        <Route path="/memory" element={<MemoryManagement />} />
        <Route path="/FixedSized" element={<FixedSized />} />
        <Route path="/VariableSized" element={<VariableSized />} />
        <Route path="/contiguous" element={<ContiguousAllocation />} />
        <Route path="/noncontiguous" element={<NonContiguousMemory />} />
        <Route path="/noncontiguous-allocation" element={<NonContiguousAllocation />} />
        <Route path="/io" element={<IOManagement />} />
        <Route path="/other" element={<OtherOperations />} />
        <Route path="/config" element={<Configurations />} />
      </Routes>
    </div>
  );
}

export default App;
