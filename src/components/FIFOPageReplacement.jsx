import React, { useState } from 'react';

const FIFOPageReplacement = ({ physicalMemory, setPhysicalMemory }) => {
  const [pageRefs, setPageRefs] = useState('');
  const [frameSize] = useState(physicalMemory.length);
  const [frameQueue, setFrameQueue] = useState([]);
  const [hitMissLog, setHitMissLog] = useState([]);
  const [currentFrames, setCurrentFrames] = useState([]);

  const handleSimulate = () => {
    const references = pageRefs
      .split(',')
      .map(ref => ref.trim())
      .filter(ref => ref !== '');

    let queue = [...frameQueue];
    let memory = [...physicalMemory];
    let log = [];
    let framesHistory = [];

    references.forEach((page, step) => {
      const hit = queue.includes(page);
      if (hit) {
        log.push({ page, result: 'HIT' });
      } else {
        log.push({ page, result: 'MISS' });

        if (queue.length < frameSize) {
          queue.push(page);
        } else {
          queue.shift();
          queue.push(page);
        }
      }

      // Build current frame state for each step
      const currentFrameSnapshot = queue.concat(Array(frameSize - queue.length).fill('FREE'));
      framesHistory.push({ step: step + 1, page, result: hit ? 'HIT' : 'MISS', frames: [...currentFrameSnapshot] });
    });

    setHitMissLog(framesHistory);
    setFrameQueue(queue);
    setCurrentFrames(queue.concat(Array(frameSize - queue.length).fill(null)));
    setPhysicalMemory(queue.concat(Array(frameSize - queue.length).fill(null)));
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ color: '#0ff' }}>FIFO Page Replacement</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Enter page references (comma separated)"
          value={pageRefs}
          onChange={(e) => setPageRefs(e.target.value)}
          style={{
            padding: '10px',
            background: '#222',
            color: '#fff',
            border: '1px solid #0ff',
            borderRadius: '5px',
            width: '300px'
          }}
        />
        <button
          onClick={handleSimulate}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(to right, #00f0ff, #0080ff)',
            color: '#fff',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Simulate
        </button>
      </div>

      {hitMissLog.length > 0 && (
        <>
          <h4 style={{ color: '#0ff' }}>Frame History</h4>
          <table style={{ borderCollapse: 'collapse', width: '100%', background: '#1a1a1a', color: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#00f0ff', color: '#000' }}>
                <th>Step</th>
                <th>Page</th>
                <th>Result</th>
                {Array.from({ length: frameSize }).map((_, i) => (
                  <th key={i}>Frame {i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hitMissLog.map(({ step, page, result, frames }, idx) => (
                <tr key={idx}>
                  <td>{step}</td>
                  <td>{page}</td>
                  <td style={{ color: result === 'HIT' ? '#0f0' : '#f00' }}>{result}</td>
                  {frames.map((frame, i) => (
                    <td key={i} style={{ textAlign: 'center' }}>
                      {frame}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default FIFOPageReplacement;
