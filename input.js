// EMERGENCE OS — Input Modifier
const modifier = (text) => {
  try {
    const safeText = text || "";

    // Every new Input is authoritative. If a previous command never reached
    // Output (timeout, retry, edit, model failure), clear its stale packet before
    // doing anything else so it can never poison later turns.
    if (state && state.emergence && state.emergence.pendingCommand) {
      EmergenceEngine.clearPendingCommand("new-input");
    }

    // Parse the raw/wrapped input before doing normal story maintenance. This
    // keeps commands fast and supports Story, Do, Say and third-person wrappers.
    const parsed = EmergenceEngine.parseCommandInput(safeText);

    EmergenceEngine.init();
    // syncSettings() also creates/upgrades the config card, so there is no need
    // to scan Story Cards twice in the same Input hook.
    EmergenceEngine.syncSettings();

    if (parsed) {
      EmergenceEngine.beginCommand(parsed);
      // AI Dungeon currently errors if onInput returns stop:true. A neutral marker
      // keeps the hook valid; Context replaces the model context with a tiny
      // command-only instruction and Output substitutes the real command result.
      return { text: "\n> [EMERGENCE OS command transaction]" };
    }

    EmergenceEngine.clearPendingCommand("normal-input");
    state.emergence.lastPlayerInput = safeText;

    // Input can be re-run on edits/retries. Score entity evidence only once for
    // the same platform action + same text.
    const stamp = `in:${EmergenceEngine.actionCount()}:${EmergenceEngine.hashText(safeText)}`;
    if (stamp !== state.emergence.lastInputStamp) {
      state.emergence.lastInputStamp = stamp;
      EmergenceEngine.discoverLocations(safeText);
      EmergenceEngine.discoverCharacters(safeText);
    }
    return { text: safeText || "\u200B" };
  } catch (error) {
    try {
      if (typeof EmergenceEngine !== "undefined") {
        EmergenceEngine.reportHookError("Input", error);
        EmergenceEngine.clearPendingCommand("input-error");
      }
    } catch (_) {}
    return { text: text || "\u200B" };
  }
};
modifier(text);
