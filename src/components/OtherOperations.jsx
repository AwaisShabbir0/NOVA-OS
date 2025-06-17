import React from "react";
import { useNavigate } from "react-router-dom";

const OtherOperations = () => {
  const navigate = useNavigate();

  return (
    <div className="control-panel">
      <h1>Other Operations</h1>
      <div className="buttons">
        <button className="btn" onClick={() => navigate("/synchronization")}>
          Process Synchronization
        </button>
        <button className="btn" onClick={() => navigate("/ipc")}>
          Inter-Process Communication
        </button>

        <button className="back-btn" onClick={() => navigate("/")}>
          Back
        </button>
      </div>
    </div>
  );
};

export default OtherOperations;
