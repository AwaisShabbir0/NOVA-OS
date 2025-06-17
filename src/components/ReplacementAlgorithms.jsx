import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReplacementAlgorithms = () => {
  const navigate = useNavigate();

  return (
    <div className="control-panel">
      <h1>Page Replacement Algorithms</h1>
      <div className="buttons">
        <button className="btn" onClick={() => navigate('/fifo')}>
          FIFO Page Replacement
        </button>
        <button className="btn" onClick={() => navigate('/lru')}>
          LRU Page Replacement
        </button>
        <button className="back-btn" onClick={() => navigate('/noncontiguous')}>
          Back
        </button>
      </div>
    </div>
  );
};

export default ReplacementAlgorithms;
