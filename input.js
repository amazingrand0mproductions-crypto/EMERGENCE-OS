// EMERGENCE OS — Input Modifier
const modifier = (text) => {
  try {
    EmergenceEngine.init();
    EmergenceEngine.ensureConfigCard();
    EmergenceEngine.syncSettings();

    const safeText = text || "";
    const parsed = EmergenceEngine.parseCommandInput(safeText);

    if (parsed) {
      const result = EmergenceEngine.processCommand(parsed);
      state.emergence.commandOutput = result || "⚙️ EMERGENCE OS command completed.";
      state.emergence.isCommandTurn = true;
      // AI Dungeon currently has no clean 'skip model call but still return Output'
      // path for script commands, so send a neutral system marker rather than
      // letting the model treat /npc, /world, etc. as story dialogue.
      return { text: "\n> [EMERGENCE OS command — return no story continuation]" };
    }

    state.emergence.isCommandTurn = false;
    state.emergence.lastPlayerInput = safeText;

    // Input can be re-run on edits/retries. Score entity evidence only once for
    // the same platform action + same text.
    const stamp = `in:${EmergenceEngine.actionCount()}:${EmergenceEngine.hashText(safeText)}`;
    if (stamp !== state.emergence.lastInputStamp) {
      state.emergence.lastInputStamp = stamp;
      // Entity discovery is independent from HumanAgency. Disabling NPC pushback
      // must never disable the tracker itself.
      EmergenceEngine.discoverLocations(safeText);
      EmergenceEngine.discoverCharacters(safeText);
    }
    return { text: safeText || "\u200B" };
  } catch (error) {
    try { if (typeof EmergenceEngine !== "undefined") EmergenceEngine.reportHookError("Input", error); } catch (_) {}
    return { text: text || "\u200B" };
  }
};
modifier(text);
