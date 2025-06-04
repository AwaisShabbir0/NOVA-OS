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
    memoryRequired = null
  }) {
    this.processID = processID ?? null; // <-- ✅ This line is needed
    this.owner = owner;
    this.priority = priority;
    this.burstTime = burstTime;
    this.arrivalTime = arrivalTime;
    this.processor = processor;
    this.ioRequest = ioRequest;
    this.currentState = currentState;
    this.ioState = ioState;
    this.memoryRequired = memoryRequired ?? Math.floor(Math.random() * (10 * 1024 - 512 + 1)) + 512; // in KB
  }


  calculateMemory() {
    // Base 512KB + 128KB per second of burst time
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
