// src/models/PCB.js

class PCB {
    constructor({
      owner = "system",
      priority = 0,
      parent = null,
      memoryRequired = 0,
      cpuRegisters = {},
      processor = "CPU-1",
      ioState = "Idle",
    } = {}) {
      // Using an incrementing process ID rather than UUID for simplicity
      this.processID = null; // Will set this in ProcessManagement
      this.currentState = "New"; // States like New, Ready, Running, Blocked, etc.
      this.owner = owner;
      this.priority = priority;
      this.parent = parent; // Parent Process ID
      this.children = [];   // List of Child Process IDs
      this.memoryRequired = memoryRequired; // Memory needed by process
      this.memoryPointer = null; // Pointer to allocated memory (can be filled later)
      this.cpuRegisters = cpuRegisters; // Snapshot of CPU registers
      this.processor = processor; // Which processor is running it
      this.ioState = ioState; // I/O related state
    }
  
    addChild(childPCB) {
      this.children.push(childPCB.processID);
    }
  
    setMemoryPointer(pointer) {
      this.memoryPointer = pointer;
    }
  
    updateState(newState) {
      this.currentState = newState;
    }
  
    updatePriority(newPriority) {
      this.priority = newPriority;
    }
  }
  
  export default PCB;
  