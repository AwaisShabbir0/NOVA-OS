import React from 'react';
import { useNavigate } from 'react-router-dom';

const MemoryManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="control-panel">
      <h1>Memory Management</h1>
      <div className="buttons">
        <button 
          className="btn" 
          onClick={() => navigate('/contiguous')}
        >
          Contiguous Allocation
        </button>
        <button 
          className="btn" 
          onClick={() => navigate('/noncontiguous')}
        >
          Non-Contiguous Allocation
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

export default MemoryManagement;