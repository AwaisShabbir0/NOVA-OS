import React, { useState } from 'react';

const LRUPageReplacement = () => {
  const [pageRefs, setPageRefs] = useState('');
  const [frameSize, setFrameSize] = useState(3); // Default frame size
  const [hitMissLog, setHitMissLog] = useState([]);
  const [error, setError] = useState('');

  const handleSimulate = () => {
    setError('');
    if (!pageRefs.trim()) {
      setError('Please enter page references.');
      return;
    }
    if (!frameSize || isNaN(frameSize) || frameSize < 1) {
      setError('Frame size must be a positive integer.');
      return;
    }

    const references = pageRefs
      .split(',')
      .map(ref => ref.trim())
      .filter(ref => ref !== '');

    if (references.length === 0) {
      setError('Please enter at least one page reference.');
      return;
    }
    if (!references.every(ref => /^\d+$/.test(ref))) {
      setError('Page references must be numbers separated by commas.');
      return;
    }

    let memory = [];
    let useHistory = [];
    let log = [];

    references.forEach((page, step) => {
      const isHit = memory.includes(page);

      if (isHit) {
        useHistory = useHistory.filter(p => p !== page);
        useHistory.push(page);
        log.push({
          step: step + 1,
          page,
          result: 'HIT',
          frames: [...memory, ...Array(frameSize - memory.length).fill('FREE')],
        });
      } else {
        if (memory.length < frameSize) {
          memory.push(page);
        } else {
          const lru = useHistory.shift(); // Least recently used
          const replaceIndex = memory.indexOf(lru);
          memory[replaceIndex] = page;
        }
        useHistory.push(page);
        log.push({
          step: step + 1,
          page,
          result: 'MISS',
          frames: [...memory, ...Array(frameSize - memory.length).fill('FREE')],
        });
      }
    });

    setHitMissLog(log);
  };

  const totalHits = hitMissLog.filter(row => row.result === 'HIT').length;
  const totalMisses = hitMissLog.filter(row => row.result === 'MISS').length;
  const total = totalHits + totalMisses;
  const hitRatio = ((totalHits / total) * 100 || 0).toFixed(2);
  const missRatio = ((totalMisses / total) * 100 || 0).toFixed(2);

  return (
    <div className="paging-container">
      <h2 style={{ color: '#00f0ff' }}>LRU Page Replacement Simulation</h2>

      {/* Inputs */}
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter page references (comma separated)"
          value={pageRefs}
          onChange={(e) => setPageRefs(e.target.value)}
          className="form-input"
        />
        <input
          type="number"
          placeholder="Frame size"
          value={frameSize}
          onChange={(e) => setFrameSize(Number(e.target.value))}
          className="form-input"
          min={1}
        />
        <button className="primary-btn" onClick={handleSimulate}>Simulate</button>
      </div>
      {error && (
        <div style={{ color: 'red', margin: '10px 0', fontWeight: 'bold' }}>{error}</div>
      )}

      {hitMissLog.length > 0 && (
        <>
          {/* Frame History */}
          <div className="results-table">
            <h3>Frame History</h3>
            <table>
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Page</th>
                  <th>Result</th>
                  {Array.from({ length: frameSize }).map((_, i) => (
                    <th key={i}>Frame {i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hitMissLog.map(({ step, page, result, frames }) => (
                  <tr key={step}>
                    <td>{step}</td>
                    <td>{page}</td>
                    <td style={{ color: result === 'HIT' ? '#0f0' : '#f00' }}>{result}</td>
                    {Array.from({ length: frameSize }).map((_, i) => (
                      <td key={i}>{frames[i] || 'FREE'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Table */}
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
            <table style={{
              borderCollapse: 'collapse',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              border: '2px solid #00f0ff',
              width: '500px',
              textAlign: 'center',
              fontSize: '16px',
              boxShadow: '0 0 10px #00f0ff',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#00f0ff', color: '#000' }}>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Hits</td>
                  <td>{totalHits}</td>
                </tr>
                <tr>
                  <td>Total Misses</td>
                  <td>{totalMisses}</td>
                </tr>
                <tr>
                  <td>Hit Ratio</td>
                  <td>{hitRatio}%</td>
                </tr>
                <tr>
                  <td>Miss Ratio</td>
                  <td>{missRatio}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default LRUPageReplacement;
