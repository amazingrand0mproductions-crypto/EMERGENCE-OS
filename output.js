// EMERGENCE OS — Output Modifier
const modifier = (text) => {
  try {
    EmergenceEngine.init();

    if (state.emergence.commandOutput) {
      const out = state.emergence.commandOutput;
      state.emergence.commandOutput = null;
      state.emergence.isCommandTurn = false;
      return { text: out || "\u200B" };
    }

    let visibleText = text || "";

    // Strip all hidden data blocks before any event/entity detection so hidden
    // helper data can never become a fake story event, character, or location.
    const profiles = EmergenceEngine.extractAllTags(visibleText, "EOS_PROFILE");
    visibleText = profiles.text;
    profiles.blocks.forEach(block => EmergenceEngine.applyProfileFill(EmergenceEngine.parseTagFields(block)));

    const reflections = EmergenceEngine.extractAllTags(visibleText, "EOS_REFLECTION");
    visibleText = reflections.text;
    visibleText = visibleText.replace(/^\s*\[EOS (?:DATA REQUEST|PRIVATE REFLECTION)[^\n]*\]\s*$/gmi, "").trimEnd();
    reflections.blocks.forEach(block => {
      const data = EmergenceEngine.parseTagFields(block);
      if (data.name && data.text) EmergenceEngine.appendReflection(data.name, data.text);
    });

    if (!visibleText.trim()) visibleText = "\u200B";

    EmergenceEngine.processOutput(visibleText);

    if (!state.emergence.initialized) {
      state.emergence.initialized = true;
      visibleText += "\n\n⚙️ [EMERGENCE OS: Active — type /help]";
    }

    return { text: visibleText };
  } catch (error) {
    try { if (typeof EmergenceEngine !== "undefined") EmergenceEngine.reportHookError("Output", error); } catch (_) {}
    return { text: text && String(text).trim() ? text : "\u200B" };
  }
};
modifier(text);
