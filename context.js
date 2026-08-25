// EMERGENCE OS — Context Modifier
const modifier = (text) => {
  try {
    EmergenceEngine.init();
    EmergenceEngine.syncSettings();

    const safeText = text || "";
    if (!state.emergence.isCommandTurn) {
      const turn = EmergenceEngine.syncTurnCount(safeText);
      // Do not discover entities from assembled model context: it can contain
      // Story Cards, instructions and older history. Discovery belongs to fresh
      // player Input + visible model Output only.
      EmergenceEngine.runPeriodicMaintenance(turn, safeText);
    }

    // EMERGENCE OS no longer writes state.memory.authorsNote, so a player's own
    // Author's Note remains untouched. It manages only a tagged Front Memory
    // block and preserves anything outside its own delimiters.
    EmergenceEngine.installManagedFrontMemory();
    return { text: safeText };
  } catch (error) {
    return { text };
  }
};
modifier(text);
