import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NonContiguousMemory = () => {
  const navigate = useNavigate();
  const processIdRef = useRef();
  const memoryReqRef = useRef();
  const [pageSize, setPageSize] = useState(16);
  const [physicalMemory, setPhysicalMemory] = useState(Array(256).fill(null)); // ✅ FIXED HERE
  const [processes, setProcesses] = useState([]);
  const [pageTables, setPageTables] = useState({});
  const [currentFramePage, setCurrentFramePage] = useState(0);
  const framesPerPage = 16;

  useEffect(() => {
    const savedPageSize = localStorage.getItem('pageSize');
    if (savedPageSize) setPageSize(parseInt(savedPageSize));
  }, []);

  const allocateProcess = () => {
    const processId = processIdRef.current.value;
    const memoryReq = parseInt(memoryReqRef.current.value);

    if (!processId || isNaN(memoryReq)) {
      alert('Please enter valid Process ID and Memory Requirement');
      return;
    }

    const pagesNeeded = Math.ceil(memoryReq / pageSize);
    const availableFrames = physicalMemory.filter(frame => frame === null).length;

    if (availableFrames < pagesNeeded) {
      alert('Not enough free frames!');
      return;
    }

    const allocatedFrames = [];
    const newPhysicalMemory = [...physicalMemory];
    for (let i = 0; i < newPhysicalMemory.length && allocatedFrames.length < pagesNeeded; i++) {
      if (newPhysicalMemory[i] === null) {
        newPhysicalMemory[i] = processId;
        allocatedFrames.push(i);
      }
    }

    setPhysicalMemory(newPhysicalMemory);
    setProcesses([...processes, processId]);
    setPageTables({
      ...pageTables,
      [processId]: {
        pageSize,
        pages: allocatedFrames.map((frame, index) => ({
          page: index,
          frame
        }))
      }
    });

    processIdRef.current.value = '';
    memoryReqRef.current.value = '';
  };

  const deallocateProcess = (processId) => {
    const newPhysicalMemory = physicalMemory.map(frame =>
      frame === processId ? null : frame
    );

    setPhysicalMemory(newPhysicalMemory);
    setProcesses(processes.filter(p => p !== processId));
    const newPageTables = { ...pageTables };
    delete newPageTables[processId];
    setPageTables(newPageTables);
  };

  return (
    <div className="paging-container">
      <header className="paging-header">
        <h1>Paging Memory Allocation</h1>
        <div className="memory-info">
          <div className="info-item">
            <span className="info-label">Page Size:</span>
            <span className="info-value">{pageSize} KB</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Memory:</span>
            <span className="info-value">{physicalMemory.length * pageSize} KB</span>
          </div>
        </div>
      </header>

      <section className="allocation-controls">
        <div className="input-group">
          <input
            type="text"
            ref={processIdRef}
            placeholder="Process ID"
            className="form-input"
            aria-label="Process ID"
          />
          <input
            type="number"
            ref={memoryReqRef}
            placeholder="Memory Required (KB)"
            className="form-input"
            min="1"
            aria-label="Memory Required"
          />
          <button
            className="primary-btn"
            onClick={allocateProcess}
          >
            Allocate Process
          </button>
        </div>
      </section>

      <section className="frame-section">
        <div className="frame-navigation">
          <label className="frame-label">Frame Range:</label>
          <select
            className="frame-select"
            value={currentFramePage}
            onChange={(e) => setCurrentFramePage(parseInt(e.target.value))}
          >
            {Array.from({ length: 16 }, (_, i) => (
              <option key={i} value={i}>
                Frames {i * 16} - {(i + 1) * 16 - 1}
              </option>
            ))}
          </select>
        </div>

        <div className="frame-grid">
          {physicalMemory
            .slice(currentFramePage * 16, (currentFramePage + 1) * 16)
            .map((frame, index) => {
              const frameNumber = currentFramePage * 16 + index;
              return (
                <div
                  key={frameNumber}
                  className={`memory-frame ${frame ? 'allocated' : 'free'}`}
                  aria-label={`Frame ${frameNumber} - ${frame ? 'Allocated' : 'Free'}`}
                >
                  <div className="frame-number">Frame {frameNumber}</div>
                  <div className="frame-status">
                    {frame || <span className="free-label">FREE</span>}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      <section className="page-tables-section">
        <h2 className="section-title">Page Tables</h2>
        <div className="page-tables-grid">
          {Object.entries(pageTables).map(([pid, table]) => (
            <div key={pid} className="page-table-card">
              <div className="table-header">
                <span className="process-id">{pid}</span>
                <span className="page-size">{table.pageSize} KB Pages</span>
              </div>
              <div className="table-container">
                <div className="table-row header">
                  <div>Page #</div>
                  <div>Frame #</div>
                </div>
                {table.pages.map(({ page, frame }) => (
                  <div key={page} className="table-row">
                    <div className="table-cell">{page}</div>
                    <div className="table-cell">{frame}</div>
                  </div>
                ))}
              </div>
              <button
                className="deallocate-btn"
                onClick={() => deallocateProcess(pid)}
              >
                Deallocate
              </button>
            </div>
          ))}
        </div>
      </section>

      <button
        className="back-btn"
        onClick={() => navigate('/memory')}
        aria-label="Back to Memory Management"
      >
        Back to Memory Management
      </button>
    </div>
  );
};

export default NonContiguousMemory;
