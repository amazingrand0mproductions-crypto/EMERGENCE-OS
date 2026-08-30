// EMERGENCE OS — Output Modifier
const modifier = (text) => {
  try {
    // Fast-path command consumption before full world normalization. This makes
    // command response time essentially independent of NPC/location count.
    if (state && state.emergence && state.emergence.pendingCommand) {
      const out = EmergenceEngine.consumePendingCommand();
      return { text: out || "\u200B" };
    }

    EmergenceEngine.init();

    let visibleText = text || "";

    // Strip all hidden data blocks before event/entity detection so hidden helper
    // data can never become a fake story event, character, or location.
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

    // Defensive fallback: if the model somehow leaks our command placeholder
    // without a surviving packet, never let it become story/history.
    if (/^\s*\[EOS_COMMAND_PENDING\]\s*$/i.test(visibleText)) {
      visibleText = "⚙️ EMERGENCE OS command transaction expired. Re-enter the command.";
    }

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
