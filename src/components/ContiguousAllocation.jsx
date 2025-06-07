import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContiguousAllocation = () => {
  const navigate = useNavigate();

  return (
    <div className="control-panel">
      <h1>Contiguous Memory Allocation</h1>
      <div className="buttons">
        <button
          className="btn"
          onClick={() => navigate('/FixedSized')}
        >
          Fixed sized Partitioning
        </button>
        <button
          className="btn"
          onClick={() => navigate('/VariableSized')}
        >
          Variable Sized Partitioning
        </button>

        <button
          className="back-btn"
          onClick={() => navigate('/')}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ContiguousAllocation;