
export const firstFit = (memory, size, processId) => {
  for (let i = 0; i < memory.length; i++) {
    if (!memory[i].allocated && memory[i].size >= size) {
      return splitBlock(memory, i, size, processId);
    }
  }
  return memory;
};

export const bestFit = (memory, size, processId) => {
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

  return bestIndex !== -1 ? splitBlock(memory, bestIndex, size, processId) : memory;
};

export const worstFit = (memory, size, processId) => {
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

  return worstIndex !== -1 ? splitBlock(memory, worstIndex, size, processId) : memory;
};

export const deallocate = (memory, processId) => {
  const updatedMemory = memory.map(block => 
    block.processId === processId ? { ...block, allocated: false, processId: null, color: null } : block
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

const splitBlock = (memory, index, size, processId) => {
  const newBlocks = [...memory];
  const originalBlock = newBlocks[index];

  const allocatedBlock = {
    ...originalBlock,
    size: size,
    allocated: true,
    processId,
    color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
  };

  const remaining = originalBlock.size - size;
  if (remaining > 0) {
    newBlocks.splice(index, 1, allocatedBlock, {
      start: originalBlock.start + size,
      size: remaining,
      allocated: false,
      processId: null,
      color: null
    });
  } else {
    newBlocks.splice(index, 1, allocatedBlock);
  }

  return newBlocks;
};
