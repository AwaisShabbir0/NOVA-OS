import React, { useState } from 'react';

const Configurations = () => {
  const [pageSize, setPageSize] = useState(localStorage.getItem('pageSize') || 4);

  const handleSave = () => {
    localStorage.setItem('pageSize', pageSize);
    alert('Configuration saved!');
  };

  return (
    <div className="config-container">
      <h2>System Configuration</h2>
      <div className="config-item">
        <label>Page Size (KB):</label>
        <input
          type="number"
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
          min="1"
        />
      </div>
      <button onClick={handleSave} className="action-btn">
        Save Configuration
      </button>
    </div>
  );
};

export default Configurations;