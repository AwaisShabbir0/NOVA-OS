export const firstFit = (memory, size) => {
  for (let i = 0; i < memory.length; i++) {
    if (!memory[i].allocated && memory[i].size >= size) {
      return splitBlock(memory, i, size);
    }
  }
  return memory;
};

export const bestFit = (memory, size) => {
  let bestIndex = -1;
  let smallestDiff = Infinity;

  for (let i = 0; i < memory.length; i++) {
    if (!memory[i].allocated && memory[i].size >= size) {
      const diff = memory[i].size - size;
      if (diff < smallestDiff) {
        smallestDiff = diff;
        bestIndex = i;
      }
    }
  }

  return bestIndex !== -1 ? splitBlock(memory, bestIndex, size) : memory;
};

export const worstFit = (memory, size) => {
  let worstIndex = -1;
  let largestSize = -Infinity;

  for (let i = 0; i < memory.length; i++) {
    if (!memory[i].allocated && memory[i].size >= size) {
      if (memory[i].size > largestSize) {
        largestSize = memory[i].size;
        worstIndex = i;
      }
    }
  }

  return worstIndex !== -1 ? splitBlock(memory, worstIndex, size) : memory;
};

export const deallocate = (memory, processId) => {
  const updatedMemory = memory.map(block => 
    block.processId === processId ? { ...block, allocated: false, processId: null } : block
  );

  return updatedMemory.reduce((acc, block) => {
    const lastBlock = acc[acc.length - 1];
    if (lastBlock && !lastBlock.allocated && !block.allocated) {
      lastBlock.size += block.size;
    } else {
      acc.push({ ...block });
    }
    return acc;
  }, []);
};

const splitBlock = (memory, index, size) => {
  const newBlocks = [...memory];
  const originalBlock = newBlocks[index];
  
  const allocatedBlock = {
    ...originalBlock,
    size: size,
    allocated: true,
    processId: `P${Date.now()}`
  };
  
  const remaining = originalBlock.size - size;
  if (remaining > 0) {
    newBlocks.splice(index, 1, allocatedBlock, {
      start: originalBlock.start + size,
      size: remaining,
      allocated: false,
      processId: null
    });
  } else {
    newBlocks.splice(index, 1, allocatedBlock);
  }
  
  return newBlocks;
};