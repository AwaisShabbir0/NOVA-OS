import { Route, Routes } from 'react-router-dom';
import ControlPanel from './components/ControlPanel';
import ProcessManagement from './components/ProcessManagement';
import MemoryManagement from './components/MemoryManagement';
import ContiguousAllocation from './components/ContiguousAllocation';
import FixedSized from './components/FixedSized';
import VariableSized from './components/VariableSized';
import NonContiguousMenu from './components/NonContiguousMenu';
import NonContiguousMemory from './components/NonContiguousMemory';
import FIFOPageReplacement from './components/FIFOPageReplacement';
import LRUPageReplacement from './components/LRUPageReplacement';
import NonContiguousAllocation from './components/NonContiguousAllocation';
import ReplacementAlgorithms from './components/replacementAlgorithms';
import IOManagement from './components/IOManagement';
import OtherOperations from './components/OtherOperations';
// import Configurations from './components/Configurations';
import Scheduling from './components/Scheduling';
import RR_scheduling from './components/RR_scheduling';
import SJF_Scheduling from './components/SJF_Scheduling';
import PriorityScheduling from './components/PriorityScheduling';
import Synchronization from './components/Synchronization';
// import IPC from './components/IPC';
import logo from './assets/novaos_logo.png';

function App() {
  return (
    <div className="app" style={{ backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
        <img
          src={logo}
          alt="NovaOS Logo"
          style={{
            width: '50px',
            height: '50px',
            marginRight: '15px',
            filter: 'drop-shadow(0 0 5px #00f0ff)',
            animation: 'glow 2s infinite alternate'
          }}
        />
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #00f0ff, #0080ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>NovaOS</h1>
      </div>

      {/* Routes */}
      <Routes>
        {/* Core Control */}
        <Route path="/" element={<ControlPanel />} />
        <Route path="/process" element={<ProcessManagement />} />
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/RR_scheduling" element={<RR_scheduling />} />
        <Route path="/SJF_Scheduling" element={<SJF_Scheduling />} />
        <Route path="/PriorityScheduling" element={<PriorityScheduling />} />
        <Route path="/memory" element={<MemoryManagement />} />

        {/* Contiguous Memory */}
        <Route path="/contiguous" element={<ContiguousAllocation />} />
        <Route path="/contiguous/fixed" element={<FixedSized />} />
        <Route path="/contiguous/variable" element={<VariableSized />} />

        {/* Non-Contiguous Memory */}
        <Route path="/noncontiguous" element={<NonContiguousMenu />} />
        <Route path="/paging" element={<NonContiguousMemory />} />
        <Route path="/fifo" element={<FIFOPageReplacement />} />
        <Route path="/lru" element={<LRUPageReplacement />} />
        <Route path="/noncontiguous-allocation" element={<NonContiguousAllocation />} />
        <Route path="/replacement" element={<ReplacementAlgorithms />} />

        {/* Other Ops */}
        <Route path="/io" element={<IOManagement />} />
        <Route path="/other" element={<OtherOperations />} />
        <Route path="/synchronization" element={<Synchronization />} /> 
        {/* <Route path="/ipc" element={<IPC />} /> */}
        {/* <Route path="/config" element={<Configurations />} /> */}
      </Routes>
    </div>
  );
}

export default App;
