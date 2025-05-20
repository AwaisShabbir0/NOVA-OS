import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { firstFit, bestFit, worstFit, deallocate } from '../models/memory/contiguous';

const ContiguousAllocation = () => {
  const navigate = useNavigate();
  const processSizeRef = useRef();
  const memoryBlockRef = useRef();
  const [algorithm, setAlgorithm] = useState('first-fit');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [memory, setMemory] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [totalMemory, setTotalMemory] = useState(0);

  // Random color generator for blocks
  const getRandomColor = () => {
    return Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  };

  // Add memory blocks manually
  const handleAddMemoryBlock = () => {
    const blockSize = parseInt(memoryBlockRef.current.value);
    if (isNaN(blockSize)) {
      alert('Please enter valid block size in KB');
      return;
    }

    const newBlock = {
      start: totalMemory,
      size: blockSize,
      allocated: false,
      processId: null
    };

    setMemory([...memory, newBlock]);
    setTotalMemory(totalMemory + blockSize);
    memoryBlockRef.current.value = '';
  };

  // Allocate process to memory
  const handleAllocate = () => {
    const size = parseInt(processSizeRef.current.value);
    if (isNaN(size)) {
      alert('Please enter valid process size in KB');
      return;
    }

    let newMemory;
    const processId = `P${Date.now()}`;
    
    switch(algorithm) {
      case 'best-fit':
        newMemory = bestFit([...memory], size, processId);
        break;
      case 'worst-fit':
        newMemory = worstFit([...memory], size, processId);
        break;
      default:
        newMemory = firstFit([...memory], size, processId);
    }

    if (newMemory !== memory) {
      setMemory(newMemory);
      setProcesses([...processes, processId]);
      processSizeRef.current.value = '';
    } else {
      alert('Memory allocation failed! Not enough space.');
    }
  };

  // Deallocate process from memory
  const handleDeallocate = () => {
    if (!selectedProcess) {
      alert('Please select a process to deallocate');
      return;
    }
    
    const newMemory = deallocate([...memory], selectedProcess);
    setMemory(newMemory);
    setProcesses(processes.filter(p => p !== selectedProcess));
    setSelectedProcess('');
  };

  return (
    <div className="contiguous-container">
      <h1 className="memory-header">Contiguous Memory Allocation</h1>

      <div className="controls-panel">
        {/* Memory Block Input */}
        <div className="input-group">
          <input
            type="number"
            ref={memoryBlockRef}
            placeholder="Enter memory block size (KB)"
            className="process-input"
            min="1"
          />
          <button 
            className="action-btn"
            onClick={handleAddMemoryBlock}
            style={{ background: 'linear-gradient(135deg, #00cc00, #009900)' }}
          >
            Add Memory Block
          </button>
        </div>

        {/* Process Allocation Controls (only show if memory exists) */}
        {memory.length > 0 && (
          <>
            <select
              className="algorithm-selector"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option value="first-fit">First Fit</option>
              <option value="best-fit">Best Fit</option>
              <option value="worst-fit">Worst Fit</option>
            </select>

            <div className="input-group">
              <input
                type="number"
                ref={processSizeRef}
                placeholder="Enter process size (KB)"
                className="process-input"
                min="1"
              />
              <button 
                className="action-btn"
                onClick={handleAllocate}
              >
                Allocate Process
              </button>
            </div>

            <div className="input-group">
              <select
                className="process-input"
                value={selectedProcess}
                onChange={(e) => setSelectedProcess(e.target.value)}
              >
                <option value="">Select Process to Deallocate</option>
                {processes.map(pid => (
                  <option key={pid} value={pid}>{pid}</option>
                ))}
              </select>
              <button 
                className="action-btn"
                onClick={handleDeallocate}
                style={{ background: 'linear-gradient(135deg, #ff4444, #ff0000)' }}
              >
                Deallocate
              </button>
            </div>
          </>
        )}
      </div>

      {/* Memory Visualization */}
      {memory.length > 0 && (
        <div className="memory-visualization">
          {memory.map((block, index) => (
            <div
              key={index}
              className={`memory-block ${block.allocated ? 'allocated' : 'free-block'}`}
              style={{ 
                width: `${(block.size / totalMemory) * 100}%`,
                '--block-color': `#${getRandomColor()}`
              }}
            >
              <span className="block-label">
                {block.allocated ? (
                  <>
                    <div>{block.processId}</div>
                    <div>{block.size}KB</div>
                  </>
                ) : (
                  `Free: ${block.size}KB`
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        className="action-btn"
        onClick={() => navigate('/memory')}
        style={{ 
          background: 'linear-gradient(135deg, #ff4444, #ff0000)',
          margin: '0 auto',
          display: 'block'
        }}
      >
        Back to Memory Management
      </button>
    </div>
  );
};

export default ContiguousAllocation;