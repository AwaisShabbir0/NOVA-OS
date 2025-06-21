class PCB {
  constructor({
    processID,
    owner,
    priority,
    burstTime,
    arrivalTime,
    processor = 'CPU-0',
    ioRequest = false,
    currentState = 'new',
    ioState = 'Idle',
    memoryRequired // ✅ Now accepts memory in bytes directly from form
  }) {
    this.processID = processID ?? null;
    this.owner = owner;
    this.priority = priority;
    this.burstTime = burstTime;
    this.arrivalTime = arrivalTime;
    this.processor = processor;
    this.ioRequest = ioRequest;
    this.currentState = currentState;
    this.ioState = ioState;
    
    // ✅ Use provided memoryRequired (in BYTES), else default to random value in BYTES
    this.memoryRequired = memoryRequired ?? (Math.floor(Math.random() * (10240 - 512 + 1)) + 512); // between 512B and 10KB
  }

  calculateMemory() {
    // Base 512 + 128 per burst second (in bytes)
    return 512 + (this.burstTime * 128);
  }

  addChild(childPCB) {
    this.children.push(childPCB.processID);
  }

  setMemoryPointer(pointer) {
    this.memoryPointer = pointer;
  }

  updateState(newState) {
    const validStates = ["New", "Ready", "Running", "Waiting", "Suspended", "Terminated"];
    if (validStates.includes(newState)) {
      this.currentState = newState;
    }
  }

  updatePriority(newPriority) {
    this.priority = newPriority;
  }
}

export default PCB;
