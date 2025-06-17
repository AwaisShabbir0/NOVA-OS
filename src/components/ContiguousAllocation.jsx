import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContiguousAllocation = () => {
  const navigate = useNavigate();

  return (
    <div className="control-panel">
      <h1>Contiguous Memory Management</h1>
      <div className="buttons">
        <button className="btn" onClick={() => navigate('/contiguous/fixed')}>
          Fixed Size Partitioning
        </button>
        <button className="btn" onClick={() => navigate('/contiguous/variable')}>
          Variable Size Partitioning
        </button>
        <button className="back-btn" onClick={() => navigate('/memory')}>
          Back
        </button>
      </div>
    </div>
  );
};

export default ContiguousAllocation;
