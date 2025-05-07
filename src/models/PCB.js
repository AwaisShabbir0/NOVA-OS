class PCB {
  constructor({
    owner = "system",
    priority = 0,
    burstTime = 1,
    arrivalTime = 0,
    processor = "CPU-0",
    ioState = "Idle"
  } = {}) {
    this.processID = null;
    this.currentState = "New";
    this.owner = owner;
    this.priority = priority;
    this.burstTime = burstTime;
    this.arrivalTime = arrivalTime;
    this.memoryRequired = this.calculateMemory();
    this.processor = processor;
    this.ioState = ioState;
    this.children = [];
    this.memoryPointer = null;
    this.cpuRegisters = {};
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