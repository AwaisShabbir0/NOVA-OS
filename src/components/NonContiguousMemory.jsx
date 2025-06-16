import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NonContiguousMemory = () => {
  const navigate = useNavigate();
  const processIdRef = useRef();
  const memoryReqRef = useRef();
  const pageSizeRef = useRef();
  const totalMemoryRef = useRef();

  const [physicalMemory, setPhysicalMemory] = useState([]);
  const [totalMemoryBytes, setTotalMemoryBytes] = useState(0);
  const [pageSizeBytes, setPageSizeBytes] = useState(0);
  const [memoryInitialized, setMemoryInitialized] = useState(false);

  const [processes, setProcesses] = useState([]);
  const [pageTables, setPageTables] = useState({});
  const [currentFramePage, setCurrentFramePage] = useState(0);

  const initializeMemory = () => {
    const pageSize = parseInt(pageSizeRef.current.value);
    const totalMemory = parseInt(totalMemoryRef.current.value);

    if (isNaN(pageSize) || isNaN(totalMemory) || pageSize <= 0 || totalMemory <= 0) {
      alert('Please enter valid Page Size and Total Memory Size in BYTES');
      return;
    }

    const totalFrames = Math.floor(totalMemory / pageSize);
    setPhysicalMemory(Array(totalFrames).fill(null));
    setPageSizeBytes(pageSize);
    setTotalMemoryBytes(totalMemory);
    setMemoryInitialized(true);
    alert(`Memory Initialized: ${totalFrames} frames`);
  };

  const allocateProcess = () => {
    const processId = processIdRef.current.value;
    const memoryReq = parseInt(memoryReqRef.current.value);

    if (!memoryInitialized) {
      alert('Initialize memory first!');
      return;
    }

    if (!processId || isNaN(memoryReq) || memoryReq <= 0) {
      alert('Please enter valid Process ID and Memory Requirement');
      return;
    }

    const pagesNeeded = Math.ceil(memoryReq / pageSizeBytes);
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
        pageSize: pageSizeBytes,
        processSize: memoryReq,
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

  const calculateBits = (value) => Math.ceil(Math.log2(value));

  return (
    <div className="paging-container">
      <header className="paging-header">
        <h1>Paging Memory Allocation</h1>
        {memoryInitialized && (
          <div className="memory-info">
            <div className="info-item">
              <span className="info-label">Total Memory:</span>
              <span className="info-value">{totalMemoryBytes} Bytes</span>
            </div>
            <div className="info-item">
              <span className="info-label">Page Size:</span>
              <span className="info-value">{pageSizeBytes} Bytes</span>
            </div>
            <div className="info-item">
              <span className="info-label">Frames:</span>
              <span className="info-value">{physicalMemory.length}</span>
            </div>
          </div>
        )}
      </header>

      {!memoryInitialized && (
        <section className="allocation-controls">
          <div className="input-group">
            <input type="number" ref={totalMemoryRef} placeholder="Total Memory (Bytes)" className="form-input" />
            <input type="number" ref={pageSizeRef} placeholder="Page Size (Bytes)" className="form-input" />
            <button className="primary-btn" onClick={initializeMemory}>Initialize Memory</button>
          </div>
        </section>
      )}

      {memoryInitialized && (
        <>
          <section className="allocation-controls">
            <div className="input-group">
              <input type="text" ref={processIdRef} placeholder="Process ID" className="form-input" />
              <input type="number" ref={memoryReqRef} placeholder="Process Size (Bytes)" className="form-input" />
              <button className="primary-btn" onClick={allocateProcess}>Allocate Process</button>
            </div>
          </section>

          <section className="logical-physical-table">
            <h2>Address Bits per Process</h2>
            <table className="info-table">
              <thead>
                <tr>
                  <th>Process ID</th>
                  <th>Logical Address Bits</th>
                  <th>Physical Address Bits</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(pageTables).map(([pid, table]) => (
                  <tr key={pid}>
                    <td>{pid}</td>
                    <td>{calculateBits(table.processSize)}</td>
                    <td>{calculateBits(totalMemoryBytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="frame-section">
            <h2>Physical Memory Frames</h2>
            <div className="frame-navigation">
              <label>Frame Range:</label>
              <select
                className="frame-select"
                value={currentFramePage}
                onChange={(e) => setCurrentFramePage(parseInt(e.target.value))}
              >
                {Array.from({ length: Math.ceil(physicalMemory.length / 16) }, (_, i) => (
                  <option key={i} value={i}>
                    Frames {i * 16} - {(i + 1) * 16 - 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="frame-grid">
              {physicalMemory.slice(currentFramePage * 16, (currentFramePage + 1) * 16).map((frame, index) => {
                const frameNumber = currentFramePage * 16 + index;
                return (
                  <div key={frameNumber} className={`memory-frame ${frame ? 'allocated' : 'free'}`}>
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
            <h2>Page Tables</h2>
            <div className="page-tables-grid">
              {Object.entries(pageTables).map(([pid, table]) => (
                <div key={pid} className="page-table-card">
                  <div className="table-header">
                    <span>{pid}</span>
                    <span>{table.pageSize} Bytes/Page</span>
                    <span>Total Pages: {table.pages.length}</span>
                  </div>
                  <div className="table-container">
                    <div className="table-row header">
                      <div>Page #</div>
                      <div>Frame #</div>
                    </div>
                    {table.pages.map(({ page, frame }) => (
                      <div key={page} className="table-row">
                        <div>{page}</div>
                        <div>{frame}</div>
                      </div>
                    ))}
                  </div>
                  <button className="deallocate-btn" onClick={() => deallocateProcess(pid)}>Deallocate</button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <button className="back-btn" onClick={() => navigate('/memory')}>
        Back to Memory Management
      </button>
    </div>
  );
};

export default NonContiguousMemory;
