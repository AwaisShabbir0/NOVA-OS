import React from 'react';
import { useNavigate } from 'react-router-dom';

const NonContiguousMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="control-panel">
      <h1>Non-Contiguous Memory Management</h1>
      <div className="buttons">
        <button className="btn" onClick={() => navigate('/paging')}>
          Paging
        </button>
        <button className="btn" onClick={() => navigate('/fifo')}>
          FIFO Page Replacement
        </button>
        <button className="btn" onClick={() => navigate('/lru')}>
          LRU Page Replacement
        </button>
        <button className="back-btn" onClick={() => navigate('/memory')}>
          Back
        </button>
      </div>
    </div>
  );
};

export default NonContiguousMenu;
