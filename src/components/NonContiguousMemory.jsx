import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NonContiguousMemory = () => {
  const navigate = useNavigate();
  const pageSizeRef = useRef();
  const totalMemoryRef = useRef();

  const [physicalMemory, setPhysicalMemory] = useState([]);
  const [totalMemoryBytes, setTotalMemoryBytes] = useState(0);
  const [pageSizeBytes, setPageSizeBytes] = useState(0);
  const [memoryInitialized, setMemoryInitialized] = useState(false);
  const [localProcesses, setLocalProcesses] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [pageTables, setPageTables] = useState({});
  const [currentFramePage, setCurrentFramePage] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('pcbProcesses');
    if (stored) {
      const parsed = JSON.parse(stored);
      setLocalProcesses(parsed.map(p => ({
        processID: p.processID,
        owner: p.owner,
        memoryRequired: p.memoryRequired
      })));
    }
  }, []);

  const initializeMemory = () => {
    const pageSize = parseInt(pageSizeRef.current.value);
    const totalMemory = parseInt(totalMemoryRef.current.value);

    if (
      isNaN(pageSize) ||
      isNaN(totalMemory) ||
      pageSize <= 0 ||
      totalMemory <= 0
    ) {
      alert('Please enter valid Page Size and Total Memory Size in BYTES (positive integers).');
      return;
    }
    if (totalMemory < pageSize) {
      alert('Total memory must be greater than or equal to page size.');
      return;
    }
    if (totalMemory % pageSize !== 0) {
      alert('Total memory should be a multiple of page size for clean paging.');
      return;
    }

    const totalFrames = Math.floor(totalMemory / pageSize);
    setPhysicalMemory(Array(totalFrames).fill(null));
    setPageSizeBytes(pageSize);
    setTotalMemoryBytes(totalMemory);
    setMemoryInitialized(true);
    alert(`Memory Initialized: ${totalFrames} frames`);
  };

  const allocateProcess = (processID, processName, memoryRequired) => {
    if (!memoryInitialized) {
      alert('Initialize memory first!');
      return;
    }
    if (
      isNaN(memoryRequired) ||
      memoryRequired <= 0
    ) {
      alert('Process size must be a positive integer.');
      return;
    }
    if (pageTables[processID]) {
      alert('This process is already allocated.');
      return;
    }

    const pagesNeeded = Math.ceil(memoryRequired / pageSizeBytes);
    const availableFrames = physicalMemory.filter(frame => frame === null).length;

    if (availableFrames < pagesNeeded) {
      alert(`Not enough free frames for process ${processID}`);
      return;
    }

    const allocatedFrames = [];
    const newPhysicalMemory = [...physicalMemory];

    for (let i = 0; i < newPhysicalMemory.length && allocatedFrames.length < pagesNeeded; i++) {
      if (newPhysicalMemory[i] === null) {
        newPhysicalMemory[i] = processName;
        allocatedFrames.push(i);
      }
    }

    setPhysicalMemory(newPhysicalMemory);
    setProcesses(prev => [...prev, processID]);
    setPageTables(prev => ({
      ...prev,
      [processID]: {
        pageSize: pageSizeBytes,
        processSize: memoryRequired,
        processName: processName,
        pages: allocatedFrames.map((frame, index) => ({
          page: index,
          frame
        }))
      }
    }));
  };

  const processMap = {};
  localProcesses.forEach(p => {
    processMap[p.processID] = p.owner;
  });

  const deallocateProcess = (processID) => {
    if (!pageTables[processID]) {
      alert('Process is not allocated or already deallocated.');
      return;
    }
    const processName = processMap[processID];

    const newPhysicalMemory = physicalMemory.map(frame =>
      frame === processName ? null : frame
    );

    setPhysicalMemory(newPhysicalMemory);
    setProcesses(prev => prev.filter(p => p !== processID));

    const newPageTables = { ...pageTables };
    delete newPageTables[processID];
    setPageTables(newPageTables);
  };



  const calculateBits = (value) => Math.ceil(Math.log2(value));

  return (
    <div className="paging-container">
      <header className="paging-header">
        <h1>Paging Memory Allocation</h1>
        {memoryInitialized && (
          <div className="memory-info">
            <div className="info-item"><span className="info-label">Total Memory:</span><span className="info-value">{totalMemoryBytes} Bytes</span></div>
            <div className="info-item"><span className="info-label">Page Size:</span><span className="info-value">{pageSizeBytes} Bytes</span></div>
            <div className="info-item"><span className="info-label">Frames:</span><span className="info-value">{physicalMemory.length}</span></div>
          </div>
        )}
      </header>

      {!memoryInitialized && (
        <section className="allocation-controls">
          <div className="input-group">
            <input type="number" ref={totalMemoryRef} placeholder="Total Memory (Bytes)" className="form-input" min="1" />
            <input type="number" ref={pageSizeRef} placeholder="Page Size (Bytes)" className="form-input" min="1" />
            <button className="primary-btn" onClick={initializeMemory}>Initialize Memory</button>
          </div>
        </section>
      )}

      {memoryInitialized && (
        <>
          <section>
            <h2 className="section-title">Processes (From Local Storage)</h2>
            <table className="info-table">
              <thead>
                <tr>
                  <th>Process ID</th>
                  <th>Process Name</th>
                  <th>Size (Bytes)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {localProcesses.map(({ processID, owner, memoryRequired }) => (
                  <tr key={processID}>
                    <td>{processID}</td>
                    <td>{owner}</td>
                    <td>{memoryRequired}</td>
                    <td>
                      <button
                        className="primary-btn"
                        onClick={() => allocateProcess(processID, owner, memoryRequired)}
                        disabled={pageTables[processID]}
                      >
                        {pageTables[processID] ? 'Allocated' : 'Allocate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="logical-physical-table">
            <h2 className="section-title">Address Bits per Process</h2>
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
            <div className="frame-navigation">
              <label className="frame-label">Frame Range:</label>
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
              {physicalMemory
                .slice(currentFramePage * 16, (currentFramePage + 1) * 16)
                .map((frame, index) => {
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
            <h2 className="section-title">Page Tables</h2>
            <div className="page-tables-grid">
              {Object.entries(pageTables).map(([pid, table]) => (
                <div key={pid} className="page-table-card">
                  <div className="table-header">
                    <span className="process-id">{pid} ({table.processName})</span>
                    <span className="page-size">{table.pageSize} Bytes/Page</span>
                    <span className="total-pages">Total Pages: {table.pages.length}</span>
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
