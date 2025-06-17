import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IPC.css'; // You’ll create a CSS file

const IPC = () => {
  const navigate = useNavigate();
  const [messageQueue, setMessageQueue] = useState([]);
  const [sharedMemory, setSharedMemory] = useState('');
  const [rmiResult, setRmiResult] = useState(null);

  // Simulate sending message
  const sendMessage = () => {
    const msg = `Message ${messageQueue.length + 1}`;
    setMessageQueue([...messageQueue, msg]);
  };

  // Simulate reading shared memory
  const updateSharedMemory = () => {
    const value = `Shared Value ${Math.floor(Math.random() * 100)}`;
    setSharedMemory(value);
  };

  // Simulate RMI call
  const invokeRemoteMethod = () => {
    setRmiResult("Remote method 'getTime()' returned: " + new Date().toLocaleTimeString());
  };

  return (
    <div className="ipc-container">
      <h2>📡 Inter-Process Communication</h2>
      <div className="ipc-grid">

        {/* Message Passing */}
        <div className="ipc-box">
          <h3>📤 Message Passing</h3>
          <button className="ipc-btn" onClick={sendMessage}>Send Message</button>
          <ul>
            {messageQueue.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>

        {/* Shared Memory */}
        <div className="ipc-box">
          <h3>🧠 Shared Memory</h3>
          <button className="ipc-btn" onClick={updateSharedMemory}>Update Memory</button>
          <p><strong>Value:</strong> {sharedMemory || "No value yet."}</p>
        </div>

        {/* Simulated Socket Communication */}
        <div className="ipc-box">
          <h3>🔌 Sockets</h3>
          <p>Simulating socket send/receive is not possible in frontend-only, but you can visualize a "send request" here.</p>
          <button className="ipc-btn" onClick={() => alert("Socket Sent!")}>Send Socket Data</button>
        </div>

        {/* Remote Method Invocation */}
        <div className="ipc-box">
          <h3>☁️ RMI</h3>
          <button className="ipc-btn" onClick={invokeRemoteMethod}>Invoke Remote Method</button>
          <p>{rmiResult || "No remote call made."}</p>
        </div>

      </div>

      <button className="back-btn" onClick={() => navigate('/other')}>⬅ Back</button>
    </div>
  );
};

export default IPC;
