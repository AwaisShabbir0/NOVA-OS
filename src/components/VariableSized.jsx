import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { firstFit, bestFit, worstFit, deallocate } from '../models/contiguous';

const VariableSized = () => {
  const navigate = useNavigate();
  const memorySizeRef = useRef();
  const processSizeRef = useRef();
  const [algorithm, setAlgorithm] = useState('first-fit');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [memory, setMemory] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [totalMemory, setTotalMemory] = useState(0);

  const initializeMemory = () => {
    const size = parseInt(memorySizeRef.current.value);
    if (isNaN(size) || size <= 0) {
      alert('Please enter a valid memory size in KB');
      return;
    }

    const block = {
      start: 0,
      size: size,
      allocated: false,
      processId: null,
      color: null
    };

    setMemory([block]);
    setTotalMemory(size);
    setProcesses([]);
    memorySizeRef.current.value = '';
  };

  const handleAllocate = () => {
    const size = parseInt(processSizeRef.current.value);
    if (isNaN(size) || size <= 0) {
      alert('Please enter a valid process size in KB');
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

    if (newMemory !== memory) {
      setMemory(newMemory);
      setProcesses([...processes, processId]);
      processSizeRef.current.value = '';
    } else {
      alert('Memory allocation failed! Not enough space.');
    }
  };

  const handleDeallocate = () => {
    if (!selectedProcess) {
      alert('Please select a process to deallocate');
      return;
    }

    const updatedMemory = deallocate([...memory], selectedProcess);
    setMemory(updatedMemory);
    setProcesses(processes.filter(p => p !== selectedProcess));
    setSelectedProcess('');
  };

  return (
    <div className="contiguous-container">
      <h1 className="memory-header">Variable Sized Partitioning</h1>

      <div className="controls-panel">
        <div className="input-group">
          <input
            type="number"
            ref={memorySizeRef}
            placeholder="Enter total memory size (KB)"
            className="process-input"
            min="1"
          />
          <button
            className="action-btn"
            onClick={initializeMemory}
            style={{ background: 'linear-gradient(135deg, #00cc00, #009900)' }}
          >
            Initialize Memory
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
              <button className="action-btn" onClick={handleAllocate}>
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
          margin: '2rem auto 0',
          display: 'block'
        }}
      >
        Back
      </button>
    </div>
  );
};

export default VariableSized;
