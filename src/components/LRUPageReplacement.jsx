import React, { useState } from 'react';

const LRUPageReplacement = ({ physicalMemory, setPhysicalMemory }) => {
  const [referenceString, setReferenceString] = useState('');
  const [frameCount] = useState(physicalMemory.length);
  const [frames, setFrames] = useState(Array(physicalMemory.length).fill(null));
  const [history, setHistory] = useState([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);

  const simulateLRU = () => {
    const refs = referenceString.split(',').map(p => p.trim());
    let memory = [];
    let useHistory = [];

    let hitCount = 0;
    let missCount = 0;
    let frameHistory = [];

    refs.forEach(page => {
      if (memory.includes(page)) {
        // HIT
        hitCount++;
        useHistory = useHistory.filter(p => p !== page);
        useHistory.push(page);
        frameHistory.push({ page, isHit: true, frames: [...memory] });
      } else {
        // MISS
        missCount++;
        if (memory.length < frameCount) {
          memory.push(page);
        } else {
          const lru = useHistory.shift(); // Remove least recently used
          const indexToReplace = memory.indexOf(lru);
          memory[indexToReplace] = page;
        }
        useHistory.push(page);
        frameHistory.push({ page, isHit: false, frames: [...memory] });
      }
    });

    setFrames(memory);
    setHits(hitCount);
    setMisses(missCount);
    setHistory(frameHistory);

    // Update physical memory visually
    const updatedPhysicalMemory = Array(frameCount).fill(null);
    memory.forEach((page, index) => {
      updatedPhysicalMemory[index] = page;
    });
    setPhysicalMemory(updatedPhysicalMemory);
  };

  return (
    <div className="fifo-simulation">
      <h3>LRU Page Replacement</h3>
      <input
        type="text"
        placeholder="Enter page references (comma separated)"
        value={referenceString}
        onChange={(e) => setReferenceString(e.target.value)}
        className="form-input"
      />
      <button className="primary-btn" onClick={simulateLRU}>Simulate</button>

      <div className="result-summary">
        <p><strong>Total Hits:</strong> {hits}</p>
        <p><strong>Total Misses:</strong> {misses}</p>
        <p><strong>Hit Ratio:</strong> {(hits / (hits + misses) || 0).toFixed(2)}</p>
      </div>

      <div className="history-table">
        <h4>Simulation History</h4>
        <table className="info-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Page</th>
              <th>Hit/Miss</th>
              <th>Frames</th>
            </tr>
          </thead>
          <tbody>
            {history.map((step, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{step.page}</td>
                <td style={{ color: step.isHit ? 'lightgreen' : 'tomato' }}>
                  {step.isHit ? 'Hit' : 'Miss'}
                </td>
                <td>{step.frames.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LRUPageReplacement;
