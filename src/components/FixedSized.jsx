import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { firstFit, bestFit, worstFit, deallocate } from '../models/contiguous';

const FixedSized = () => {
  const navigate = useNavigate();
  const processSizeRef = useRef();
  const memoryBlockRef = useRef();
  const [algorithm, setAlgorithm] = useState('first-fit');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [memory, setMemory] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [totalMemory, setTotalMemory] = useState(0);

  const handleAddMemoryBlock = () => {
    const blockSize = parseInt(memoryBlockRef.current.value);
    if (
      isNaN(blockSize) ||
      blockSize < 1 ||
      memoryBlockRef.current.value.trim() === ''
    ) {
      alert('Please enter a valid memory block size (positive integer in KB).');
      return;
    }
    if (blockSize > 1024 * 1024) {
      alert('Block size is too large. Please enter a reasonable value (max 1GB).');
      return;
    }

    const newBlock = {
      start: totalMemory,
      size: blockSize,
      allocated: false,
      processId: null,
      color: null
    };

    setMemory([...memory, newBlock]);
    setTotalMemory(totalMemory + blockSize);
    memoryBlockRef.current.value = '';
  };

  const handleAllocate = () => {
    const size = parseInt(processSizeRef.current.value);
    if (
      isNaN(size) ||
      size < 1 ||
      processSizeRef.current.value.trim() === ''
    ) {
      alert('Please enter a valid process size (positive integer in KB).');
      return;
    }
    if (size > totalMemory) {
      alert('Process size cannot exceed total memory.');
      return;
    }
    if (processes.length >= memory.length) {
      alert('All memory blocks are currently allocated.');
      return;
    }

    const processId = `P${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let newMemory;

    switch (algorithm) {
      case 'best-fit':
        newMemory = bestFit([...memory], size, processId);
        break;
      case 'worst-fit':
        newMemory = worstFit([...memory], size, processId);
        break;
      default:
        newMemory = firstFit([...memory], size, processId);
    }

    // Check if allocation was successful
    const allocationSuccess = newMemory.some(
      (block, idx) => block.allocated && memory[idx] !== block
    );
    if (allocationSuccess) {
      setMemory(newMemory);
      setProcesses([...processes, processId]);
      processSizeRef.current.value = '';
    } else {
      alert('Memory allocation failed! Not enough space or no suitable block.');
    }
  };

  const handleDeallocate = () => {
    if (!selectedProcess) {
      alert('Please select a process to deallocate.');
      return;
    }
    if (!processes.includes(selectedProcess)) {
      alert('Selected process does not exist.');
      return;
    }

    const newMemory = deallocate([...memory], selectedProcess, false);
    setMemory(newMemory);
    setProcesses(processes.filter(p => p !== selectedProcess));
    setSelectedProcess('');
  };

  return (
    <div className="contiguous-container">
      <h1 className="memory-header">Fixed sized partitioning</h1>

      <div className="controls-panel">
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

      {memory.length > 0 && (
        <>
          <p>Current Strategy: <strong>{algorithm.replace('-', ' ').toUpperCase()}</strong></p>
          <div className="memory-visualization">
            {memory.map((block, index) => (
              <div
                key={index}
                className={`memory-block ${block.allocated ? 'allocated' : 'free-block'}`}
                style={{
                  width: `${(block.size / totalMemory) * 100}%`,
                  backgroundColor: block.allocated ? block.color : '#ccc'
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
        </>
      )}
      <button
        className="action-btn"
        onClick={() => navigate('/contiguous')}
        style={{
          background: 'linear-gradient(135deg, #ff4444, #ff0000)',
          margin: '0 auto',
          display: 'block'
        }}
      >
        Back 
      </button>
    </div>
  );
};

export default FixedSized;
