import React, { useState } from 'react';
import config from '../models/Config';
import './ProcessManagement.css';

const MemoryManagement = () => {
  const [processSize, setProcessSize] = useState('');
  const [pages, setPages] = useState([]);
  const [totalMemoryUsed, setTotalMemoryUsed] = useState(0);
  const pageSize = config.pageSize;
  const totalMemory = config.totalMemory;

  const allocateMemory = () => {
    const sizeKB = parseInt(processSize);
    if (isNaN(sizeKB) || sizeKB <= 0) {
      alert("Please enter a valid memory size in KB");
      return;
    }

    const numPages = Math.ceil(sizeKB / pageSize);
    const memoryRequired = numPages * pageSize;

    if (totalMemoryUsed + memoryRequired > totalMemory) {
      alert("Not enough memory to allocate process!");
      return;
    }

    const processID = Math.floor(Math.random() * 10000);
    const newPages = [];

    for (let i = 0; i < numPages; i++) {
      const pageID = Math.floor(Math.random() * 10000);
      newPages.push({ pageID, processID });
    }

    setPages(prev => [...prev, ...newPages]);
    setTotalMemoryUsed(prev => prev + memoryRequired);
    alert(`Allocated ${numPages} pages for process ${processID}`);
    setProcessSize('');
  };

  return (
    <div className="process-management" style={{ color: '#00d4ff', backgroundColor: '#121212', minHeight: '100vh', padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '30px' }}>Memory Management - Paging</h1>
      
      <input
        type="number"
        placeholder="Enter process size in KB"
        value={processSize}
        onChange={(e) => setProcessSize(e.target.value)}
        style={{
          width: '320px',
          padding: '14px 16px',
          fontSize: '16px',
          borderRadius: '12px',
          border: '2px solid #00d4ff',
          backgroundColor: '#2c2c2c',
          color: 'white',
          marginBottom: '25px',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.3s',
          display: 'inline-block',
          textAlign: 'center'
        }}
        onFocus={(e) => (e.target.style.borderColor = '#0077ff')}
        onBlur={(e) => (e.target.style.borderColor = '#00d4ff')}
      />

      <br />

      <button
        className="btn"
        onClick={allocateMemory}
        style={{
          minWidth: '180px',
          padding: '14px 28px',
          fontSize: '16px',
          boxShadow: '0 0 12px rgba(0, 212, 255, 0.7)',
          transition: 'transform 0.2s, box-shadow 0.3s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 0 20px #00d4ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 212, 255, 0.7)';
        }}
      >
        Allocate Memory
      </button>

      <h2 style={{ marginTop: '40px' }}>Page Table</h2>
      <p>Total Memory Used: {totalMemoryUsed} KB / {totalMemory} KB</p>
      <table style={{ borderCollapse: 'collapse', margin: '20px auto', minWidth: '300px', color: 'white', border: '1px solid #00d4ff' }}>
        <thead style={{ backgroundColor: '#0077ff' }}>
          <tr>
            <th style={{ padding: '12px 20px' }}>Page ID</th>
            <th style={{ padding: '12px 20px' }}>Process ID</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '10px 20px', textAlign: 'center' }}>{page.pageID}</td>
              <td style={{ padding: '10px 20px', textAlign: 'center' }}>{page.processID}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemoryManagement;
