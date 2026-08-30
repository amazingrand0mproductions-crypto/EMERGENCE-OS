// EMERGENCE OS — Context Modifier
const modifier = (text) => {
  try {
    // Command turns do not need the whole story context or periodic maintenance.
    // Keep this path tiny and deterministic so commands remain responsive even
    // in very long adventures with many tracked entities/cards.
    if (state && state.emergence && state.emergence.pendingCommand) {
      return { text: EmergenceEngine.commandContextText() };
    }

    EmergenceEngine.init();
    EmergenceEngine.syncSettings();

    const safeText = text || "";
    const turn = EmergenceEngine.syncTurnCount(safeText);

    // Do not discover entities from assembled model context: it can contain
    // Story Cards, instructions and older history. Discovery belongs to fresh
    // player Input + visible model Output only.
    EmergenceEngine.runPeriodicMaintenance(turn, safeText);

    // EMERGENCE OS leaves the player's Author's Note untouched and manages only
    // its tagged Front Memory block, preserving anything outside the delimiters.
    EmergenceEngine.installManagedFrontMemory();
    return { text: safeText };
  } catch (error) {
    try { if (typeof EmergenceEngine !== "undefined") EmergenceEngine.reportHookError("Context", error); } catch (_) {}
    return { text };
  }
};
modifier(text);
