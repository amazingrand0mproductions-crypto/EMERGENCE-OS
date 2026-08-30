// EMERGENCE OS — Library
// Independent NPC psychology, relationships, continuity, and living locations.
// Designed for AI Dungeon's Library / Input / Context / Output scripting hooks.

if (typeof state === "undefined") state = {};

class EmergenceEngine {
  // ---------------------------------------------------------------------------
  // CORE / MIGRATION
  // ---------------------------------------------------------------------------
  static init() {
    // Library code is evaluated fresh for each AI Dungeon hook, but many helper
    // methods call init() defensively inside the same hook. Guard repeated work
    // within that sandbox invocation; the flag resets automatically next hook.
    if (this._initDone) return;
    this._initDone = true;

    if (!state.emergence || typeof state.emergence !== "object") state.emergence = {};
    const e = state.emergence;
    const incomingSchemaVersion = Number(e.schemaVersion || 0);

    if (!e.config || typeof e.config !== "object") e.config = {};
    const defaults = {
      Genre: "Auto",
      DialogueStyle: "Natural & Character-Driven",
      NPCBrainSystem: "Enabled",
      HumanAgency: "Enabled",
      AutonomyLevel: "High",
      PsychologicalRealism: "Advanced",
      PhysicalQuirks: "Moderate",
      GrudgeTracking: "Enabled",
      ConsequenceSeverity: "Hardcore",
      LivingWorldEngine: "Enabled",
      ProtagonistInvolvement: "Medium",
      RomanceEngine: "Enabled",
      RomancePacing: "Normal",
      JealousyMechanic: "Enabled",
      WorldTensionEngine: "Dynamic",
      PlayerTrauma: "Enabled",
      LocationCards: "Enabled",
      LocationAutoUpdate: "Enabled",
      InnerSelfSystem: "Enabled",
      ReflectionSystem: "Disabled",
      ReflectionInterval: "8",
      ReflectionChance: "35",
      NpcColorNotes: "Enabled",
      DetectionSensitivity: "Balanced",
      CardRefreshInterval: "5",
      MaxTrackedNPCs: "40",
      MaxTrackedLocations: "30",
      MatureContent: "Enabled",
      GraphicRealism: "Standard",
      SceneContinuity: "Enabled",
      AliasDetection: "Enabled",
      RelationshipNuance: "Enabled",
      MemoryDepth: "Standard",
      PresencePersistence: "2",
      MaxEventLedger: "90",
      StateRepair: "Enabled",
      ContextDetail: "Balanced",
      DebugMode: "Disabled"
    };
    Object.keys(defaults).forEach(k => {
      if (e.config[k] === undefined || e.config[k] === null || e.config[k] === "") e.config[k] = defaults[k];
    });

    // Migrate older EMERGENCE OS values without breaking existing adventures.
    if (e.config.Genre === "Modern" && e.detectedGenre) e.config.Genre = "Auto";
    if (e.config.RomanceEngine === "18+ Unrestricted" || e.config.RomanceEngine === "PG-13") e.config.RomanceEngine = "Enabled";
    if (e.config.MatureContent === "18+ Unrestricted" || e.config.MatureContent === "PG-13") e.config.MatureContent = "Enabled";
    if (e.config.PsychologicalRealism === "Raw Human") e.config.PsychologicalRealism = "Advanced";

    if (!state.world || typeof state.world !== "object") state.world = {};
    if (!state.world.npcs || typeof state.world.npcs !== "object" || Array.isArray(state.world.npcs)) state.world.npcs = {};
    if (!state.world.locations || typeof state.world.locations !== "object" || Array.isArray(state.world.locations)) state.world.locations = {};

    if (!state.playerInner || typeof state.playerInner !== "object") {
      state.playerInner = { stress: 12, composure: 100, condition: "Calm" };
    }
    if (state.playerInner.composure === undefined && state.playerInner.egoReserve !== undefined) {
      state.playerInner.composure = state.playerInner.egoReserve;
    }
    if (state.playerInner.stress === undefined) state.playerInner.stress = 12;
    if (state.playerInner.composure === undefined) state.playerInner.composure = 100;
    if (!state.playerInner.condition) state.playerInner.condition = "Calm";

    if (!e.detectedGenre) e.detectedGenre = "Modern";
    if (!e.genreScores || typeof e.genreScores !== "object") e.genreScores = {};
    if (!e.currentLocation) e.currentLocation = "Unknown Location";
    if (e.worldTension === undefined) e.worldTension = 10;
    if (e.turnCount === undefined) e.turnCount = 0;
    if (!e.lastTurnStamp) e.lastTurnStamp = "";
    if (!e.lastInputStamp) e.lastInputStamp = "";
    if (!e.lastOutputStamp) e.lastOutputStamp = "";
    if (e.lastMaintenanceAction === undefined) e.lastMaintenanceAction = -1;
    if (!e.lastPlayerInput) e.lastPlayerInput = "";
    if (!e.sceneNames) e.sceneNames = [];
    if (!e.nameCandidates || typeof e.nameCandidates !== "object") e.nameCandidates = {};
    if (!e.forgottenNpcs || typeof e.forgottenNpcs !== "object") e.forgottenNpcs = {};
    if (!e.locationCandidates || typeof e.locationCandidates !== "object") e.locationCandidates = {};
    if (!e.cardBindings || typeof e.cardBindings !== "object") e.cardBindings = {};
    if (!e.locationBindings || typeof e.locationBindings !== "object") e.locationBindings = {};
    if (!e.pendingProfileFill || !Array.isArray(e.pendingProfileFill)) e.pendingProfileFill = [];
    if (!e.pendingReflections || !Array.isArray(e.pendingReflections)) e.pendingReflections = [];
    if (!e.pendingNarrativeNudges || !Array.isArray(e.pendingNarrativeNudges)) e.pendingNarrativeNudges = [];
    if (!e.gossipLog || !Array.isArray(e.gossipLog)) e.gossipLog = [];
    if (!e.dirtyNpcs || !Array.isArray(e.dirtyNpcs)) e.dirtyNpcs = [];
    if (!e.dirtyLocations || !Array.isArray(e.dirtyLocations)) e.dirtyLocations = [];
    if (!e.debugLog || !Array.isArray(e.debugLog)) e.debugLog = [];
    if (!e.aliases || typeof e.aliases !== "object" || Array.isArray(e.aliases)) e.aliases = {};
    if (!e.sceneRoster || typeof e.sceneRoster !== "object" || Array.isArray(e.sceneRoster)) e.sceneRoster = {};
    if (!e.eventLedger || !Array.isArray(e.eventLedger)) e.eventLedger = [];
    if (!e.recentEventHashes || typeof e.recentEventHashes !== "object" || Array.isArray(e.recentEventHashes)) e.recentEventHashes = {};
    if (!e.sceneHistory || !Array.isArray(e.sceneHistory)) e.sceneHistory = [];
    if (!e.relationshipHistory || !Array.isArray(e.relationshipHistory)) e.relationshipHistory = [];
    if (!e.runtimeStats || typeof e.runtimeStats !== "object" || Array.isArray(e.runtimeStats)) {
      e.runtimeStats = { repairs: 0, prunedCandidates: 0, prunedEvents: 0, lastRepairTurn: -1, lastSceneTurn: -1 };
    }
    if (!e.schemaVersion || e.schemaVersion < 4) e.schemaVersion = 4;
    if (e.initialized === undefined) e.initialized = false;

    // Command handling used to depend on two loose fields (isCommandTurn +
    // commandOutput). If an Output hook was skipped/timed out, those fields could
    // survive into later turns and poison the command lifecycle. Commands now use
    // a single short-lived transaction packet that is replaced on every Input.
    if (e.commandSequence === undefined) e.commandSequence = 0;
    if (!e.commandStats || typeof e.commandStats !== "object" || Array.isArray(e.commandStats)) {
      e.commandStats = {
        recognized: 0, unknown: 0, consumed: 0, staleClears: 0,
        raw: 0, do: 0, say: 0, thirdPerson: 0, quoted: 0
      };
    }
    if (e.pendingCommand && (typeof e.pendingCommand !== "object" || Array.isArray(e.pendingCommand))) {
      e.pendingCommand = null;
    }
    if (e.isCommandTurn === undefined) e.isCommandTurn = false;
    // Old builds could leave commandOutput behind indefinitely. Never migrate
    // that stale payload into the new transaction system.
    if (e.commandOutput !== undefined) e.commandOutput = null;
    if (!e.pendingCommand) e.isCommandTurn = false;

    // Full object normalization is needed on schema migration and whenever the
    // tracked entity counts change. Older builds normalized every NPC/location in
    // every hook, three times per turn; safe, but increasingly wasteful in long
    // adventures. Periodic StateRepair still catches malformed state.
    const npcCount = Object.keys(state.world.npcs).length;
    const locationCount = Object.keys(state.world.locations).length;
    const needsNormalization =
      incomingSchemaVersion < 4 ||
      e.normalizedNpcCount !== npcCount ||
      e.normalizedLocationCount !== locationCount;

    if (needsNormalization) {
      Object.keys(state.world.npcs).forEach(name => this.normalizeNpc(name));
      Object.keys(state.world.locations).forEach(name => this.normalizeLocation(name));
      e.normalizedNpcCount = Object.keys(state.world.npcs).length;
      e.normalizedLocationCount = Object.keys(state.world.locations).length;
    }
  }

  static normalizeNpc(name) {
    let npc = state.world.npcs[name];
    if (!npc || typeof npc !== "object") npc = state.world.npcs[name] = {};
    if (npc.trust === undefined) npc.trust = 50;
    if (npc.grudge === undefined) npc.grudge = 0;
    if (npc.stress === undefined) npc.stress = 10;
    if (npc.composure === undefined) npc.composure = npc.egoReserve !== undefined ? npc.egoReserve : 100;
    if (npc.attraction === undefined) npc.attraction = 0;
    if (!npc.cognitiveBias) npc.cognitiveBias = "Unclear";
    if (!npc.attachmentStyle) npc.attachmentStyle = "Unclear";
    if (!npc.threatState) npc.threatState = "Composed";
    if (!npc.outerMask) npc.outerMask = "Guarded";
    if (!npc.innerMind) npc.innerMind = "Observing";
    if (!npc.mood) npc.mood = "Neutral";
    if (!npc.hiddenGoal || /^(survive\.?|survive the day)$/i.test(npc.hiddenGoal)) npc.hiddenGoal = "Not established";
    if (!npc.secret || /^(none\.?|betrayed an ally|owes a massive debt|harbors forbidden magic\/tech|lying about identity)$/i.test(npc.secret)) npc.secret = "Not established";
    if (!npc.coreBelief || npc.coreBelief === "Unsure of their place in the world.") npc.coreBelief = "Not established";
    if (!Array.isArray(npc.memories)) npc.memories = [];
    if (!npc.coreMemory) npc.coreMemory = "";
    if (!npc.undercurrents || typeof npc.undercurrents !== "object" || Array.isArray(npc.undercurrents)) npc.undercurrents = {};
    if (!Array.isArray(npc.reflections)) npc.reflections = [];
    if (!npc.lastSeenLocation) npc.lastSeenLocation = "";
    if (npc.lastSeenTurn === undefined) npc.lastSeenTurn = 0;
    if (npc.secureStreak === undefined) npc.secureStreak = 0;
    if (!npc.biasEvidence || typeof npc.biasEvidence !== "object") npc.biasEvidence = {};
    if (!npc.attachmentEvidence || typeof npc.attachmentEvidence !== "object") npc.attachmentEvidence = {};
    if (!npc.lastInteractionType) npc.lastInteractionType = "";
    if (npc.lastInteractionTurn === undefined) npc.lastInteractionTurn = -999;
    if (npc.generatedByEOS === undefined) npc.generatedByEOS = false;
    if (npc.familiarity === undefined) npc.familiarity = Math.max(0, Math.min(100, (npc.memories.length || 0) * 6));
    if (npc.respect === undefined) npc.respect = 50;
    if (npc.fear === undefined) npc.fear = 0;
    if (!Array.isArray(npc.memoryLedger)) npc.memoryLedger = [];
    if (!Array.isArray(npc.commitments)) npc.commitments = [];
    if (!Array.isArray(npc.boundaries)) npc.boundaries = [];
    if (!Array.isArray(npc.aliases)) npc.aliases = [];
    if (npc.firstSeenTurn === undefined) npc.firstSeenTurn = npc.lastSeenTurn || state.emergence.turnCount || 0;
    if (npc.sceneCount === undefined) npc.sceneCount = 0;
    if (npc.mentionCount === undefined) npc.mentionCount = 0;
    if (npc.relationshipTone === undefined) npc.relationshipTone = "Neutral";
    if (npc.lastStateSummary === undefined) npc.lastStateSummary = "";
    delete npc.egoReserve;
    return npc;
  }

  static normalizeLocation(name) {
    let loc = state.world.locations[name];
    if (!loc || typeof loc !== "object") loc = state.world.locations[name] = {};
    if (!loc.condition) loc.condition = "Intact";
    if (!Array.isArray(loc.echoes)) {
      loc.echoes = loc.echo ? [loc.echo] : [];
      delete loc.echo;
    }
    if (loc.lastSeenTurn === undefined) loc.lastSeenTurn = 0;
    if (loc.generatedByEOS === undefined) loc.generatedByEOS = false;
    if (loc.visitCount === undefined) loc.visitCount = 0;
    if (loc.firstSeenTurn === undefined) loc.firstSeenTurn = loc.lastSeenTurn || state.emergence.turnCount || 0;
    if (!Array.isArray(loc.conditionHistory)) loc.conditionHistory = [];
    if (!Array.isArray(loc.tags)) loc.tags = [];
    if (!Array.isArray(loc.recentOccupants)) loc.recentOccupants = [];
    if (loc.lastConditionTurn === undefined) loc.lastConditionTurn = 0;
    return loc;
  }

  // ---------------------------------------------------------------------------
  // UTILITIES
  // ---------------------------------------------------------------------------
  static clamp(value, min = 0, max = 100) {
    const n = Number(value);
    return Math.max(min, Math.min(max, isFinite(n) ? n : min));
  }

  static intConfig(key, fallback, min, max) {
    const n = parseInt(state.emergence.config[key], 10);
    if (!isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  static escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  static cleanName(value) {
    let s = String(value || "").trim();
    s = s.replace(/^["'“”‘’\[\](){}<>]+|["'“”‘’\[\](){}<>.,!?;:]+$/g, "");
    s = s.replace(/\s+/g, " ");
    return s;
  }

  static titleCase(value) {
    return this.cleanName(value).split(/\s+/).map(part => {
      if (!part) return part;
      // Preserve deliberate internal capitals such as McDonald / DeLuca.
      if (/[a-z][A-Z]/.test(part)) return part;
      if (/^[A-Z]{2,3}$/.test(part)) return part;
      return part.split(/(-|’|')/).map(piece => {
        if (piece === "-" || piece === "'" || piece === "’") return piece;
        return piece.charAt(0).toUpperCase() + piece.slice(1).toLowerCase();
      }).join("");
    }).join(" ");
  }

  static excerpt(text, maxLen = 110) {
    const t = String(text || "").replace(/\s+/g, " ").trim();
    if (t.length <= maxLen) return t;
    const cut = t.slice(0, maxLen);
    const space = cut.lastIndexOf(" ");
    return (space > 40 ? cut.slice(0, space) : cut) + "…";
  }

  static hashText(text) {
    const s = String(text || "");
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(36);
  }

  static actionCount() {
    if (typeof info !== "undefined" && info && typeof info.actionCount === "number") return info.actionCount;
    return state.emergence.turnCount || 0;
  }

  static turnStamp(kind, text) {
    let hLen = 0;
    try { hLen = Array.isArray(history) ? history.length : 0; } catch (_) {}
    return `${kind}:${this.actionCount()}:${hLen}:${this.hashText(String(text || "").slice(-1200))}`;
  }

  static syncTurnCount(text) {
    const e = state.emergence;
    const stamp = this.turnStamp("ctx", text);
    if (stamp !== e.lastTurnStamp) {
      e.lastTurnStamp = stamp;
      const platformCount = this.actionCount();
      if (typeof platformCount === "number" && platformCount >= 0) e.turnCount = platformCount;
      else e.turnCount = (e.turnCount || 0) + 1;
    }
    return e.turnCount;
  }

  static updateStat(obj, key, delta, min = 0, max = 100) {
    if (!obj) return 0;
    const before = Number(obj[key]) || 0;
    obj[key] = this.clamp(before + delta, min, max);
    return obj[key] - before;
  }

  static enabled(key) {
    return String(state.emergence.config[key]).toLowerCase() === "enabled";
  }

  static projectUrl() {
    return "https://github.com/amazingrand0mproductions-crypto/EMERGENCE-OS";
  }

  static debug(message) {
    if (!this.enabled("DebugMode")) return;
    const e = state.emergence;
    e.debugLog.push(`[${e.turnCount}] ${message}`);
    while (e.debugLog.length > 20) e.debugLog.shift();
  }

  static reportHookError(hookName, error) {
    const e = state.emergence || (state.emergence = {});
    const msg = error && error.message ? error.message : String(error || "Unknown error");
    e.lastError = {
      hook: String(hookName || "unknown"),
      turn: e.turnCount || this.actionCount(),
      message: this.excerpt(msg, 180)
    };
    if (e.config && String(e.config.DebugMode).toLowerCase() === "enabled") {
      if (!Array.isArray(e.debugLog)) e.debugLog = [];
      e.debugLog.push(`[${e.lastError.turn}] ${e.lastError.hook}: ${e.lastError.message}`);
      while (e.debugLog.length > 20) e.debugLog.shift();
    }
  }

  static addUnique(arr, value, max = 100) {
    if (!Array.isArray(arr)) return;
    if (!arr.includes(value)) arr.push(value);
    while (arr.length > max) arr.shift();
  }

  static markNpcDirty(name) {
    this.addUnique(state.emergence.dirtyNpcs, name, 100);
  }

  static markLocationDirty(name) {
    this.addUnique(state.emergence.dirtyLocations, name, 100);
  }

  // ---------------------------------------------------------------------------
  // STORY CARD COMPATIBILITY LAYER
  // ---------------------------------------------------------------------------
  static cardArray() {
    return typeof storyCards !== "undefined" && Array.isArray(storyCards) ? storyCards : null;
  }

  static cardKeyString(card) {
    if (!card) return "";
    if (Array.isArray(card.keys)) return card.keys.join(",");
    return String(card.keys || "");
  }

  static findCardById(id) {
    const cards = this.cardArray();
    if (!cards || id === undefined || id === null || id === "") return null;
    return cards.find(c => c && String(c.id) === String(id)) || null;
  }

  static findCardByKey(key) {
    const cards = this.cardArray();
    if (!cards) return null;
    const needle = String(key || "").toLowerCase();
    return cards.find(c => c && this.cardKeyString(c).toLowerCase().split(/\s*,\s*/).includes(needle)) || null;
  }

  static findCardByTitle(title) {
    const cards = this.cardArray();
    if (!cards) return null;
    const needle = String(title || "").toLowerCase();
    return cards.find(c => c && String(c.title || c.name || "").toLowerCase() === needle) || null;
  }

  static createStoryCard(keys, entry, type = "Custom", title = "", notes = "") {
    const cards = this.cardArray();
    if (!cards) return null;
    const existing = this.findCardByKey(String(keys).split(",")[0]) || (title ? this.findCardByTitle(title) : null);
    if (existing) return existing;

    const beforeLen = cards.length;
    let result = null;
    let apiAttempted = false;
    let apiFailed = false;

    if (typeof addStoryCard === "function") {
      apiAttempted = true;
      try {
        // Use AI Dungeon's documented three-argument API. It returns the new
        // card index (or false for duplicate keys). Title/Notes are player-side
        // metadata, so we attach those after the new array entry exists.
        result = addStoryCard(keys, entry, type);
      } catch (err) {
        apiFailed = true;
        this.debug(`addStoryCard failed: ${err && err.message ? err.message : err}`);
      }
    }

    let card = null;
    if (cards.length > beforeLen) {
      card = cards[cards.length - 1] || null;
    } else if (typeof result === "number") {
      const candidates = [result, result - 1].filter(i => i >= 0 && i < cards.length);
      for (let i = 0; i < candidates.length; i++) {
        const c = cards[candidates[i]];
        if (c && this.cardKeyString(c).toLowerCase().includes(String(keys).split(",")[0].trim().toLowerCase())) {
          card = c;
          break;
        }
      }
    } else if (result === false) {
      card = this.findCardByKey(String(keys).split(",")[0]) || null;
    }

    if (card) {
      if (title) {
        card.title = title;
        card.name = title;
      }
      if (notes) {
        card.description = notes;
        card.notes = notes;
      }
      return card;
    }

    // Manual fallback only when the official API is unavailable or actually
    // throws. Never push after an apparently successful API call.
    if (!apiAttempted || apiFailed) {
      card = {
        id: `eos-${Date.now ? Date.now() : 0}-${Math.floor(Math.random() * 1000000)}`,
        keys,
        entry,
        type,
        title: title || keys,
        name: title || keys,
        description: notes || "",
        notes: notes || ""
      };
      cards.push(card);
      return card;
    }
    return null;
  }

  static updateCardContent(card, entry, keysOverride = null, typeOverride = null) {
    const cards = this.cardArray();
    if (!card || !cards) return false;
    const index = cards.indexOf(card);
    const keys = keysOverride !== null ? keysOverride : card.keys;
    const type = typeOverride !== null ? typeOverride : card.type;
    const nextEntry = String(entry || "");
    if (index >= 0 && typeof updateStoryCard === "function") {
      try {
        // Current documented API updates keys/entry/type by array index.
        updateStoryCard(index, keys, nextEntry, type);
      } catch (err) {
        this.debug(`updateStoryCard failed; using array mutation fallback: ${err && err.message ? err.message : err}`);
      }
    }
    card.keys = keys;
    card.entry = nextEntry;
    card.type = type;
    return true;
  }

  static cardId(card) {
    if (!card) return "";
    return card.id !== undefined ? String(card.id) : "";
  }

  static bindNpcCard(name, card, generated) {
    if (!card) return;
    state.emergence.cardBindings[name.toLowerCase()] = {
      id: this.cardId(card),
      title: card.title || card.name || name,
      generated: !!generated
    };
  }

  static bindLocationCard(name, card, generated) {
    if (!card) return;
    state.emergence.locationBindings[name.toLowerCase()] = {
      id: this.cardId(card),
      title: card.title || card.name || name,
      generated: !!generated
    };
  }

  static getBoundNpcCard(name) {
    const binding = state.emergence.cardBindings[name.toLowerCase()];
    if (binding) {
      const byId = this.findCardById(binding.id);
      if (byId) return byId;
      const byTitle = this.findCardByTitle(binding.title || name);
      if (byTitle) return byTitle;
    }
    return null;
  }

  static getBoundLocationCard(name) {
    const binding = state.emergence.locationBindings[name.toLowerCase()];
    if (binding) {
      const byId = this.findCardById(binding.id);
      if (byId) return byId;
      const byTitle = this.findCardByTitle(binding.title || name);
      if (byTitle) return byTitle;
    }
    return null;
  }

  static isGeneratedNpcCard(name) {
    const b = state.emergence.cardBindings[name.toLowerCase()];
    return !!(b && b.generated);
  }

  // ---------------------------------------------------------------------------
  // CONFIGURATION
  // ---------------------------------------------------------------------------
  static configEntry() {
    return [
      "[EMERGENCE OS CONFIG]",
      "Genre: Auto",
      "DialogueStyle: Natural & Character-Driven",
      "NPCBrainSystem: Enabled",
      "HumanAgency: Enabled",
      "AutonomyLevel: High",
      "PsychologicalRealism: Advanced",
      "PhysicalQuirks: Moderate",
      "GrudgeTracking: Enabled",
      "ConsequenceSeverity: Hardcore",
      "LivingWorldEngine: Enabled",
      "ProtagonistInvolvement: Medium",
      "RomanceEngine: Enabled",
      "RomancePacing: Normal",
      "JealousyMechanic: Enabled",
      "WorldTensionEngine: Dynamic",
      "PlayerTrauma: Enabled",
      "LocationCards: Enabled",
      "LocationAutoUpdate: Enabled",
      "InnerSelfSystem: Enabled",
      "ReflectionSystem: Disabled",
      "ReflectionInterval: 8",
      "ReflectionChance: 35",
      "NpcColorNotes: Enabled",
      "DetectionSensitivity: Balanced",
      "CardRefreshInterval: 5",
      "MaxTrackedNPCs: 40",
      "MaxTrackedLocations: 30",
      "MatureContent: Enabled",
      "GraphicRealism: Standard",
      "SceneContinuity: Enabled",
      "AliasDetection: Enabled",
      "RelationshipNuance: Enabled",
      "MemoryDepth: Standard",
      "PresencePersistence: 2",
      "MaxEventLedger: 90",
      "StateRepair: Enabled",
      "ContextDetail: Balanced",
      "DebugMode: Disabled"
    ].join("\n");
  }

  static configNotes() {
    return `⚙️ EMERGENCE OS — CONTROL PANEL

GitHub: https://github.com/amazingrand0mproductions-crypto/EMERGENCE-OS

Edit the values in this card's ENTRY. The script reads them automatically. Keep the setting names unchanged.

👥 MANUAL CHARACTERS
Add confirmed names below, one per line. This bypasses auto-detection.
[CHARACTERS]
# Marcus
# Elena
[/CHARACTERS]

🎭 STORY & NPCS
Genre: Auto | Modern | Fantasy | Sci-Fi | Horror | Cyberpunk | Superhero | Western | Noir — Auto detects without overwriting your manual choice.
DialogueStyle: Free text describing the prose/dialogue tone.
NPCBrainSystem: Enabled | Disabled — master switch for NPC psychology and relationship processing.
HumanAgency: Enabled | Disabled — prompts NPCs to keep motives, boundaries and the ability to refuse. It no longer disables NPC detection.
AutonomyLevel: Low | Medium | High | Unchained — strength of pushback when the player coerces or pressures an NPC.
PsychologicalRealism: Standard | Advanced — Advanced adds more motive/subtext guidance. This is a narrative model, not a clinical simulator.
PhysicalQuirks: Off | Moderate | High — frequency of physical micro-tells in narrator guidance.

❤️ RELATIONSHIPS
GrudgeTracking: Enabled | Disabled — persistent trust/grudge changes from targeted interactions.
ConsequenceSeverity: Mild | Moderate | Hardcore — scales betrayal/coercion consequences.
LivingWorldEngine: Enabled | Disabled — NPC↔NPC Undercurrents, reputation spread, coalitions/rivalries.
ProtagonistInvolvement: Low | Medium | High | Always — how much background social information is surfaced to the narrator.
RomanceEngine: Enabled | Disabled — attraction and relationship stages.
RomancePacing: Slow Burn | Normal | Fast — attraction gain speed.
JealousyMechanic: Enabled | Disabled — jealousy only applies to interested NPCs actually present to witness a romantic beat.
InnerSelfSystem: Enabled | Disabled — shows established hidden goal/secret/belief in /npc and managed card state. Unknown facts stay unknown rather than being randomly invented.

🌍 WORLD
WorldTensionEngine: Dynamic | Static | Disabled — Dynamic reacts to danger and decays; Static preserves the current level.
PlayerTrauma: Enabled | Disabled — tracks player stress/composure as a storytelling cue.
LocationCards: Enabled | Disabled — automatically creates managed Location Story Cards for confidently detected places.
LocationAutoUpdate: Enabled | Disabled — updates managed location state when conditions change.

💭 REFLECTIONS
ReflectionSystem: Enabled | Disabled — optional private first-person reflections captured through hidden tags and kept out of normal story prose.
ReflectionInterval: 3–50 turns — minimum gap between attempts.
ReflectionChance: 0–100 — chance when eligible.

🧹 DETECTION & PERFORMANCE
NpcColorNotes: Enabled | Disabled — compact hidden NPC guidance in the script-managed Front Memory block.
DetectionSensitivity: Conservative | Balanced | Aggressive — confidence threshold for auto-discovered NPCs.
CardRefreshInterval: 2–20 — minimum routine interval before dirty managed cards are flushed.
MaxTrackedNPCs: 5–100 — safety cap for automatic NPC discovery; manual /card still works.
MaxTrackedLocations: 5–100 — safety cap for automatic location discovery.
SceneContinuity: Enabled | Disabled — keeps a short location-aware scene roster so quiet NPCs do not vanish between paragraphs and quoted recollections do not become witnesses.
AliasDetection: Enabled | Disabled — learns safe aliases such as first names from confirmed full names when the alias is unambiguous.
RelationshipNuance: Enabled | Disabled — adds apology, gratitude, promise, rescue, rejection, forgiveness, boundary and abandonment events on top of the core trust/grudge engine.
MemoryDepth: Light | Standard | Deep — controls each NPC's structured relationship-memory ledger. Rolling prose memories remain compact.
PresencePersistence: 0–4 — turns a quiet NPC can remain in the same scene without explicit re-mention, unless an exit is detected.
MaxEventLedger: 30–160 — bounded global relationship-event history used for diagnostics and deduplication.
StateRepair: Enabled | Disabled — periodically repairs orphaned references, invalid stats and stale candidates without deleting established user lore.
ContextDetail: Lean | Balanced | Rich — controls how much relationship continuity is packed into the script-managed Front Memory block.
DebugMode: Enabled | Disabled — keeps a small internal diagnostic log shown by /debug.

🎬 CONTENT
MatureContent: Enabled | Disabled — narrative tone hint only; platform/model safety settings still apply.
GraphicRealism: Mild | Standard | Unfiltered — violence-detail preference hint.

⌨️ COMMANDS
/help | /about | /npc NAME | /npcs | /card NAME | /forget NAME | /locations | /loc NAME | /world | /scene | /memory NAME | /romance [NAME] | /undercurrents | /factions | /reputation | /reflections NAME | /settings | /cleanup | /debug

TIP: /help is the fastest reference. Commands are intercepted from story prose, but still pass through AI Dungeon's normal scripting/model pipeline.`;
  }

  static upgradeLegacyConfigCard(card) {
    if (!card) return card;
    const entry = String(card.entry || "");
    if (!entry.includes("[WORLD CONFIG]") || entry.includes("[EMERGENCE OS CONFIG]")) return card;

    const existingLines = entry.split(/\r?\n/);
    const present = {};
    existingLines.forEach(line => {
      const m = line.match(/^([A-Za-z][A-Za-z0-9]+):/);
      if (m) present[m[1]] = true;
    });
    const merged = existingLines.map(line => line.includes("[WORLD CONFIG]") ? "[EMERGENCE OS CONFIG]" : line);
    this.configEntry().split(/\r?\n/).slice(1).forEach(line => {
      const m = line.match(/^([A-Za-z][A-Za-z0-9]+):/);
      if (m && !present[m[1]]) merged.push(line);
    });
    card.entry = merged.join("\n").slice(0, 1950);

    // Preserve manually listed characters from the old notes while replacing the
    // outdated guide with the rebuilt setting documentation. Comment examples
    // are intentionally not migrated as real names.
    const oldNotes = String(card.description || card.notes || "");
    const oldChars = oldNotes.match(/\[CHARACTERS\]([\s\S]*?)(?:\[SETTINGS GUIDE\]|\[\/CHARACTERS\])/i);
    let manual = [];
    if (oldChars) manual = oldChars[1].split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith("#"));
    let notes = this.configNotes();
    if (manual.length) notes = notes.replace(/\[CHARACTERS\][\s\S]*?\[\/CHARACTERS\]/i, `[CHARACTERS]\n${manual.join("\n")}\n[/CHARACTERS]`);
    card.description = notes;
    card.title = "⚙️ EMERGENCE OS — Config";
    card.name = card.title;
    return card;
  }

  static syncConfigCardSchema(card) {
    if (!card) return card;
    const current = String(card.entry || "");
    const present = {};
    current.split(/\r?\n/).forEach(line => {
      const m = line.match(/^([A-Za-z][A-Za-z0-9]+):/);
      if (m) present[m[1]] = true;
    });

    const lines = current ? current.split(/\r?\n/) : ["[EMERGENCE OS CONFIG]"];
    if (!lines.some(line => line.includes("[EMERGENCE OS CONFIG]"))) lines.unshift("[EMERGENCE OS CONFIG]");
    this.configEntry().split(/\r?\n/).slice(1).forEach(line => {
      const m = line.match(/^([A-Za-z][A-Za-z0-9]+):/);
      if (m && !present[m[1]]) lines.push(line);
    });
    card.entry = lines.join("\n").slice(0, 1950);

    // Refresh generated documentation while preserving the user's manual
    // character block. This is important when upgrading an adventure from an
    // older EMERGENCE OS release that did not expose newer controls.
    const oldNotes = String(card.description || card.notes || "");
    const oldChars = oldNotes.match(/\[CHARACTERS\]([\s\S]*?)\[\/CHARACTERS\]/i);
    let manual = [];
    if (oldChars) {
      manual = oldChars[1].split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith("#"));
    }
    let notes = this.configNotes();
    if (manual.length) notes = notes.replace(/\[CHARACTERS\][\s\S]*?\[\/CHARACTERS\]/i, `[CHARACTERS]\n${manual.join("\n")}\n[/CHARACTERS]`);
    card.description = notes;
    card.notes = notes;
    return card;
  }

  static ensureConfigCard() {
    this.init();
    const cards = this.cardArray();
    if (!cards) return null;
    let card = cards.find(c => c && (this.cardKeyString(c).toLowerCase().includes("eos_config") || String(c.entry || "").includes("[EMERGENCE OS CONFIG]") || String(c.entry || "").includes("[WORLD CONFIG]")));
    if (!card) {
      card = this.createStoryCard("eos_config, emergence os config", this.configEntry(), "Custom", "⚙️ EMERGENCE OS — Config", this.configNotes());
    } else {
      card = this.upgradeLegacyConfigCard(card);
    }
    if (card) card = this.syncConfigCardSchema(card);
    if (card) {
      if (!card.description && !card.notes) card.description = this.configNotes();
      if (!card.title) card.title = "⚙️ EMERGENCE OS — Config";
    }
    return card;
  }

  static validateConfig(key, raw) {
    const value = String(raw || "").trim();
    const enums = {
      Genre: ["Auto", "Modern", "Fantasy", "Sci-Fi", "Horror", "Cyberpunk", "Superhero", "Western", "Noir"],
      NPCBrainSystem: ["Enabled", "Disabled"], HumanAgency: ["Enabled", "Disabled"],
      AutonomyLevel: ["Low", "Medium", "High", "Unchained"],
      PsychologicalRealism: ["Standard", "Advanced"], PhysicalQuirks: ["Off", "Moderate", "High"],
      GrudgeTracking: ["Enabled", "Disabled"], ConsequenceSeverity: ["Mild", "Moderate", "Hardcore"],
      LivingWorldEngine: ["Enabled", "Disabled"], ProtagonistInvolvement: ["Low", "Medium", "High", "Always"],
      RomanceEngine: ["Enabled", "Disabled"], RomancePacing: ["Slow Burn", "Normal", "Fast"], JealousyMechanic: ["Enabled", "Disabled"],
      WorldTensionEngine: ["Dynamic", "Static", "Disabled"], PlayerTrauma: ["Enabled", "Disabled"],
      LocationCards: ["Enabled", "Disabled"], LocationAutoUpdate: ["Enabled", "Disabled"], InnerSelfSystem: ["Enabled", "Disabled"],
      ReflectionSystem: ["Enabled", "Disabled"], NpcColorNotes: ["Enabled", "Disabled"], DetectionSensitivity: ["Conservative", "Balanced", "Aggressive"],
      MatureContent: ["Enabled", "Disabled"], GraphicRealism: ["Mild", "Standard", "Unfiltered"],
      SceneContinuity: ["Enabled", "Disabled"], AliasDetection: ["Enabled", "Disabled"], RelationshipNuance: ["Enabled", "Disabled"],
      MemoryDepth: ["Light", "Standard", "Deep"], StateRepair: ["Enabled", "Disabled"], ContextDetail: ["Lean", "Balanced", "Rich"],
      DebugMode: ["Enabled", "Disabled"]
    };
    if (enums[key]) {
      const found = enums[key].find(v => v.toLowerCase() === value.toLowerCase());
      return found || state.emergence.config[key];
    }
    const numeric = {
      ReflectionInterval: [3, 50], ReflectionChance: [0, 100], CardRefreshInterval: [2, 20], MaxTrackedNPCs: [5, 100], MaxTrackedLocations: [5, 100],
      PresencePersistence: [0, 4], MaxEventLedger: [30, 160]
    };
    if (numeric[key]) {
      const n = parseInt(value, 10);
      if (!isFinite(n)) return state.emergence.config[key];
      return String(Math.max(numeric[key][0], Math.min(numeric[key][1], n)));
    }
    if (key === "DialogueStyle") return value.slice(0, 120) || state.emergence.config[key];
    return value;
  }

  static syncSettings() {
    this.init();
    const card = this.ensureConfigCard();
    if (!card) return;
    String(card.entry || "").split(/\r?\n/).forEach(line => {
      const m = line.match(/^([A-Za-z][A-Za-z0-9]+):\s*(.+?)\s*$/);
      if (!m || state.emergence.config[m[1]] === undefined) return;
      state.emergence.config[m[1]] = this.validateConfig(m[1], m[2]);
    });

    const notes = String(card.description || card.notes || "");
    const block = notes.match(/\[CHARACTERS\]([\s\S]*?)\[\/CHARACTERS\]/i);
    if (block) {
      block[1].split(/\r?\n/).forEach(line => {
        const name = this.cleanName(line.replace(/#.*$/, "").trim());
        if (name && this.isPlausiblePersonName(name)) this.initializeNPC(this.titleCase(name), { manual: true });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // ENTITY DETECTION
  // ---------------------------------------------------------------------------
  static personStopwords() {
    if (this._personStopwords) return this._personStopwords;
    const words = (`A An The This That These Those Here There Then Now Later Earlier Suddenly Meanwhile However Therefore Because Before After During While When Where Why How What Who Whom Which Whose
I You He She It We They Me Him Her Us Them My Your His Its Our Their Mine Yours Hers Ours Theirs Myself Yourself Himself Herself Itself Ourselves Yourselves Themselves
Yes No Okay Ok Please Thanks Thank Sorry Hello Hi Hey Goodbye Morning Afternoon Evening Night Today Tomorrow Yesterday Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December
Door Table Chair Bed Wall Floor Ceiling Window Room House Home Street Road Avenue Alley City Town Village Country State World Planet Earth Sun Moon Sky Air Water Fire Wind Rain Snow Storm Shadow Shadows Light Dark Darkness Blood Body Head Face Hand Hands Arm Arms Leg Legs Eyes Eye Hair Voice Sound Silence Time Day Week Month Year
Car Truck Van Bus Train Plane Ship Boat Bike Motorcycle Vehicle Sword Gun Rifle Pistol Knife Weapon Armor Armour Cape Coat Jacket Shirt Dress Suit Uniform Robe Crown Ring Phone Computer Screen Book Books Letter Note Paper Food Drink Coffee Tea Beer Wine Bottle Glass Cup Plate
King Queen Prince Princess Lord Lady Sir Madam Doctor Dr Professor Officer Captain General Sergeant Agent Detective Mayor President Minister Father Mother Mom Mum Dad Brother Sister Son Daughter Uncle Aunt Cousin Friend Stranger Guard Soldier Cop Police Nurse Clerk Waiter Bartender Teacher Student Boss Manager Customer Driver
God Gods Demon Demons Angel Angels Vampire Vampires Werewolf Werewolves Monster Monsters Hero Heroes Villain Villains Magic Power Powers Force Energy AI System Story Narrator Player Character Characters NPC NPCs
Something Someone Somebody Anyone Anybody Everyone Everybody Nobody Nothing Everything Anything One Two Three First Second Last Next Other Another Same New Old Young Man Woman Boy Girl Men Women People Person
And Or But If So As At In Into On Onto Of For From To With Without By Near Beside Behind Under Over Through Across Around Inside Outside Up Down Left Right Back Away Forward
Can Could Would Should Will Shall May Might Must Do Does Did Done Have Has Had Is Are Was Were Be Been Being Get Gets Got Make Makes Made Take Takes Took Come Comes Came Go Goes Went Say Says Said Ask Asks Asked Tell Tells Told Look Looks Looked See Sees Saw Hear Hears Heard Feel Feels Felt Think Thinks Thought Know Knows Knew Want Wants Wanted Need Needs Needed`).split(/\s+/);
    this._personStopwords = {};
    words.filter(Boolean).forEach(w => this._personStopwords[w.toLowerCase()] = true);
    return this._personStopwords;
  }

  static isPlausiblePersonName(name) {
    const n = this.cleanName(name);
    if (!n || n.length < 2 || n.length > 55) return false;
    if (this.isPlayerControlledName(n) || this.isExpandedNonPerson(n) || this.isVehicleLikeName(n)) return false;
    const parts = n.split(/\s+/);
    if (parts.length > 4) return false;
    const stop = this.personStopwords();
    if (parts.every(p => stop[p.toLowerCase()])) return false;
    if (/^\d/.test(n)) return false;
    if (!/^[A-Z][A-Za-z0-9'’\-]*(?:\s+[A-Z][A-Za-z0-9'’\-]*){0,3}$/.test(n)) return false;
    return !this.looksLikePlaceName(n) && !this.looksLikeObjectName(n);
  }

  static looksLikePlaceName(name) {
    if (this.hasLocationTypeToken(name)) return true;
    return /\b(?:City|Town|Village|Kingdom|Realm|Nation|Empire|District|Province|State|Country|Island|Valley|Forest|Woods|Mountain|Mount|Lake|River|Ocean|Sea|Castle|Palace|Temple|Academy|School|University|College|Hospital|Clinic|Tavern|Inn|Hotel|Bar|Cafe|Café|Restaurant|Bookstore|Library|Shop|Store|Market|Mall|Warehouse|Office|Station|Airport|Port|Harbor|Harbour|Base|Laboratory|Lab|Tower|Fortress|Park|Plaza|Square|Arena|Stadium|Farm|Ranch|Estate|Manor|Church|Cathedral|Cemetery|Prison|Jail|Theater|Theatre|Museum|Beach|Cave|Mine|Ruins)\b/i.test(name);
  }

  static looksLikeObjectName(name) {
    if (this.isExpandedNonPerson(name) || this.isVehicleLikeName(name)) return true;
    if (/(?:mobile|craft|mobile suit)$/i.test(String(name || ""))) return true;
    return /\b(?:Mobile|Car|Truck|Van|Bike|Motorcycle|Jet|Plane|Ship|Boat|Sword|Blade|Gun|Rifle|Pistol|Armor|Armour|Ring|Amulet|Crown|Book|Books|Tome|Device|Machine|Robot|Drone|Computer|Phone|Suit)\b/i.test(name);
  }

  static nearbyNonPersonCue(name, text) {
    const escaped = this.escapeRegExp(name);
    const re = new RegExp(`\\b(?:the\\s+)?(?:car|vehicle|truck|van|bike|motorcycle|jet|plane|ship|boat|weapon|sword|gun|rifle|device|machine|robot|drone|building|city|town|store|shop|book|company|organization|organisation)\\s+(?:called|named)?\\s*${escaped}\\b|\\b(?:drives?|parks?|boards?|flies?|pilots?|wields?|holds?|reads?|opens?)\\s+(?:the\\s+)?${escaped}\\b`, "i");
    return re.test(text);
  }

  static candidateThreshold() {
    const mode = state.emergence.config.DetectionSensitivity;
    return mode === "Conservative" ? 5 : mode === "Aggressive" ? 2 : 3;
  }

  static addNameCandidate(name, score, sourceText) {
    const display = this.titleCase(name);
    if (!this.isPlausiblePersonName(display) || this.nearbyNonPersonCue(display, sourceText || "")) return;
    const key = display.toLowerCase();
    if (state.emergence.forgottenNpcs[key]) return;
    const locCandidate = state.emergence.locationCandidates[key];
    if (locCandidate && locCandidate.score >= 2) return; // places get first claim on ambiguous proper nouns
    const c = state.emergence.nameCandidates[key] || { name: display, score: 0, lastTurn: state.emergence.turnCount };
    c.name = display;
    c.score = Math.min(12, (c.score || 0) + score);
    c.lastTurn = state.emergence.turnCount;
    state.emergence.nameCandidates[key] = c;
    if (c.score >= this.candidateThreshold()) this.initializeNPC(display, { detected: true });
  }

  static knownCharacterCardNames() {
    const cards = this.cardArray() || [];
    const names = [];
    cards.forEach(card => {
      if (!card) return;
      const type = String(card.type || "").toLowerCase();
      const title = this.cleanName(card.title || card.name || "");
      if ((type === "character" || type === "person") && this.isPlausiblePersonName(title)) names.push(title);
    });
    return names;
  }

  static discoverCharacters(text) {
    this.init();
    if (!text || !this.enabled("NPCBrainSystem")) return;
    if (Object.keys(state.world.npcs).length >= this.intConfig("MaxTrackedNPCs", 40, 5, 100)) return;
    const sample = String(text).slice(-7000);

    // Existing Character Story Cards are strong evidence and should be adopted.
    this.knownCharacterCardNames().forEach(name => this.addNameCandidate(name, 6, sample));

    const NAME = "([A-Z][A-Za-z0-9'’\\-]*(?:\\s+[A-Z][A-Za-z0-9'’\\-]*){0,2})";
    const patterns = [
      { re: new RegExp(`(?:^|\\n)\\s*${NAME}\\s*:\\s*`, "g"), score: 5 },
      { re: new RegExp(`\\b(?:named|called|meet|met|introduces?\\s+(?:you\\s+to\\s+)?|known\\s+as)\\s+${NAME}\\b`, "g"), score: 5 },
      { re: new RegExp(`\\b${NAME}\\s+(?:says?|said|asks?|asked|replies?|replied|whispers?|whispered|shouts?|shouted|laughs?|laughed|smiles?|smiled|nods?|nodded|frowns?|frowned|walks?|walked|runs?|ran|steps?|stepped|turns?|turned|looks?|looked|stares?|stared|grins?|grinned|sighs?|sighed|growls?|growled)\\b`, "g"), score: 4 },
      { re: new RegExp(`[”"]\\s*,?\\s*${NAME}\\s+(?:says?|said|asks?|asked|replies?|replied|whispers?|whispered)\\b`, "g"), score: 4 },
      { re: new RegExp(`\\b(?:Mr|Mrs|Ms|Miss|Dr|Doctor|Professor|Captain|Detective|Officer|Agent|Lord|Lady|King|Queen|Prince|Princess)\\.?\\s+${NAME}\\b`, "g"), score: 4 }
    ];

    patterns.forEach(p => {
      p.re.lastIndex = 0;
      let m;
      while ((m = p.re.exec(sample)) !== null) {
        const raw = m[1];
        if (raw) this.addNameCandidate(raw, p.score, sample.slice(Math.max(0, m.index - 100), m.index + m[0].length + 100));
        if (p.re.lastIndex === m.index) p.re.lastIndex++;
      }
    });

    // Low-confidence capitalized repeats help original characters emerge without
    // turning ordinary sentence starters into NPCs.
    const capRe = /\b([A-Z][A-Za-z0-9'’\-]{2,}(?:\s+[A-Z][A-Za-z0-9'’\-]{2,})?)\b/g;
    let m;
    const seen = {};
    while ((m = capRe.exec(sample)) !== null) {
      const raw = this.cleanName(m[1]);
      if (!this.isPlausiblePersonName(raw) || this.nearbyNonPersonCue(raw, sample.slice(Math.max(0, m.index - 70), m.index + 120))) continue;
      const key = raw.toLowerCase();
      if (!seen[key]) {
        seen[key] = true;
        this.addNameCandidate(raw, 1, sample);
      }
    }

    // Age out weak ghosts instead of letting one accidental capitalized word live forever.
    Object.keys(state.emergence.nameCandidates).forEach(key => {
      const c = state.emergence.nameCandidates[key];
      if (!state.world.npcs[c.name] && state.emergence.turnCount - (c.lastTurn || 0) > 12) delete state.emergence.nameCandidates[key];
    });
  }

  static placeStopwords() {
    if (this._placeStopwords) return this._placeStopwords;
    const raw = "Door Table Chair Bed Room House Home Car Vehicle Coat Jacket Dress Shirt Pants Suit Robe Cape Armor Armour Morning Afternoon Evening Night Today Tomorrow Yesterday Someone Something Nothing Everything Anything Him Her Them Us You Me His Her Your My Our Their Head Face Hand Hands Body Voice Eyes Eye Hair Blood Shadow Shadows Sun Moon Sky Floor Wall Window Phone Sword Gun Book Food Drink";
    this._placeStopwords = {};
    raw.split(/\s+/).forEach(w => this._placeStopwords[w.toLowerCase()] = true);
    return this._placeStopwords;
  }

  static plausibleLocationName(name) {
    const n = this.cleanName(name);
    if (!n || n.length < 2 || n.length > 70) return false;
    const parts = n.split(/\s+/);
    if (parts.length > 6) return false;
    if (this.placeStopwords()[n.toLowerCase()]) return false;
    if (/^(he|she|it|they|we|you|i|his|her|their|our|your|my)$/i.test(n)) return false;
    return /^[A-Z][A-Za-z0-9'’&\-]*(?:\s+(?:of|the|and|[A-Z][A-Za-z0-9'’&\-]*)){0,5}$/.test(n);
  }

  static addLocationCandidate(name, score) {
    const display = this.cleanName(name);
    if (!this.plausibleLocationName(display)) return;
    const key = display.toLowerCase();
    const c = state.emergence.locationCandidates[key] || { name: display, score: 0, lastTurn: state.emergence.turnCount };
    c.score = Math.min(10, c.score + score);
    c.lastTurn = state.emergence.turnCount;
    state.emergence.locationCandidates[key] = c;
    const threshold = state.emergence.config.DetectionSensitivity === "Conservative" ? 5 : 3;
    if (c.score >= threshold) {
      // A proper noun that becomes a confirmed place must stop being promoted as a person.
      delete state.emergence.nameCandidates[key];
      if (state.world.npcs[display] && !this.getBoundNpcCard(display)) delete state.world.npcs[display];
      this.initializeLocation(display, { detected: true, setCurrent: true });
    }
  }

  static discoverLocations(text) {
    this.init();
    if (!text || !this.enabled("LocationCards")) return;
    if (Object.keys(state.world.locations).length >= this.intConfig("MaxTrackedLocations", 30, 5, 100)) return;
    const sample = String(text).slice(-7000);
    const placeNouns = "City|Town|Village|Kingdom|Realm|Nation|Empire|District|Province|State|Country|Island|Valley|Forest|Woods|Mountain|Lake|River|Castle|Palace|Temple|Academy|School|University|College|Hospital|Clinic|Tavern|Inn|Hotel|Bar|Cafe|Café|Restaurant|Bookstore|Library|Shop|Store|Market|Mall|Warehouse|Office|Station|Airport|Port|Harbor|Harbour|Base|Laboratory|Lab|Tower|Fortress|Park|Plaza|Square|Arena|Stadium|Farm|Ranch|Estate|Manor|Church|Cathedral|Cemetery|Prison|Jail|Theater|Theatre|Museum|Beach|Cave|Mine|Ruins";
    const NAME = "[A-Z][A-Za-z0-9'’&\\-]*(?:\\s+(?:of|the|and|[A-Z][A-Za-z0-9'’&\\-]*)){0,4}";
    const patterns = [
      { re: new RegExp(`\\b(${NAME}\\s+(?:${placeNouns}))\\b`, "g"), group: 1, score: 6 },
      { re: new RegExp(`\\b(?:${placeNouns})\\s+of\\s+(${NAME})\\b`, "g"), group: 1, score: 5 },
      { re: new RegExp(`\\b(?:enter(?:s|ed|ing)?|arriv(?:e|es|ed|ing)\\s+at|reach(?:es|ed|ing)?|head(?:s|ed|ing)?\\s+to|go(?:es|ing)?\\s+to|travel(?:s|ed|ing)?\\s+to|walk(?:s|ed|ing)?\\s+into|step(?:s|ped|ping)?\\s+into|inside)\\s+(?:the\\s+)?(${NAME})\\b`, "g"), group: 1, score: 4 },
      { re: new RegExp(`\\b(?:in|at|inside)\\s+(?:the\\s+)?(${NAME})\\b`, "g"), group: 1, score: 2 }
    ];
    patterns.forEach(p => {
      p.re.lastIndex = 0;
      let m;
      while ((m = p.re.exec(sample)) !== null) {
        let raw = this.cleanName(m[p.group]);
        if (raw) this.addLocationCandidate(raw, p.score);
        if (p.re.lastIndex === m.index) p.re.lastIndex++;
      }
    });
  }

  static initializeLocation(name, opts = {}) {
    const n = this.cleanName(name);
    if (!n || !this.plausibleLocationName(n)) return null;
    if (!state.world.locations[n]) {
      state.world.locations[n] = { condition: "Intact", echoes: [], lastSeenTurn: state.emergence.turnCount, generatedByEOS: false };
    }
    const loc = this.normalizeLocation(n);
    loc.lastSeenTurn = state.emergence.turnCount;
    if (opts.setCurrent !== false) state.emergence.currentLocation = n;
    this.markLocationDirty(n);
    this.ensureLocationCard(n);
    return loc;
  }

  static ensureLocationCard(name) {
    if (!this.enabled("LocationCards")) return null;
    let card = this.getBoundLocationCard(name);
    if (card) return card;
    const existing = this.findCardByTitle(name);
    if (existing && !/character|person/i.test(String(existing.type || ""))) {
      this.bindLocationCard(name, existing, false);
      return existing;
    }
    const loc = state.world.locations[name];
    const cardNew = this.createStoryCard(`eos-location:${name.toLowerCase()}, ${name.toLowerCase()}`, this.locationEntry(name, loc), "Location", name, "Managed by EMERGENCE OS. The script updates only this generated card.");
    if (cardNew) {
      loc.generatedByEOS = true;
      this.bindLocationCard(name, cardNew, true);
    }
    return cardNew;
  }

  static initializeNPC(name, opts = {}) {
    const n = this.titleCase(name);
    if (!this.isPlausiblePersonName(n)) return null;
    if (opts.manual || opts.force) delete state.emergence.forgottenNpcs[n.toLowerCase()];
    else if (state.emergence.forgottenNpcs[n.toLowerCase()]) return null;
    if (!state.world.npcs[n]) {
      if (!opts.manual && !opts.force && Object.keys(state.world.npcs).length >= this.intConfig("MaxTrackedNPCs", 40, 5, 100)) return null;
      state.world.npcs[n] = {
        trust: 50, grudge: 0, stress: 10, composure: 100, attraction: 0,
        cognitiveBias: "Unclear", attachmentStyle: "Unclear", threatState: "Composed",
        mood: "Neutral", outerMask: "Guarded", innerMind: "Observing",
        hiddenGoal: "Not established", secret: "Not established", coreBelief: "Not established",
        memories: [], coreMemory: "", undercurrents: {}, reflections: [],
        lastSeenLocation: "", lastSeenTurn: 0, secureStreak: 0,
        biasEvidence: {}, attachmentEvidence: {}, lastInteractionType: "", lastInteractionTurn: -999,
        generatedByEOS: false,
        familiarity: 0, respect: 50, fear: 0, memoryLedger: [], commitments: [], boundaries: [], aliases: [],
        firstSeenTurn: state.emergence.turnCount || this.actionCount(), sceneCount: 0, mentionCount: 0,
        relationshipTone: "Unfamiliar", lastStateSummary: ""
      };
    }
    const npc = this.normalizeNpc(n);
    this.adoptExistingCharacterCard(n);
    this.markNpcDirty(n);
    return npc;
  }

  static adoptExistingCharacterCard(name) {
    if (this.getBoundNpcCard(name)) return;
    const card = this.findCardByTitle(name);
    if (!card) return;
    const type = String(card.type || "").toLowerCase();
    if (type && !/character|person|custom/.test(type)) return;
    this.bindNpcCard(name, card, false);
  }

  static findNpcByName(raw) {
    const target = this.cleanName(raw).toLowerCase();
    if (!target) return null;
    const names = Object.keys(state.world.npcs);
    let exact = names.find(n => n.toLowerCase() === target);
    if (exact) return exact;
    // Unambiguous first-name match only; never guess between two Alexes.
    const matches = names.filter(n => n.split(/\s+/)[0].toLowerCase() === target.split(/\s+/)[0]);
    if (matches.length === 1) return matches[0];
    const mapped = state.emergence.aliases && state.emergence.aliases[target];
    return mapped && mapped !== "__ambiguous__" && state.world.npcs[mapped] ? mapped : null;
  }

  static getSceneNames(text) {
    const sample = String(text || "");
    return Object.keys(state.world.npcs).filter(name => new RegExp(`\\b${this.escapeRegExp(name)}\\b`, "i").test(sample));
  }

  // Mentioned is not the same thing as physically present. Strip quoted speech
  // so a recollection such as "I saw Marcus yesterday" does not turn Marcus into
  // a witness in the current room. Then require a narration/speaker/spatial cue,
  // with a one-turn continuity fallback for quiet characters already in scene.
  static getPresentSceneNames(text) {
    const raw = String(text || "");
    const narration = raw
      .replace(/"[^"\n]*"/g, " ")
      .replace(/“[^”\n]*”/g, " ")
      .replace(/'[^'\n]*'/g, " ");
    const mentioned = this.getSceneNames(narration);
    if (!mentioned.length) return [];

    const activeVerbs = "say(?:s|ing)?|said|ask(?:s|ed|ing)?|repl(?:y|ies|ied|ying)|whisper(?:s|ed|ing)?|shout(?:s|ed|ing)?|yell(?:s|ed|ing)?|nod(?:s|ded|ding)?|smil(?:e|es|ed|ing)|frown(?:s|ed|ing)?|laugh(?:s|ed|ing)?|cry|cries|cried|crying|scream(?:s|ed|ing)?|look(?:s|ed|ing)?|turn(?:s|ed|ing)?|step(?:s|ped|ping)?|walk(?:s|ed|ing)?|run(?:s|ning)?|ran|move(?:s|d|ing)?|stand(?:s|ing)?|stood|sit(?:s|ting)?|sat|lean(?:s|ed|ing)?|reach(?:es|ed|ing)?|grab(?:s|bed|bing)?|touch(?:es|ed|ing)?|kiss(?:es|ed|ing)?|watch(?:es|ed|ing)?|stare(?:s|d|ing)?|glance(?:s|d|ing)?|hear(?:s|d|ing)?|see(?:s|ing)?|saw|flinch(?:es|ed|ing)?|shrug(?:s|ged|ging)?|breath(?:e|es|ed|ing)|raise(?:s|d|ing)?|lower(?:s|ed|ing)?|hold(?:s|ing)?|pull(?:s|ed|ing)?|push(?:es|ed|ing)?|enter(?:s|ed|ing)?|leave(?:s|ing)?|left|follow(?:s|ed|ing)?|approach(?:es|ed|ing)?";
    const currentTurn = state.emergence.turnCount || this.actionCount();

    return mentioned.filter(name => {
      const n = this.escapeRegExp(name);
      const speaker = new RegExp(`(?:^|\\n)\\s*${n}\\s*:`, "i");
      const actor = new RegExp(`\\b${n}\\b\\s*(?:,\\s*)?(?:${activeVerbs})\\b`, "i");
      const spatial = new RegExp(`\\b(?:with|beside|near|alongside|behind|before|next to|in front of|across from)\\s+${n}\\b`, "i");
      if (speaker.test(narration) || actor.test(narration) || spatial.test(narration)) return true;

      const npc = state.world.npcs[name];
      return !!(npc && npc.lastSeenLocation &&
        npc.lastSeenLocation === state.emergence.currentLocation &&
        currentTurn - (npc.lastSeenTurn || 0) <= 1);
    });
  }

  // ---------------------------------------------------------------------------
  // INTERACTION / PSYCHOLOGY MODEL
  // ---------------------------------------------------------------------------
  static interactionPatterns() {
    if (this._interactionPatterns) return this._interactionPatterns;
    const make = words => new RegExp(`\\b(?:${words})\\b`, "i");
    this._interactionPatterns = {
      respect: make("ask(?:s|ed|ing)?|thank(?:s|ed|ing)?|apologi[sz](?:e|es|ed|ing)?|help(?:s|ed|ing)?|protect(?:s|ed|ing)?|comfort(?:s|ed|ing)?|listen(?:s|ed|ing)?|prais(?:e|es|ed|ing)|reassur(?:e|es|ed|ing)|support(?:s|ed|ing)?|save(?:s|d|ing)?|defend(?:s|ed|ing)?|confid(?:e|es|ed|ing)|share(?:s|d|ing)?"),
      coercion: make("demand(?:s|ed|ing)?|order(?:s|ed|ing)?|command(?:s|ed|ing)?|threaten(?:s|ed|ing)?|force(?:s|d|ing)?|blackmail(?:s|ed|ing)?|shove(?:s|d|ing)?|grab(?:s|bed|bing)?|hit(?:s|ting)?|attack(?:s|ed|ing)?|insult(?:s|ed|ing)?|mock(?:s|ed|ing)?|humiliat(?:e|es|ed|ing)|intimidat(?:e|es|ed|ing)"),
      betrayal: make("betray(?:s|ed|ing)?|deceiv(?:e|es|ed|ing)|lie(?:s|d|ing)?|cheat(?:s|ed|ing)?|abandon(?:s|ed|ing)?|expos(?:e|es|ed|ing)\\s+(?:their|his|her)\\s+secret|break(?:s|ing)?\\s+(?:my|your|his|her|their|a)\\s+promise"),
      romance: make("kiss(?:es|ed|ing)?|flirt(?:s|ed|ing)?|caress(?:es|ed|ing)?|embrac(?:e|es|ed|ing)|cuddl(?:e|es|ed|ing)|hold(?:s|ing)?\\s+hands|confess(?:es|ed|ing)?\\s+(?:my|your)?\\s*(?:love|feelings)|tell(?:s|ing)?\\s+.*\\b(?:love|want)"),
      danger: make("gunfire|explosion(?:s)?|explod(?:e|es|ed|ing)|attack(?:s|ed|ing)?|fire|flames?|bomb(?:s|ed|ing)?|grenade(?:s)?|shoot(?:s|ing)?|shot|stab(?:s|bed|bing)?|collapse(?:s|d|ing)?|scream(?:s|ed|ing)?|panic(?:s|ked|king)?"),
      recovery: make("rest(?:s|ed|ing)?|safe|safety|sanctuary|comfort(?:s|ed|ing)?|heal(?:s|ed|ing)?|calm(?:s|ed|ing)?|sleep(?:s|ing)?|slept|recover(?:s|ed|ing)?"),
      npcConflict: make("insult(?:s|ed|ing)?|mock(?:s|ed|ing)?|threaten(?:s|ed|ing)?|attack(?:s|ed|ing)?|betray(?:s|ed|ing)?|shove(?:s|d|ing)?|hit(?:s|ting)?|argu(?:e|es|ed|ing)|accus(?:e|es|ed|ing)"),
      npcWarmth: make("help(?:s|ed|ing)?|protect(?:s|ed|ing)?|comfort(?:s|ed|ing)?|hug(?:s|ged|ging)?|prais(?:e|es|ed|ing)|thank(?:s|ed|ing)?|support(?:s|ed|ing)?|save(?:s|d|ing)?|reassur(?:e|es|ed|ing)|smile(?:s|d|ing)?\\s+at"),
      npcRomance: make("kiss(?:es|ed|ing)?|flirt(?:s|ed|ing)?|caress(?:es|ed|ing)?|embrac(?:e|es|ed|ing)|cuddl(?:e|es|ed|ing)"),
      biasParanoid: make("suspicious|suspects?|distrust(?:s|ed|ing)?|paranoid|wary|watchful|doesn't believe|does not believe"),
      biasPrideful: make("proud|pride|offended|insulted|ego|dignity|refuses? to back down"),
      biasImpulsive: make("impulsive|without thinking|immediately lunges|blurts?|reckless|rashly"),
      biasDeflective: make("deflect(?:s|ed|ing)?|changes? the subject|avoids? the question|blames? someone else"),
      attachmentAnxious: make("afraid you'll leave|afraid you will leave|cling(?:s|ing)?|reassurance|abandon(?:ed|ment)|desperate to please|needs? you"),
      attachmentAvoidant: make("pulls? away|keeps? distance|emotionally distant|shuts? down|doesn't need anyone|does not need anyone|avoids? intimacy"),
      attachmentSecure: make("communicates? openly|sets? a boundary|trusts? without clinging|comfortable with closeness|asks? directly|stays? grounded"),
      attachmentDisorganized: make("pushes? you away.*pulls? you back|fearful.*closeness|wants? closeness.*afraid|contradictory|unpredictable attachment")
    };
    return this._interactionPatterns;
  }

  static splitClauses(text) {
    return String(text || "").replace(/\r/g, "").split(/(?:[.!?;\n]+|\bwhile\b|\bbut\b|\band then\b)/i).map(s => s.trim()).filter(Boolean);
  }

  static autonomyMultiplier(npc) {
    const map = { Low: 0.55, Medium: 0.85, High: 1.15, Unchained: 1.5 };
    let m = map[state.emergence.config.AutonomyLevel] || 1;
    // Existing resentment makes coercion land harder; high trust buffers slightly.
    m *= 1 + (npc.grudge / 180) - (Math.max(0, npc.trust - 50) / 300);
    return Math.max(0.35, Math.min(2, m));
  }

  static severityMultiplier() {
    const map = { Mild: 0.55, Moderate: 0.9, Hardcore: 1.25 };
    return map[state.emergence.config.ConsequenceSeverity] || 0.9;
  }

  static romanceMultiplier() {
    const map = { "Slow Burn": 0.55, Normal: 1, Fast: 1.5 };
    return map[state.emergence.config.RomancePacing] || 1;
  }

  static pushMemory(npc, text) {
    if (!npc || !text) return;
    const normalized = this.excerpt(text, 125);
    if (npc.memories[npc.memories.length - 1] !== normalized) npc.memories.push(normalized);
    while (npc.memories.length > 5) npc.memories.shift();
  }

  static addEvidence(bucket, key, amount) {
    if (!bucket) return;
    bucket[key] = (bucket[key] || 0) + amount;
  }

  static inferTraits(name, text) {
    const npc = state.world.npcs[name];
    if (!npc || !text) return;
    const p = this.interactionPatterns();
    const local = String(text);
    if (p.biasParanoid.test(local)) this.addEvidence(npc.biasEvidence, "Suspicious", 2);
    if (p.biasPrideful.test(local)) this.addEvidence(npc.biasEvidence, "Prideful", 2);
    if (p.biasImpulsive.test(local)) this.addEvidence(npc.biasEvidence, "Impulsive", 2);
    if (p.biasDeflective.test(local)) this.addEvidence(npc.biasEvidence, "Deflective", 2);
    if (p.attachmentAnxious.test(local)) this.addEvidence(npc.attachmentEvidence, "Anxious", 2);
    if (p.attachmentAvoidant.test(local)) this.addEvidence(npc.attachmentEvidence, "Avoidant", 2);
    if (p.attachmentSecure.test(local)) this.addEvidence(npc.attachmentEvidence, "Secure", 2);
    if (p.attachmentDisorganized.test(local)) this.addEvidence(npc.attachmentEvidence, "Disorganized", 2);

    const choose = bucket => {
      let best = null, high = 0;
      Object.keys(bucket).forEach(k => { if (bucket[k] > high) { high = bucket[k]; best = k; } });
      return high >= 4 ? best : null;
    };
    const b = choose(npc.biasEvidence);
    const a = choose(npc.attachmentEvidence);
    if (b && b !== npc.cognitiveBias) npc.cognitiveBias = b;
    if (a && a !== npc.attachmentStyle) npc.attachmentStyle = a;
  }

  static targetedPlayerEvents(inputText) {
    const clauses = this.splitClauses(inputText);
    const names = Object.keys(state.world.npcs);
    const p = this.interactionPatterns();
    const events = [];

    // Require actor -> action -> target ordering. This prevents narration such as
    // "You tell Elena that Marcus betrayed you" from being misread as the player
    // betraying Marcus just because all three tokens share a sentence.
    const hitsTarget = (clause, target, actionRe) => {
      const source = actionRe.source;
      const t = this.escapeRegExp(target);
      const re = new RegExp(`\\b(?:you|i)\\b(?:\\s+[A-Za-z'’\\-]+){0,3}\\s+${source}[^.!?;]{0,45}\\b${t}\\b`, "i");
      if (re.test(clause)) return true;
      // Common confession grammar puts the target before "love": "You tell Elena
      // you love her." Keep this romance-only path narrow and explicit.
      if (actionRe === p.romance) {
        const confess = new RegExp(`\\b(?:you|i)\\b[^.!?;]{0,24}\\b(?:tell|confess\\s+to)\\s+${t}\\b[^.!?;]{0,35}\\b(?:love|feelings?|want)\\b`, "i");
        if (confess.test(clause)) return true;
      }
      return false;
    };

    clauses.forEach(clause => {
      if (!/\b(?:you|i)\b/i.test(clause)) return;
      const mentioned = names.filter(n => new RegExp(`\\b${this.escapeRegExp(n)}\\b`, "i").test(clause));
      mentioned.forEach(target => {
        if (hitsTarget(clause, target, p.betrayal)) events.push({ target, type: "betrayal", clause });
        else if (hitsTarget(clause, target, p.coercion)) events.push({ target, type: "coercion", clause });
        else if (hitsTarget(clause, target, p.respect)) events.push({ target, type: "respect", clause });
        if (hitsTarget(clause, target, p.romance)) events.push({ target, type: "romance", clause });
      });
    });
    return events;
  }

  static applyPlayerInteractions(inputText, visibleOutput) {
    if (!this.enabled("NPCBrainSystem")) return;
    const events = this.targetedPlayerEvents(inputText);
    const seen = {};
    events.forEach(ev => {
      const key = `${ev.target}|${ev.type}|${this.hashText(ev.clause)}`;
      if (seen[key]) return;
      seen[key] = true;
      const npc = state.world.npcs[ev.target];
      if (!npc) return;
      const sev = this.severityMultiplier();
      if (ev.type === "respect") {
        if (this.enabled("GrudgeTracking")) {
          this.updateStat(npc, "trust", 7 + Math.round((100 - npc.trust) / 25));
          this.updateStat(npc, "grudge", -6);
        }
        this.updateStat(npc, "stress", -5);
        this.updateStat(npc, "composure", 5);
        npc.outerMask = "More receptive";
        npc.innerMind = "Registering the player's respect rather than taking it for granted";
        this.pushMemory(npc, `Respect: ${ev.clause}`);
      } else if (ev.type === "coercion") {
        const a = this.autonomyMultiplier(npc);
        if (this.enabled("GrudgeTracking")) {
          this.updateStat(npc, "trust", -Math.round(10 * sev * a));
          this.updateStat(npc, "grudge", Math.round(12 * sev * a));
        }
        this.updateStat(npc, "stress", Math.round(10 * a));
        this.updateStat(npc, "composure", -Math.round(8 * a));
        npc.outerMask = this.enabled("HumanAgency") ? "Resistant; boundaries engaged" : "Strained";
        npc.innerMind = "Feeling pressured and recalculating what the player is entitled to ask";
        this.pushMemory(npc, `Pressure: ${ev.clause}`);
      } else if (ev.type === "betrayal") {
        if (this.enabled("GrudgeTracking")) {
          this.updateStat(npc, "trust", -Math.round(24 * sev));
          this.updateStat(npc, "grudge", Math.round(28 * sev));
        }
        this.updateStat(npc, "stress", 15);
        this.updateStat(npc, "composure", -14);
        npc.outerMask = "Trust ruptured";
        npc.innerMind = "Reassessing the relationship through the betrayal";
        this.pushMemory(npc, `Betrayal: ${ev.clause}`);
        if (npc.grudge >= 70 && !npc.coreMemory) this.setFormativeMemory(ev.target, `A major betrayal by the player became a defining fracture in their trust.`, ev.clause);
      } else if (ev.type === "romance" && this.enabled("RomanceEngine")) {
        const grudgeDamp = npc.grudge > 60 ? 0.25 : npc.grudge > 30 ? 0.65 : 1;
        const trustGate = npc.trust < 25 ? 0.45 : 1;
        const before = this.relationshipStage(npc.attraction);
        this.updateStat(npc, "attraction", Math.round(10 * this.romanceMultiplier() * grudgeDamp * trustGate));
        const after = this.relationshipStage(npc.attraction);
        if (after !== before) this.queueNudge(`${ev.target}'s relationship with the player has shifted to ${after}. Let it emerge naturally through behavior; do not announce a stat change.`);
        this.pushMemory(npc, `Romantic beat: ${ev.clause}`);
        this.applyWitnessedJealousy(ev.target, visibleOutput || inputText);
      }
      npc.lastInteractionType = ev.type;
      npc.lastInteractionTurn = state.emergence.turnCount;
      this.updateStat(npc, "familiarity", 2);
      this.recordStructuredMemory(ev.target, ev.type, ev.clause, ev.type === "betrayal" ? 8 : ev.type === "coercion" ? 5 : ev.type === "romance" ? 5 : 3, "player-core");
      this.addGlobalEvent(ev.target, ev.type, ev.clause, ev.type === "betrayal" ? 8 : 4);
      this.recalculateRelationshipTone(ev.target);
      this.trackRelationshipSnapshot(ev.target, ev.type);
      this.updateThreatState(ev.target);
      this.markNpcDirty(ev.target);
    });
  }

  static applyWitnessedJealousy(romanticTarget, sceneText) {
    if (!this.enabled("JealousyMechanic") || !this.enabled("RomanceEngine")) return;
    const present = this.getPresentSceneNames(sceneText);
    present.forEach(name => {
      if (name === romanticTarget) return;
      const npc = state.world.npcs[name];
      if (!npc || npc.attraction < 30) return;
      this.updateStat(npc, "grudge", 5);
      this.updateStat(npc, "stress", 4);
      npc.innerMind = "Noticing the romantic shift and having to decide what it means for them";
      this.nudgeUndercurrent(name, romanticTarget, -6, `Jealous tension after witnessing the player's romantic attention toward ${romanticTarget}.`);
      this.pushMemory(npc, `Witnessed the player's romantic attention toward ${romanticTarget}.`);
      this.markNpcDirty(name);
    });
  }

  static updateThreatState(name) {
    const npc = state.world.npcs[name];
    if (!npc) return;
    const stress = npc.stress;
    let stateName = "Composed";
    if (stress >= 82) stateName = "Freeze";
    else if (stress >= 65) {
      if (npc.attachmentStyle === "Anxious") stateName = "Fawn";
      else if (npc.attachmentStyle === "Avoidant") stateName = "Flight";
      else if (npc.cognitiveBias === "Prideful" || npc.cognitiveBias === "Impulsive") stateName = "Fight";
      else stateName = "Defensive";
    } else if (stress >= 40) stateName = "Alert";
    npc.threatState = stateName;
  }

  static processNpcPresence(text) {
    const names = this.enabled("SceneContinuity") ? this.updateSceneRoster(text) : this.getPresentSceneNames(text);
    state.emergence.sceneNames = names;
    const danger = this.interactionPatterns().danger.test(text);
    names.forEach(name => {
      const npc = state.world.npcs[name];
      if (!npc) return;
      npc.lastSeenLocation = state.emergence.currentLocation;
      npc.lastSeenTurn = state.emergence.turnCount;
      this.noteNpcMention(name);
      this.noteNpcScene(name);
      if (danger && state.emergence.config.WorldTensionEngine === "Dynamic") {
        this.updateStat(npc, "stress", 8);
        this.updateStat(npc, "composure", -6);
      }
      this.inferTraits(name, this.localWindowForName(name, text));
      this.updateThreatState(name);
      this.markNpcDirty(name);
    });
  }

  static localWindowForName(name, text) {
    const s = String(text || "");
    const idx = s.toLowerCase().indexOf(name.toLowerCase());
    if (idx < 0) return "";
    return s.slice(Math.max(0, idx - 220), Math.min(s.length, idx + name.length + 260));
  }

  static updateUndercurrents(text) {
    if (!this.enabled("LivingWorldEngine")) return;
    const names = this.getSceneNames(text);
    if (names.length < 2) return;
    const p = this.interactionPatterns();
    const clauses = this.splitClauses(text);
    const presentNow = {};
    this.getPresentSceneNames(text).forEach(n => { presentNow[n] = true; });

    const directed = (clause, actor, target, kind) => {
      const a = this.escapeRegExp(actor), b = this.escapeRegExp(target);
      let verbs;
      if (kind === "conflict") verbs = "insult(?:s|ed|ing)?|mock(?:s|ed|ing)?|threaten(?:s|ed|ing)?|attack(?:s|ed|ing)?|betray(?:s|ed|ing)?|shove(?:s|d|ing)?|hit(?:s|ting)?|accus(?:e|es|ed|ing)|argu(?:e|es|ed|ing)";
      else if (kind === "romance") verbs = "kiss(?:es|ed|ing)?|flirt(?:s|ed|ing)?|caress(?:es|ed|ing)?|embrac(?:e|es|ed|ing)|cuddl(?:e|es|ed|ing)|hug(?:s|ged|ging)?";
      else verbs = "help(?:s|ed|ing)?|protect(?:s|ed|ing)?|comfort(?:s|ed|ing)?|prais(?:e|es|ed|ing)|thank(?:s|ed|ing)?|support(?:s|ed|ing)?|save(?:s|d|ing)?|reassur(?:e|es|ed|ing)|smile(?:s|d|ing)?";
      // Target must sit close after the interpersonal verb. A passive witness
      // later in the sentence does not become the target of the relationship event.
      const re = new RegExp(`\\b${a}\\b(?:\\s+[A-Za-z'’\\-]+){0,4}\\s+(?:${verbs})(?:\\s+(?:at|to|with|toward|towards))?\\s+\\b${b}\\b`, "i");
      return re.test(clause);
    };

    clauses.forEach(clause => {
      const mentioned = names.filter(n => new RegExp(`\\b${this.escapeRegExp(n)}\\b`, "i").test(clause));
      if (mentioned.length < 2) return;
      for (let i = 0; i < mentioned.length; i++) {
        for (let j = i + 1; j < mentioned.length; j++) {
          const a = mentioned[i], b = mentioned[j];
          let delta = 0, reason = "";
          if (directed(clause, a, b, "conflict") || directed(clause, b, a, "conflict")) {
            delta = -10; reason = this.excerpt(clause);
          } else if (directed(clause, a, b, "romance") || directed(clause, b, a, "romance")) {
            delta = 8; reason = this.excerpt(clause);
          } else if (directed(clause, a, b, "warmth") || directed(clause, b, a, "warmth")) {
            delta = 6; reason = this.excerpt(clause);
          } else if (p.danger.test(clause) && presentNow[a] && presentNow[b]) {
            // Shared danger only counts when both characters are actually placed
            // in the current scene, not merely mentioned in dialogue/recollection.
            delta = 2; reason = `Shared danger: ${this.excerpt(clause)}`;
          }
          if (delta) {
            this.nudgeUndercurrent(a, b, delta, reason);
            this.nudgeUndercurrent(b, a, delta, reason);
            this.pushMemory(state.world.npcs[a], `With ${b}: ${reason}`);
            this.pushMemory(state.world.npcs[b], `With ${a}: ${reason}`);
          }
        }
      }
    });
  }

  static nudgeUndercurrent(from, to, delta, gossipReason) {
    const a = state.world.npcs[from], b = state.world.npcs[to];
    if (!a || !b || from === to) return;
    a.undercurrents[to] = Math.max(-100, Math.min(100, (a.undercurrents[to] || 0) + delta));
    this.markNpcDirty(from);
    if (Math.abs(a.undercurrents[to]) >= 35 && gossipReason) {
      this.pushGossip(`${from} ↔ ${to}: ${a.undercurrents[to] > 0 ? "warmth" : "tension"} — ${this.excerpt(gossipReason, 85)}`);
    }
  }

  static mutualUndercurrent(a, b) {
    const na = state.world.npcs[a], nb = state.world.npcs[b];
    if (!na || !nb) return 0;
    const ab = na.undercurrents[b] || 0;
    const ba = nb.undercurrents[a] || 0;
    return Math.round((ab + ba) / 2);
  }

  static strongestUndercurrent(name) {
    const npc = typeof name === "string" ? state.world.npcs[name] : name;
    if (!npc || !npc.undercurrents) return null;
    let best = null;
    Object.keys(npc.undercurrents).forEach(target => {
      const value = npc.undercurrents[target];
      if (!best || Math.abs(value) > Math.abs(best.value)) best = { target, value };
    });
    return best;
  }

  static pushGossip(text) {
    if (!text) return;
    const log = state.emergence.gossipLog;
    if (log[log.length - 1] !== text) log.push(text);
    while (log.length > 8) log.shift();
  }

  static spreadReputation() {
    if (!this.enabled("LivingWorldEngine") || !this.enabled("GrudgeTracking")) return;
    const names = Object.keys(state.world.npcs);
    names.forEach(source => {
      names.forEach(target => {
        if (source === target) return;
        const closeness = this.mutualUndercurrent(source, target);
        if (closeness < 45) return; // genuine mutual confidants only
        const s = state.world.npcs[source], t = state.world.npcs[target];
        if (s.grudge - t.grudge >= 35) {
          this.updateStat(t, "grudge", 2);
          this.updateStat(t, "trust", -1);
          this.markNpcDirty(target);
          this.pushGossip(`${source}'s distrust is starting to color ${target}'s view of the player.`);
        } else if (s.trust - t.trust >= 35 && s.grudge < 25) {
          this.updateStat(t, "trust", 2);
          this.markNpcDirty(target);
          this.pushGossip(`${source}'s confidence in the player is starting to reassure ${target}.`);
        }
      });
    });
  }

  static detectFactions() {
    const names = Object.keys(state.world.npcs);
    const result = { coalitions: [], rivalryBlocs: [] };
    // Triangles only: every pair must be mutually above/below threshold.
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        for (let k = j + 1; k < names.length; k++) {
          const trio = [names[i], names[j], names[k]];
          const edges = [this.mutualUndercurrent(trio[0], trio[1]), this.mutualUndercurrent(trio[0], trio[2]), this.mutualUndercurrent(trio[1], trio[2])];
          if (edges.every(v => v >= 45)) result.coalitions.push(trio);
          if (edges.every(v => v <= -45)) result.rivalryBlocs.push(trio);
        }
      }
    }
    return result;
  }

  static updateEarnedSecurity(name, eventType) {
    const npc = state.world.npcs[name];
    if (!npc || npc.attachmentStyle === "Secure" || npc.attachmentStyle === "Unclear") return;
    // This is a narrative progression mechanic, not a clinical diagnosis. Only
    // meaningful supportive interactions advance it; mere presence does not.
    if (eventType === "respect" && npc.trust >= 75 && npc.grudge <= 15) {
      npc.secureStreak = (npc.secureStreak || 0) + 1;
      if (npc.secureStreak >= 8) {
        npc.attachmentStyle = "Secure";
        this.setFormativeMemory(name, "A sustained pattern of dependable, safe treatment changed how they approach closeness and trust.", "Earned security developed through repeated supportive interactions.");
        this.queueNudge(`${name} has grown noticeably more secure in this relationship. Show it subtly through steadier boundaries and less defensive closeness; do not label it clinically.`);
      }
    } else if (eventType === "betrayal" || eventType === "coercion") {
      npc.secureStreak = Math.max(0, (npc.secureStreak || 0) - 2);
    }
  }

  // ---------------------------------------------------------------------------
  // WORLD / LOCATIONS
  // ---------------------------------------------------------------------------
  static locationConditionFromClause(clause) {
    const s = String(clause || "");
    if (/\b(?:destroy(?:ed|ing)?|demolish(?:ed|ing)?|collapse(?:d|s|ing)?|reduced to rubble|ruins?)\b/i.test(s)) return "Destroyed";
    if (/\b(?:burn(?:ing|ed)?|on fire|flames?|blaze|inferno)\b/i.test(s)) return "On Fire";
    if (/\b(?:locked down|lockdown|sealed|barricad(?:ed|ing)?|quarantined)\b/i.test(s)) return "Locked Down";
    if (/\b(?:rebuilt|restored|repaired|reopened|secured|extinguished|fire is out|flames are out|intact|undamaged)\b/i.test(s)) return "Intact";
    if (/\b(?:damaged|shattered|wrecked|broken|flooded|cracked)\b/i.test(s)) return "Damaged";
    return null;
  }

  static updateLocationConditions(text) {
    const names = Object.keys(state.world.locations);
    if (!names.length || !text) return;
    const clauses = this.splitClauses(text);
    clauses.forEach(clause => {
      const condition = this.locationConditionFromClause(clause);
      if (!condition) return;
      const mentioned = names.filter(n => new RegExp(`\\b${this.escapeRegExp(n)}\\b`, "i").test(clause));
      if (!mentioned.length && names.length === 1 && state.emergence.currentLocation !== "Unknown Location") mentioned.push(state.emergence.currentLocation);
      mentioned.forEach(name => {
        const loc = state.world.locations[name];
        if (!loc) return;
        if (loc.condition !== condition) {
          const before = loc.condition;
          loc.condition = condition;
          loc.lastSeenTurn = state.emergence.turnCount;
          loc.lastConditionTurn = state.emergence.turnCount;
          loc.conditionHistory.push({ turn: state.emergence.turnCount, from: before, to: condition, text: this.excerpt(clause, 120) });
          while (loc.conditionHistory.length > 12) loc.conditionHistory.shift();
          this.markLocationDirty(name);
        }
      });
    });
  }

  static locationAtmosphere(loc) {
    if (!loc) return "Unknown";
    if (loc.condition === "Destroyed" || loc.condition === "On Fire") return "Chaotic";
    if (loc.condition === "Locked Down") return "Tense";
    if (loc.condition === "Damaged") return state.emergence.worldTension > 40 ? "Volatile" : "Unsettled";
    if (state.emergence.worldTension >= 65) return "On Edge";
    if (state.emergence.worldTension >= 30) return "Uneasy";
    return "Calm";
  }

  static locationEntry(name, loc) {
    const echoes = (loc && loc.echoes ? loc.echoes.slice(-3) : []);
    let out = `[EMERGENCE LOCATION]\nName: ${name}\nCondition: ${loc ? loc.condition : "Intact"}\nAtmosphere: ${this.locationAtmosphere(loc)}\nWorld tension: ${Math.round(state.emergence.worldTension)}%`;
    if (echoes.length) out += `\nEchoes:\n${echoes.map(x => `• ${x}`).join("\n")}`;
    return out.slice(0, 1450);
  }

  static recordLocationEcho(text) {
    const name = state.emergence.currentLocation;
    if (!name || name === "Unknown Location" || !state.world.locations[name]) return;
    const loc = state.world.locations[name];
    const e = this.excerpt(text, 120);
    if (e && loc.echoes[loc.echoes.length - 1] !== e) loc.echoes.push(e);
    while (loc.echoes.length > 3) loc.echoes.shift();
    this.markLocationDirty(name);
  }

  static updateWorldState(text) {
    const p = this.interactionPatterns();
    if (state.emergence.config.WorldTensionEngine === "Dynamic") {
      if (p.danger.test(text)) this.updateStat(state.emergence, "worldTension", 10);
      else if (state.emergence.worldTension > 10) this.updateStat(state.emergence, "worldTension", -2);
    }
    if (this.enabled("PlayerTrauma")) {
      if (p.danger.test(text)) {
        this.updateStat(state.playerInner, "stress", 8);
        this.updateStat(state.playerInner, "composure", -7);
      } else if (p.recovery.test(text)) {
        this.updateStat(state.playerInner, "stress", -7);
        this.updateStat(state.playerInner, "composure", 8);
      }
      if (state.playerInner.stress >= 80) state.playerInner.condition = "Overwhelmed";
      else if (state.playerInner.stress >= 55) state.playerInner.condition = "On Edge";
      else if (state.playerInner.composure <= 35) state.playerInner.condition = "Depleted";
      else state.playerInner.condition = "Calm";
    }
  }

  // ---------------------------------------------------------------------------
  // CHARACTER / LOCATION CARD UPDATES
  // ---------------------------------------------------------------------------
  static npcStateBlock(name) {
    const npc = state.world.npcs[name];
    if (!npc) return "";
    const uc = this.strongestUndercurrent(name);
    const lines = [
      "--- EMERGENCE STATE ---",
      `Trust: ${Math.round(npc.trust)}/100 | Grudge: ${Math.round(npc.grudge)}/100 | Stress: ${Math.round(npc.stress)}/100`,
      `Threat: ${npc.threatState} | Bias: ${npc.cognitiveBias} | Attachment: ${npc.attachmentStyle}`,
      `Last seen: ${npc.lastSeenLocation || "Unknown"} (turn ${npc.lastSeenTurn || 0})`
    ];
    if (this.enabled("RomanceEngine") && npc.attraction > 0) lines.push(`Romance: ${this.relationshipStage(npc.attraction)} (${Math.round(npc.attraction)}/100)`);
    if (uc) lines.push(`Strongest Undercurrent: ${uc.value >= 0 ? "warmth" : "tension"} with ${uc.target} (${uc.value})`);
    if (npc.memories.length) lines.push(`Recent Memory: ${npc.memories[npc.memories.length - 1]}`);
    if (npc.coreMemory) lines.push(`Formative Memory: ${npc.coreMemory}`);
    if (this.enabled("InnerSelfSystem")) {
      if (npc.hiddenGoal !== "Not established") lines.push(`Goal: ${npc.hiddenGoal}`);
      if (npc.secret !== "Not established") lines.push(`Secret: ${npc.secret}`);
      if (npc.coreBelief !== "Not established") lines.push(`Belief: ${npc.coreBelief}`);
    }
    return lines.join("\n");
  }

  static updateNpcCard(name) {
    const card = this.getBoundNpcCard(name);
    if (!card) return;
    const stateBlock = this.npcStateBlock(name);
    let base = String(card.entry || "").split("--- EMERGENCE STATE ---")[0].trim();
    if (!base) base = `Name: ${name}`;
    let merged = `${base}\n\n${stateBlock}`;
    if (merged.length > 1800) merged = merged.slice(0, 1797) + "…";
    this.updateCardContent(card, merged);
  }

  static updateLocationCard(name) {
    if (!this.enabled("LocationAutoUpdate")) return;
    const card = this.getBoundLocationCard(name);
    const loc = state.world.locations[name];
    if (!card || !loc) return;
    const binding = state.emergence.locationBindings[name.toLowerCase()];
    // Never overwrite a user's pre-existing location lore; append/update a managed block.
    if (binding && !binding.generated) {
      const base = String(card.entry || "").split("--- EMERGENCE LOCATION STATE ---")[0].trim();
      const block = this.locationEntry(name, loc).replace("[EMERGENCE LOCATION]", "--- EMERGENCE LOCATION STATE ---");
      this.updateCardContent(card, `${base}\n\n${block}`.slice(0, 1800));
    } else {
      this.updateCardContent(card, this.locationEntry(name, loc));
    }
  }

  static flushDirtyCards(force = false) {
    const interval = this.intConfig("CardRefreshInterval", 5, 2, 20);
    if (!force && state.emergence.turnCount % interval !== 0) return;
    let count = 0;
    while (state.emergence.dirtyNpcs.length && count < 4) {
      const name = state.emergence.dirtyNpcs.shift();
      this.updateNpcCard(name);
      count++;
    }
    count = 0;
    while (state.emergence.dirtyLocations.length && count < 3) {
      const name = state.emergence.dirtyLocations.shift();
      this.updateLocationCard(name);
      count++;
    }
  }

  static generateCharacterCard(rawName) {
    const name = this.titleCase(rawName);
    if (!this.isPlausiblePersonName(name)) return `⚠️ “${rawName}” does not look like a valid character name.`;
    this.initializeNPC(name, { manual: true, force: true });
    const existing = this.getBoundNpcCard(name) || this.findCardByTitle(name);
    if (existing) {
      if (!this.getBoundNpcCard(name)) this.bindNpcCard(name, existing, false);
      this.updateNpcCard(name);
      return `✅ ${name} is already linked to a Story Card. EMERGENCE state has been synced without replacing your lore.`;
    }
    const template = `Name: ${name}\n\nBackground: [PENDING PROFILE]\nPersonality: [PENDING PROFILE]\nAppearance: [PENDING PROFILE]\nAbilities: [PENDING PROFILE]\nWeaknesses: [PENDING PROFILE]\nRelationships: [PENDING PROFILE]`;
    const card = this.createStoryCard(`eos-character:${name.toLowerCase()}, ${name.toLowerCase()}`, `${template}\n\n${this.npcStateBlock(name)}`.slice(0, 1800), "Character", name, "Generated by EMERGENCE OS. Profile fill only edits the generated profile section; existing user-made character cards are never profile-filled.");
    if (!card) return `⚠️ Could not create a Story Card for ${name}.`;
    state.world.npcs[name].generatedByEOS = true;
    this.bindNpcCard(name, card, true);
    if (!state.emergence.pendingProfileFill.some(x => x.name === name)) state.emergence.pendingProfileFill.push({ name, attempts: 0, createdTurn: state.emergence.turnCount });
    return `✅ Character Card created for ${name}. EMERGENCE OS will request a grounded profile fill without inventing unknown facts.`;
  }

  static buildProfileRequest() {
    const queue = state.emergence.pendingProfileFill;
    while (queue.length && (!state.world.npcs[queue[0].name] || !this.isGeneratedNpcCard(queue[0].name))) queue.shift();
    if (!queue.length) return "";
    const item = queue[0];
    if (item.attempts >= 4) { queue.shift(); return ""; }
    if (item.lastAttemptTurn === state.emergence.turnCount) return "";
    item.lastAttemptTurn = state.emergence.turnCount;
    item.attempts++;
    return `[EOS DATA REQUEST — do not narrate this. After the visible story response, output this hidden block using facts already established in context. For unknown original-character facts write UNKNOWN instead of inventing them.]\n<EOS_PROFILE>\nNAME: ${item.name}\nBACKGROUND: concise established background\nPERSONALITY: concise established personality\nAPPEARANCE: concise established appearance\nABILITIES: concise established abilities\nWEAKNESSES: concise established weaknesses\nRELATIONSHIPS: concise established relationships\nGOAL: established hidden/explicit goal or UNKNOWN\nSECRET: established secret or UNKNOWN\nBELIEF: established core belief or UNKNOWN\n</EOS_PROFILE>`;
  }

  static parseTagFields(block) {
    const out = {};
    String(block || "").split(/\r?\n/).forEach(line => {
      const m = line.match(/^([A-Z_]+):\s*(.*)$/);
      if (m) out[m[1].toLowerCase()] = m[2].trim();
    });
    return out;
  }

  static extractAllTags(text, tag) {
    const blocks = [];
    const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "gi");
    let cleaned = String(text || "").replace(re, (_, body) => { blocks.push(body); return ""; });
    // Hidden blocks are requested only after visible prose. If the model emits an
    // opening tag but forgets the closing tag, strip the dangling tail instead of
    // leaking script protocol into the story. Orphan tag markers are removed too.
    cleaned = cleaned.replace(new RegExp(`<${tag}>[\\s\\S]*$`, "i"), "");
    cleaned = cleaned.replace(new RegExp(`<\\/?${tag}>`, "gi"), "");
    return { text: cleaned.replace(/\n{3,}/g, "\n\n").trimEnd(), blocks };
  }

  static applyProfileFill(data) {
    const name = this.findNpcByName(data.name || "");
    if (!name || !this.isGeneratedNpcCard(name)) return;
    const card = this.getBoundNpcCard(name);
    if (!card) return;
    const safe = v => {
      const s = String(v || "").trim();
      return !s || /^unknown$/i.test(s) ? "Unknown / not established" : s.slice(0, 380);
    };
    const profile = [
      `Name: ${name}`,
      `Background: ${safe(data.background)}`,
      `Personality: ${safe(data.personality)}`,
      `Appearance: ${safe(data.appearance)}`,
      `Abilities: ${safe(data.abilities)}`,
      `Weaknesses: ${safe(data.weaknesses)}`,
      `Relationships: ${safe(data.relationships)}`
    ].join("\n");
    const npc = state.world.npcs[name];
    if (data.goal && !/^unknown$/i.test(data.goal)) npc.hiddenGoal = data.goal.slice(0, 220);
    if (data.secret && !/^unknown$/i.test(data.secret)) npc.secret = data.secret.slice(0, 220);
    if (data.belief && !/^unknown$/i.test(data.belief)) npc.coreBelief = data.belief.slice(0, 220);
    card.entry = `${profile}\n\n${this.npcStateBlock(name)}`.slice(0, 1800);
    state.emergence.pendingProfileFill = state.emergence.pendingProfileFill.filter(x => x.name !== name);
    this.markNpcDirty(name);
  }

  // ---------------------------------------------------------------------------
  // REFLECTIONS
  // ---------------------------------------------------------------------------
  static maybeQueueReflection() {
    if (!this.enabled("ReflectionSystem")) return;
    const interval = this.intConfig("ReflectionInterval", 8, 3, 50);
    const chance = this.intConfig("ReflectionChance", 35, 0, 100);
    const e = state.emergence;
    if (!e.sceneNames.length || e.turnCount % interval !== 0) return;
    const seed = parseInt(this.hashText(`${e.turnCount}:${e.sceneNames.join("|")}`), 36) % 100;
    if (seed >= chance) return;
    const name = e.sceneNames[seed % e.sceneNames.length];
    if (!e.pendingReflections.some(x => x.name === name)) e.pendingReflections.push({ name, attempts: 0 });
  }

  static buildReflectionRequest() {
    if (!this.enabled("ReflectionSystem") || !state.emergence.pendingReflections.length) return "";
    const item = state.emergence.pendingReflections[0];
    if (item.attempts >= 2) { state.emergence.pendingReflections.shift(); return ""; }
    if (item.lastAttemptTurn === state.emergence.turnCount) return "";
    item.lastAttemptTurn = state.emergence.turnCount;
    item.attempts++;
    const npc = state.world.npcs[item.name];
    if (!npc) { state.emergence.pendingReflections.shift(); return ""; }
    return `[EOS PRIVATE REFLECTION — do not narrate or reveal this. Append exactly one hidden block after the visible response.]\n<EOS_REFLECTION>\nNAME: ${item.name}\nTEXT: one first-person sentence grounded only in this scene; no invented secrets\n</EOS_REFLECTION>`;
  }

  static appendReflection(rawName, text) {
    const name = this.findNpcByName(rawName);
    if (!name || !text) return;
    const npc = state.world.npcs[name];
    const clean = String(text).replace(/\s+/g, " ").trim().slice(0, 500);
    if (!clean) return;
    const n = npc.reflections.length ? npc.reflections[npc.reflections.length - 1].n + 1 : 1;
    npc.reflections.push({ n, turn: state.emergence.turnCount, text: clean });
    while (npc.reflections.length > 20) npc.reflections.shift();
    state.emergence.pendingReflections = state.emergence.pendingReflections.filter(x => x.name !== name);
    this.syncReflectionCard(name);
  }

  static syncReflectionCard(name) {
    const cards = this.cardArray();
    if (!cards) return;
    const key = `eos-reflect:${name.toLowerCase()}`;
    const npc = state.world.npcs[name];
    const body = npc.reflections.map(r => `${r.n}. [Turn ${r.turn}] ${r.text}`).join("\n").slice(0, 1800);
    let card = this.findCardByKey(key);
    if (!card) card = this.createStoryCard(key, body, "Custom", `${name} — Private Reflections`, "Private player-facing archive generated by EMERGENCE OS. Not intended as character lore.");
    else card.entry = body;
  }

  // ---------------------------------------------------------------------------
  // FORMATIVE MEMORIES / RELATIONSHIP STAGES
  // ---------------------------------------------------------------------------
  static setFormativeMemory(name, memoryText, echoText) {
    const npc = state.world.npcs[name];
    if (!npc) return;
    npc.coreMemory = String(memoryText || "").slice(0, 300);
    this.markNpcDirty(name);
    if (echoText) this.recordLocationEcho(`${name}: ${this.excerpt(echoText, 100)}`);
  }

  static relationshipStage(attraction) {
    const a = Number(attraction) || 0;
    if (a >= 85) return "In Love";
    if (a >= 65) return "Deeply Attached";
    if (a >= 45) return "Strong Attraction";
    if (a >= 25) return "Interest";
    if (a > 0) return "Spark";
    return "Platonic";
  }

  static queueNudge(text) {
    if (!text) return;
    state.emergence.pendingNarrativeNudges.push({ text, turn: state.emergence.turnCount });
    while (state.emergence.pendingNarrativeNudges.length > 6) state.emergence.pendingNarrativeNudges.shift();
  }


  // ---------------------------------------------------------------------------
  // EXPANDED CONTINUITY KERNEL
  // ---------------------------------------------------------------------------
  // Larger vocabulary and deeper continuity are intentionally lazy/bounded.
  // Definitions add breadth without turning each 2-second AI Dungeon hook into
  // an expensive full-world simulation.

  static expandedLexicons() {
    if (this._expandedLexicons) return this._expandedLexicons;
    this._expandedLexicons = {
      objects: [
        "door",
        "doors",
        "doorway",
        "gate",
        "gates",
        "fence",
        "fences",
        "wall",
        "walls",
        "floor",
        "floors",
        "ceiling",
        "ceilings",
        "roof",
        "roofs",
        "stair",
        "stairs",
        "staircase",
        "corridor",
        "hallway",
        "hall",
        "room",
        "rooms",
        "chamber",
        "chambers",
        "bedroom",
        "bathroom",
        "restroom",
        "toilet",
        "kitchen",
        "lounge",
        "cellar",
        "basement",
        "attic",
        "balcony",
        "porch",
        "patio",
        "table",
        "tables",
        "desk",
        "desks",
        "chair",
        "chairs",
        "sofa",
        "couch",
        "bed",
        "beds",
        "shelf",
        "shelves",
        "cabinet",
        "cabinets",
        "cupboard",
        "dresser",
        "mirror",
        "mirrors",
        "window",
        "windows",
        "curtain",
        "curtains",
        "carpet",
        "rug",
        "lamp",
        "lamps",
        "candle",
        "candles",
        "torch",
        "torches",
        "fireplace",
        "hearth",
        "shirt",
        "shirts",
        "blouse",
        "jacket",
        "jackets",
        "coat",
        "coats",
        "cloak",
        "cloaks",
        "robe",
        "robes",
        "dress",
        "dresses",
        "skirt",
        "skirts",
        "pants",
        "trousers",
        "jeans",
        "shorts",
        "sweater",
        "sweaters",
        "hoodie",
        "hoodies",
        "uniform",
        "uniforms",
        "armor",
        "armour",
        "helmet",
        "helmets",
        "mask",
        "masks",
        "cape",
        "capes",
        "gloves",
        "boots",
        "shoes",
        "socks",
        "scarf",
        "belt",
        "belts",
        "tie",
        "ties",
        "phone",
        "phones",
        "smartphone",
        "tablet",
        "tablets",
        "laptop",
        "laptops",
        "computer",
        "computers",
        "monitor",
        "monitors",
        "screen",
        "screens",
        "keyboard",
        "keyboards",
        "mouse",
        "camera",
        "cameras",
        "radio",
        "radios",
        "television",
        "tv",
        "televisions",
        "speaker",
        "speakers",
        "headset",
        "headphones",
        "microphone",
        "microphones",
        "book",
        "books",
        "tome",
        "tomes",
        "journal",
        "journals",
        "diary",
        "diaries",
        "notebook",
        "notebooks",
        "letter",
        "letters",
        "note",
        "notes",
        "paper",
        "papers",
        "document",
        "documents",
        "file",
        "files",
        "folder",
        "folders",
        "map",
        "maps",
        "photograph",
        "photographs",
        "photo",
        "photos",
        "picture",
        "pictures",
        "painting",
        "paintings",
        "poster",
        "posters",
        "sword",
        "swords",
        "blade",
        "blades",
        "knife",
        "knives",
        "dagger",
        "daggers",
        "axe",
        "axes",
        "spear",
        "spears",
        "bow",
        "bows",
        "arrow",
        "arrows",
        "gun",
        "guns",
        "pistol",
        "pistols",
        "rifle",
        "rifles",
        "shotgun",
        "shotguns",
        "weapon",
        "weapons",
        "shield",
        "shields",
        "club",
        "clubs",
        "hammer",
        "hammers",
        "wand",
        "wands",
        "staff",
        "staffs",
        "ring",
        "rings",
        "necklace",
        "necklaces",
        "amulet",
        "amulets",
        "bracelet",
        "bracelets",
        "crown",
        "crowns",
        "key",
        "keys",
        "coin",
        "coins",
        "money",
        "wallet",
        "wallets",
        "purse",
        "purses",
        "bag",
        "bags",
        "backpack",
        "backpacks",
        "suitcase",
        "suitcases",
        "box",
        "boxes",
        "chest",
        "chests",
        "crate",
        "crates",
        "package",
        "packages",
        "parcel",
        "parcels",
        "bottle",
        "bottles",
        "glass",
        "glasses",
        "cup",
        "cups",
        "mug",
        "mugs",
        "plate",
        "plates",
        "bowl",
        "bowls",
        "fork",
        "forks",
        "spoon",
        "spoons",
        "cutlery",
        "food",
        "meal",
        "meals",
        "bread",
        "coffee",
        "tea",
        "water",
        "wine",
        "beer",
        "drink",
        "drinks",
        "car",
        "cars",
        "truck",
        "trucks",
        "van",
        "vans",
        "bus",
        "buses",
        "taxi",
        "taxis",
        "bike",
        "bikes",
        "bicycle",
        "bicycles",
        "motorcycle",
        "motorcycles",
        "scooter",
        "scooters",
        "train",
        "trains",
        "tram",
        "trams",
        "subway",
        "metro",
        "plane",
        "planes",
        "aircraft",
        "jet",
        "jets",
        "helicopter",
        "helicopters",
        "ship",
        "ships",
        "boat",
        "boats",
        "yacht",
        "yachts",
        "ferry",
        "ferries",
        "robot",
        "robots",
        "drone",
        "drones",
        "android",
        "androids",
        "machine",
        "machines",
        "device",
        "devices",
        "gadget",
        "gadgets",
        "terminal",
        "terminals",
        "console",
        "consoles",
        "server",
        "servers",
        "chip",
        "chips",
        "implant",
        "implants",
        "weaponry",
        "equipment",
        "tool",
        "tools",
        "tree",
        "trees",
        "bush",
        "bushes",
        "grass",
        "flower",
        "flowers",
        "rock",
        "rocks",
        "stone",
        "stones",
        "mountain",
        "mountains",
        "river",
        "rivers",
        "lake",
        "lakes",
        "ocean",
        "oceans",
        "sea",
        "seas",
        "beach",
        "beaches",
        "sand",
        "dirt",
        "mud",
        "snow",
        "rain",
        "fog",
        "cloud",
        "clouds",
        "sky",
        "sun",
        "moon",
        "star",
        "stars",
        "dog",
        "dogs",
        "cat",
        "cats",
        "horse",
        "horses",
        "cow",
        "cows",
        "bird",
        "birds",
        "raven",
        "ravens",
        "crow",
        "crows",
        "wolf",
        "wolves",
        "fox",
        "foxes",
        "bear",
        "bears",
        "snake",
        "snakes",
        "spider",
        "spiders",
        "animal",
        "animals",
        "company",
        "companies",
        "corporation",
        "corporations",
        "corp",
        "organization",
        "organisations",
        "organisation",
        "agency",
        "agencies",
        "department",
        "departments",
        "team",
        "teams",
        "squad",
        "squads",
        "army",
        "armies",
        "police",
        "government",
        "governments",
        "council",
        "councils",
        "guild",
        "guilds",
        "order",
        "orders",
        "faction",
        "factions",
        "story",
        "stories",
        "chapter",
        "chapters",
        "scene",
        "scenes",
        "paragraph",
        "paragraphs",
        "sentence",
        "sentences",
        "narrator",
        "narration",
        "player",
        "players",
        "character",
        "characters",
        "npc",
        "npcs",
        "system",
        "systems",
        "ai",
        "model",
        "models",
        "prompt",
        "prompts",
        "context",
        "memory",
        "memories",
        "card",
        "cards",
        "config",
        "configuration",
        "morning",
        "mornings",
        "afternoon",
        "afternoons",
        "evening",
        "evenings",
        "night",
        "nights",
        "midnight",
        "noon",
        "dawn",
        "dusk",
        "today",
        "tomorrow",
        "yesterday",
        "week",
        "weeks",
        "month",
        "months",
        "year",
        "years",
        "time",
        "times",
        "moment",
        "moments",
        "second",
        "seconds",
        "minute",
        "minutes",
        "hour",
        "hours",
        "fire",
        "fires",
        "flame",
        "flames",
        "smoke",
        "explosion",
        "explosions",
        "blast",
        "blasts",
        "rubble",
        "ruin",
        "ruins",
        "wreck",
        "wreckage",
        "debris",
        "blood",
        "darkness",
        "shadow",
        "shadows",
        "light",
        "lights",
        "sound",
        "sounds",
        "silence",
        "air",
        "wind",
        "winds",
      ],
      vehicles: [
        "batmobile",
        "batwing",
        "batcycle",
        "tumbler",
        "quinjet",
        "blackbird",
        "xwing",
        "x-wing",
        "tiefighter",
        "tie-fighter",
        "starfighter",
        "speeder",
        "landspeeder",
        "dropship",
        "gunship",
        "shuttle",
        "freighter",
        "cruiser",
        "destroyer",
        "carrier",
        "dreadnought",
        "corvette",
        "frigate",
        "submarine",
        "hovercraft",
        "mech",
        "walker",
        "tank",
        "apc",
        "rover",
        "buggy",
        "sedan",
        "coupe",
        "hatchback",
        "convertible",
        "limousine",
        "ambulance",
        "firetruck",
        "bulldozer",
        "excavator",
        "tractor",
        "trailer",
        "caravan",
        "motorhome",
        "rv",
        "pickup",
        "jeep",
        "suv",
        "minivan",
        "locomotive",
        "monorail",
        "trolley",
        "cablecar",
        "gondola",
        "elevator",
        "lift",
        "escalator",
      ],
      locations: [
        "city",
        "town",
        "village",
        "hamlet",
        "settlement",
        "kingdom",
        "realm",
        "nation",
        "empire",
        "republic",
        "country",
        "state",
        "province",
        "region",
        "district",
        "county",
        "borough",
        "neighborhood",
        "neighbourhood",
        "quarter",
        "ward",
        "island",
        "archipelago",
        "continent",
        "world",
        "planet",
        "moon",
        "colony",
        "station",
        "outpost",
        "forest",
        "woods",
        "jungle",
        "grove",
        "valley",
        "canyon",
        "ravine",
        "mountain",
        "mount",
        "peak",
        "hill",
        "hills",
        "plateau",
        "desert",
        "wasteland",
        "marsh",
        "swamp",
        "bog",
        "meadow",
        "field",
        "plains",
        "prairie",
        "tundra",
        "glacier",
        "cave",
        "cavern",
        "caverns",
        "mine",
        "quarry",
        "ruins",
        "river",
        "creek",
        "stream",
        "canal",
        "lake",
        "pond",
        "reservoir",
        "ocean",
        "sea",
        "bay",
        "gulf",
        "harbor",
        "harbour",
        "port",
        "dock",
        "docks",
        "marina",
        "beach",
        "coast",
        "shore",
        "cliff",
        "castle",
        "palace",
        "manor",
        "mansion",
        "estate",
        "house",
        "home",
        "apartment",
        "apartments",
        "flat",
        "flats",
        "penthouse",
        "tower",
        "fortress",
        "fort",
        "citadel",
        "keep",
        "temple",
        "shrine",
        "church",
        "cathedral",
        "chapel",
        "monastery",
        "abbey",
        "cemetery",
        "graveyard",
        "crypt",
        "tomb",
        "academy",
        "school",
        "university",
        "college",
        "campus",
        "hospital",
        "clinic",
        "infirmary",
        "asylum",
        "prison",
        "jail",
        "courthouse",
        "court",
        "barracks",
        "base",
        "bunker",
        "laboratory",
        "lab",
        "observatory",
        "factory",
        "warehouse",
        "office",
        "headquarters",
        "embassy",
        "consulate",
        "tavern",
        "inn",
        "hotel",
        "motel",
        "hostel",
        "bar",
        "pub",
        "cafe",
        "café",
        "restaurant",
        "diner",
        "bakery",
        "bookstore",
        "bookshop",
        "library",
        "shop",
        "store",
        "market",
        "mall",
        "supermarket",
        "club",
        "nightclub",
        "theater",
        "theatre",
        "cinema",
        "museum",
        "gallery",
        "arena",
        "stadium",
        "gym",
        "park",
        "plaza",
        "square",
        "garden",
        "farm",
        "ranch",
        "airport",
        "airfield",
        "hangar",
        "terminal",
        "garage",
        "carpark",
        "road",
        "street",
        "avenue",
        "lane",
        "alley",
        "highway",
        "motorway",
        "bridge",
        "tunnel",
        "intersection",
        "ship",
        "spaceship",
        "starship",
        "vessel",
        "deck",
        "cabin",
        "compartment",
        "cargobay",
        "cargo-bay",
        "engineroom",
        "engine-room",
        "medbay",
        "sickbay",
        "quarters",
        "schoolyard",
        "classroom",
        "cafeteria",
        "canteen",
        "dormitory",
        "dorm",
        "dorms",
        "lockerroom",
        "locker-room",
        "skyscraper",
        "rooftop",
        "roof",
        "lobby",
        "foyer",
        "atrium",
        "corridor",
        "hallway",
      ],
      roles: [
        "mr",
        "mrs",
        "ms",
        "miss",
        "mx",
        "dr",
        "doctor",
        "professor",
        "prof",
        "officer",
        "captain",
        "commander",
        "lieutenant",
        "sergeant",
        "corporal",
        "general",
        "admiral",
        "agent",
        "detective",
        "inspector",
        "constable",
        "deputy",
        "sheriff",
        "marshal",
        "chief",
        "mayor",
        "governor",
        "president",
        "minister",
        "senator",
        "representative",
        "judge",
        "justice",
        "attorney",
        "lawyer",
        "prosecutor",
        "defender",
        "king",
        "queen",
        "prince",
        "princess",
        "emperor",
        "empress",
        "duke",
        "duchess",
        "count",
        "countess",
        "baron",
        "baroness",
        "lord",
        "lady",
        "sir",
        "dame",
        "knight",
        "father",
        "mother",
        "brother",
        "sister",
        "reverend",
        "priest",
        "pastor",
        "bishop",
        "cardinal",
        "imam",
        "rabbi",
        "monk",
        "nun",
        "coach",
        "teacher",
        "tutor",
        "principal",
        "dean",
        "nurse",
        "surgeon",
        "medic",
        "paramedic",
        "bartender",
        "waiter",
        "waitress",
        "chef",
        "cook",
        "clerk",
        "cashier",
        "manager",
        "director",
        "ceo",
        "boss",
        "foreman",
        "guard",
        "soldier",
        "marine",
        "pilot",
        "driver",
        "engineer",
        "scientist",
        "technician",
        "mechanic",
        "hacker",
        "mercenary",
        "master",
        "mistress",
        "apprentice",
        "student",
        "warden",
        "keeper",
        "ranger",
        "hunter",
        "tracker",
        "scout",
      ],
      meta: [
        "story",
        "narrative",
        "narration",
        "narrator",
        "scene",
        "chapter",
        "paragraph",
        "prompt",
        "instruction",
        "instructions",
        "author",
        "authors",
        "note",
        "memory",
        "context",
        "frontmemory",
        "plot",
        "essentials",
        "storycard",
        "storycards",
        "card",
        "cards",
        "script",
        "scripts",
        "input",
        "output",
        "library",
        "modifier",
        "system",
        "ai",
        "model",
        "dungeon",
        "adventure",
        "scenario",
        "turn",
        "turns",
        "action",
        "actions",
        "response",
        "responses",
        "retry",
        "retries",
        "edit",
        "edits",
        "generation",
        "generations",
        "token",
        "tokens",
        "player",
        "user",
        "protagonist",
        "viewpoint",
        "pov",
        "camera",
        "prose",
        "dialogue",
        "description",
      ],
      temporal: [
        "today",
        "tomorrow",
        "yesterday",
        "tonight",
        "morning",
        "afternoon",
        "evening",
        "night",
        "midnight",
        "noon",
        "dawn",
        "sunrise",
        "sunset",
        "dusk",
        "twilight",
        "day",
        "days",
        "week",
        "weeks",
        "month",
        "months",
        "year",
        "years",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
        "spring",
        "summer",
        "autumn",
        "fall",
        "winter",
        "later",
        "earlier",
        "soon",
        "recently",
        "eventually",
        "immediately",
        "suddenly",
        "meanwhile",
        "afterward",
        "afterwards",
        "before",
        "after",
        "during",
        "while",
        "when",
        "then",
        "now",
        "once",
        "twice",
        "first",
        "second",
        "third",
        "next",
        "last",
        "previous",
        "current",
        "future",
        "past",
        "present",
      ],
      collectives: [
        "everyone",
        "everybody",
        "someone",
        "somebody",
        "anyone",
        "anybody",
        "nobody",
        "people",
        "crowd",
        "crowds",
        "group",
        "groups",
        "team",
        "teams",
        "squad",
        "squads",
        "family",
        "families",
        "police",
        "guards",
        "soldiers",
        "staff",
        "crew",
        "crews",
        "audience",
        "audiences",
        "class",
        "classes",
        "students",
        "workers",
        "customers",
        "patrons",
        "citizens",
        "villagers",
        "townsfolk",
        "survivors",
        "refugees",
        "enemies",
        "allies",
        "friends",
        "strangers",
      ]
    };
    return this._expandedLexicons;
  }

  static expandedLexiconSet(name) {
    if (!this._expandedLexiconSets) this._expandedLexiconSets = {};
    if (this._expandedLexiconSets[name]) return this._expandedLexiconSets[name];
    const map = {};
    (this.expandedLexicons()[name] || []).forEach(word => { map[String(word).toLowerCase()] = true; });
    this._expandedLexiconSets[name] = map;
    return map;
  }

  static knownPlayerNames() {
    const out = {};
    if (typeof info !== "undefined" && info && Array.isArray(info.characterNames)) {
      info.characterNames.forEach(name => {
        const n = this.cleanName(name).toLowerCase();
        if (n) out[n] = true;
      });
    }
    if (state && Array.isArray(state.placeholders)) {
      state.placeholders.forEach(p => {
        if (!p || !p.answer) return;
        const q = String(p.question || "").toLowerCase();
        if (!/(?:name|character|protagonist|player)/.test(q)) return;
        const n = this.cleanName(p.answer).toLowerCase();
        if (n) out[n] = true;
      });
    }
    return out;
  }

  static isPlayerControlledName(name) {
    const target = this.cleanName(name).toLowerCase();
    if (!target) return false;
    const players = this.knownPlayerNames();
    if (players[target]) return true;
    const first = target.split(/\s+/)[0];
    return Object.keys(players).some(k => k.split(/\s+/)[0] === first && first.length > 2);
  }

  static isExpandedNonPerson(name) {
    const n = this.cleanName(name).toLowerCase();
    if (!n) return true;
    const parts = n.split(/\s+/);
    const categories = ["objects", "vehicles", "meta", "temporal", "collectives"];
    for (let i = 0; i < categories.length; i++) {
      const set = this.expandedLexiconSet(categories[i]);
      if (set[n]) return true;
      if (parts.length === 1 && set[parts[0]]) return true;
    }
    return false;
  }

  static hasLocationTypeToken(name) {
    const parts = this.cleanName(name).toLowerCase().split(/\s+/);
    const set = this.expandedLexiconSet("locations");
    return parts.some(p => !!set[p]);
  }

  static isVehicleLikeName(name, surroundingText = "") {
    const n = this.cleanName(name);
    if (!n) return false;
    const lower = n.toLowerCase();
    const set = this.expandedLexiconSet("vehicles");
    if (set[lower] || lower.split(/\s+/).some(p => set[p])) return true;
    const escaped = this.escapeRegExp(n);
    return new RegExp(`\\b(?:vehicle|car|truck|van|motorcycle|bike|jet|aircraft|ship|boat|starship|spaceship|shuttle|cruiser|freighter|tank|mech|rover)\\s+(?:called|named)?\\s*${escaped}\\b|\\b(?:drive|drives|drove|pilot|pilots|flew|fly|flies|board|boards|boarded|park|parks|parked)\\s+(?:the\\s+)?${escaped}\\b`, "i").test(String(surroundingText || ""));
  }

  static rolePrefixPattern() {
    if (this._rolePrefixPattern) return this._rolePrefixPattern;
    const source = this.expandedLexicons().roles
      .filter(x => x.length > 1)
      .map(x => this.escapeRegExp(x).replace(/\\-/g, "[- ]"))
      .sort((a, b) => b.length - a.length)
      .join("|");
    this._rolePrefixPattern = new RegExp(`\\b(?:${source})\\.?\\s+([A-Z][A-Za-z0-9'’\\-]+(?:\\s+[A-Z][A-Za-z0-9'’\\-]+){0,2})\\b`, "gi");
    return this._rolePrefixPattern;
  }

  static registerAlias(alias, canonical) {
    if (!this.enabled("AliasDetection")) return;
    const a = this.cleanName(alias);
    const c = this.cleanName(canonical);
    if (!a || !c || !state.world.npcs[c] || a.toLowerCase() === c.toLowerCase()) return;
    if (this.isPlayerControlledName(a) || this.isExpandedNonPerson(a)) return;
    const key = a.toLowerCase();
    const existing = state.emergence.aliases[key];
    if (existing && existing !== c) {
      state.emergence.aliases[key] = "__ambiguous__";
      return;
    }
    const direct = Object.keys(state.world.npcs).filter(n => n.toLowerCase() === key || n.split(/\s+/)[0].toLowerCase() === key);
    if (direct.length > 1 || (direct.length === 1 && direct[0] !== c)) {
      state.emergence.aliases[key] = "__ambiguous__";
      return;
    }
    state.emergence.aliases[key] = c;
    const npc = state.world.npcs[c];
    if (npc.aliases.indexOf(a) < 0) {
      npc.aliases.push(a);
      while (npc.aliases.length > 8) npc.aliases.shift();
    }
  }

  static scanAliases(text) {
    if (!this.enabled("AliasDetection") || !text) return;
    const sample = String(text).slice(-5000);
    Object.keys(state.world.npcs).forEach(name => {
      const parts = name.split(/\s+/);
      if (parts.length < 2) return;
      if (!new RegExp(`\\b${this.escapeRegExp(name)}\\b`, "i").test(sample)) return;
      this.registerAlias(parts[0], name);
      const last = parts[parts.length - 1];
      if (last.length >= 3) this.registerAlias(last, name);
    });
  }

  static mentionRegexForNpc(name) {
    const npc = state.world.npcs[name];
    const forms = [name].concat(npc && Array.isArray(npc.aliases) ? npc.aliases : []);
    const seen = {};
    forms.forEach(f => { if (f) seen[String(f).toLowerCase()] = f; });
    const source = Object.keys(seen).map(k => this.escapeRegExp(seen[k])).sort((a,b) => b.length - a.length).join("|");
    return source ? new RegExp(`\\b(?:${source})\\b`, "i") : null;
  }

  static explicitExitForName(name, text) {
    const n = this.escapeRegExp(name);
    const verbs = "leave(?:s|ing)?|left|exit(?:s|ed|ing)?|depart(?:s|ed|ing)?|walk(?:s|ed|ing)? away|storm(?:s|ed|ing)? out|head(?:s|ed|ing)? out|drive(?:s|d|ing)? away|run(?:s|ning)? off|ran off|disappear(?:s|ed|ing)?|vanish(?:es|ed|ing)?";
    return new RegExp(`\\b${n}\\b[^.!?;]{0,30}\\b(?:${verbs})\\b|\\b(?:${verbs})[^.!?;]{0,30}\\b${n}\\b`, "i").test(String(text || ""));
  }

  static explicitArrivalForName(name, text) {
    const n = this.escapeRegExp(name);
    const verbs = "enter(?:s|ed|ing)?|arriv(?:e|es|ed|ing)|approach(?:es|ed|ing)?|return(?:s|ed|ing)?|appear(?:s|ed|ing)?|come(?:s|ing)? in|came in|walk(?:s|ed|ing)? in|step(?:s|ped|ping)? in|join(?:s|ed|ing)?";
    return new RegExp(`\\b${n}\\b[^.!?;]{0,28}\\b(?:${verbs})\\b|\\b(?:${verbs})[^.!?;]{0,28}\\b${n}\\b`, "i").test(String(text || ""));
  }

  static updateSceneRoster(text) {
    if (!this.enabled("SceneContinuity")) return this.getPresentSceneNames(text);
    const turn = state.emergence.turnCount || this.actionCount();
    const location = state.emergence.currentLocation;
    const sample = String(text || "");
    const persistence = this.intConfig("PresencePersistence", 2, 0, 4);
    const explicit = this.getPresentSceneNames(sample);
    const explicitMap = {};
    explicit.forEach(name => { explicitMap[name] = true; });

    Object.keys(state.world.npcs).forEach(name => {
      const key = name.toLowerCase();
      let item = state.emergence.sceneRoster[key];
      if (!item) item = state.emergence.sceneRoster[key] = { name, location: "", lastSeenTurn: -999, present: false, confidence: 0 };
      if (this.explicitExitForName(name, sample)) {
        item.present = false;
        item.confidence = 0;
        item.lastExitTurn = turn;
        return;
      }
      const arrived = this.explicitArrivalForName(name, sample);
      if (explicitMap[name] || arrived) {
        item.present = true;
        item.location = location;
        item.lastSeenTurn = turn;
        item.confidence = arrived ? 3 : Math.max(2, item.confidence || 0);
      } else if (item.present) {
        if (item.location !== location || turn - (item.lastSeenTurn || 0) > persistence) {
          item.present = false;
          item.confidence = 0;
        } else {
          item.confidence = Math.max(1, (item.confidence || 1) - 1);
        }
      }
    });

    const roster = this.sceneRosterNames();
    state.emergence.sceneNames = roster;
    if (turn !== state.emergence.runtimeStats.lastSceneTurn) {
      state.emergence.runtimeStats.lastSceneTurn = turn;
      const signature = `${location}|${roster.slice().sort().join(",")}`;
      const last = state.emergence.sceneHistory[state.emergence.sceneHistory.length - 1];
      if (!last || last.signature !== signature) {
        state.emergence.sceneHistory.push({ turn, location, names: roster.slice(0, 12), signature });
        while (state.emergence.sceneHistory.length > 24) state.emergence.sceneHistory.shift();
      }
    }
    return roster;
  }

  static sceneRosterNames() {
    if (!this.enabled("SceneContinuity")) return state.emergence.sceneNames || [];
    const location = state.emergence.currentLocation;
    return Object.keys(state.emergence.sceneRoster).map(k => state.emergence.sceneRoster[k]).filter(item =>
      item && item.present && item.location === location && state.world.npcs[item.name]
    ).map(item => item.name);
  }

  static eventCatalog() {
    if (this._eventCatalog) return this._eventCatalog;
    const make = source => new RegExp(`\\b(?:${source})\\b`, "i");
    this._eventCatalog = [
      { type: "apology", re: make("apologi[sz](?:e|es|ed|ing)?|say(?:s|ing)? sorry|ask(?:s|ed|ing)? forgiveness|beg(?:s|ged|ging)? forgiveness|make(?:s|d|ing)? amends"), trust: 4, grudge: -8, stress: -4, respect: 3, salience: 4 },
      { type: "gratitude", re: make("thank(?:s|ed|ing)?|show(?:s|ed|ing)? gratitude|express(?:es|ed|ing)? gratitude|appreciat(?:e|es|ed|ing)"), trust: 3, grudge: -2, respect: 4, salience: 2 },
      { type: "promise", re: make("promise(?:s|d|ing)?|swear(?:s|ing)?|swore|vow(?:s|ed|ing)?|give(?:s|n|ing)? (?:my|your) word"), trust: 2, respect: 2, salience: 5, commitment: true },
      { type: "forgiveness", re: make("forgiv(?:e|es|en|ing)|accept(?:s|ed|ing)? (?:the |your |my )?apolog(?:y|ies)|pardon(?:s|ed|ing)?|let(?:s|ting)? it go"), trust: 5, grudge: -10, stress: -5, salience: 5 },
      { type: "rescue", re: make("rescu(?:e|es|ed|ing)|save(?:s|d|ing)?|pull(?:s|ed|ing)? .* to safety|shield(?:s|ed|ing)? .* from|defend(?:s|ed|ing)? .* from|protect(?:s|ed|ing)? .* from"), trust: 8, grudge: -4, respect: 7, fear: -3, salience: 7 },
      { type: "comfort", re: make("comfort(?:s|ed|ing)?|reassur(?:e|es|ed|ing)|consol(?:e|es|ed|ing)|calm(?:s|ed|ing)?|stay(?:s|ed|ing)? with"), trust: 4, stress: -7, respect: 2, salience: 3 },
      { type: "gift", re: make("giv(?:e|es|ing)|gave|offer(?:s|ed|ing)?|hand(?:s|ed|ing)?|gift(?:s|ed|ing)?|bring(?:s|ing)?|brought"), trust: 2, respect: 1, salience: 2, requiresGiftObject: true },
      { type: "rejection", re: make("reject(?:s|ed|ing)?|turn(?:s|ed|ing)? .* down|refus(?:e|es|ed|ing)? .* (?:kiss|date|romance|advance)|push(?:es|ed|ing)? .* away"), attraction: -8, stress: 4, salience: 4 },
      { type: "abandonment", re: make("abandon(?:s|ed|ing)?|leave(?:s|ing)? .* behind|left .* behind|walk(?:s|ed|ing)? out on|desert(?:s|ed|ing)?"), trust: -12, grudge: 12, stress: 10, salience: 7 },
      { type: "boundary", re: make("set(?:s|ting)? a boundary|ask(?:s|ed|ing)? .* to stop|tell(?:s|ing)? .* to stop|told .* to stop|say(?:s|ing)? no|said no|refus(?:e|es|ed|ing)?"), salience: 5, boundary: true },
      { type: "boundary_violation", re: make("ignore(?:s|d|ing)? .* boundary|ignore(?:s|d|ing)? .* (?:no|refusal)|keep(?:s|ing)? pushing|kept pushing|force(?:s|d|ing)? anyway|refus(?:e|es|ed|ing)? to stop"), trust: -14, grudge: 16, stress: 14, respect: -12, fear: 7, salience: 8 },
      { type: "confession", re: make("confess(?:es|ed|ing)?|admit(?:s|ted|ting)?|tell(?:s|ing)? the truth|told the truth|come(?:s|ing)? clean|came clean"), trust: 4, respect: 3, salience: 5 },
      { type: "secret_share", re: make("confid(?:e|es|ed|ing)|share(?:s|d|ing)? a secret|tell(?:s|ing)? .* in confidence|trust(?:s|ed|ing)? .* with"), trust: 5, respect: 2, salience: 5 },
      { type: "insult", re: make("insult(?:s|ed|ing)?|mock(?:s|ed|ing)?|humiliat(?:e|es|ed|ing)|belittl(?:e|es|ed|ing)|ridicul(?:e|es|ed|ing)"), trust: -6, grudge: 7, stress: 5, respect: -8, salience: 4 },
      { type: "threat", re: make("threaten(?:s|ed|ing)?|intimidat(?:e|es|ed|ing)|blackmail(?:s|ed|ing)?"), trust: -9, grudge: 10, stress: 9, respect: -6, fear: 8, salience: 6 },
      { type: "rescue_failure", re: make("fail(?:s|ed|ing)? to help|leave(?:s|ing)? .* to die|left .* to die|refus(?:e|es|ed|ing)? to help|stand(?:s|ing)? by while|stood by while"), trust: -10, grudge: 9, stress: 7, respect: -8, salience: 7 }
    ];
    return this._eventCatalog;
  }

  static giftObjectPattern() {
    if (!this._giftObjectPattern) this._giftObjectPattern = /\b(?:gift|present|flower|flowers|rose|roses|ring|necklace|bracelet|book|letter|note|food|meal|drink|coffee|tea|money|coin|coins|key|weapon|sword|knife|phone|photo|photograph|jacket|coat|medicine|medication)\b/i;
    return this._giftObjectPattern;
  }

  static directedClauseHits(clause, target, eventRe) {
    const t = this.escapeRegExp(target);
    const source = eventRe.source;
    const a = new RegExp(`\\b(?:you|i)\\b[^.!?;]{0,24}(?:${source})[^.!?;]{0,60}\\b${t}\\b`, "i");
    const b = new RegExp(`\\b(?:you|i)\\b[^.!?;]{0,18}\\b${t}\\b[^.!?;]{0,28}(?:${source})`, "i");
    const c = new RegExp(`\\b(?:${source})[^.!?;]{0,20}\\b(?:to|for|at|with|toward|towards)\\s+${t}\\b`, "i");
    return a.test(clause) || b.test(clause) || c.test(clause);
  }

  static extractNuancedPlayerEvents(inputText) {
    if (!this.enabled("RelationshipNuance") || !inputText) return [];
    const clauses = this.splitClauses(inputText);
    const names = Object.keys(state.world.npcs);
    const catalog = this.eventCatalog();
    const events = [];
    clauses.forEach(clause => {
      if (!/\b(?:you|i)\b/i.test(clause)) return;
      const mentioned = names.filter(name => {
        const re = this.mentionRegexForNpc(name);
        return re && re.test(clause);
      });
      mentioned.forEach(target => {
        catalog.forEach(def => {
          def.re.lastIndex = 0;
          if (!def.re.test(clause) || !this.directedClauseHits(clause, target, def.re)) return;
          if (def.requiresGiftObject && !this.giftObjectPattern().test(clause)) return;
          const core = this.targetedPlayerEvents(clause);
          let soft = false;
          if ((def.type === "insult" || def.type === "threat") && core.some(x => x.target === target && x.type === "coercion")) return;
          if (["rescue","comfort","apology","gratitude"].indexOf(def.type) >= 0 && core.some(x => x.target === target && x.type === "respect")) soft = true;
          events.push({ target, def, clause, soft });
        });
      });
    });
    return events;
  }

  static eventFingerprint(target, type, clause) {
    return `${this.actionCount()}:${String(target).toLowerCase()}:${type}:${this.hashText(clause)}`;
  }

  static rememberEventFingerprint(fp) {
    const turn = state.emergence.turnCount || this.actionCount();
    state.emergence.recentEventHashes[fp] = turn;
    Object.keys(state.emergence.recentEventHashes).forEach(key => {
      if (turn - state.emergence.recentEventHashes[key] > 8) delete state.emergence.recentEventHashes[key];
    });
  }

  static memoryLedgerLimit() {
    return state.emergence.config.MemoryDepth === "Light" ? 8 : state.emergence.config.MemoryDepth === "Deep" ? 24 : 14;
  }

  static recordStructuredMemory(name, type, text, salience = 3, source = "story") {
    const npc = state.world.npcs[name];
    if (!npc || !text) return;
    this.normalizeNpc(name);
    const excerpt = this.excerpt(text, 150);
    const hash = `${type}:${this.hashText(excerpt.toLowerCase())}`;
    const last = npc.memoryLedger[npc.memoryLedger.length - 1];
    if (last && last.hash === hash) return;
    npc.memoryLedger.push({
      turn: state.emergence.turnCount || this.actionCount(),
      location: state.emergence.currentLocation,
      type, text: excerpt,
      salience: Math.max(1, Math.min(10, salience)),
      source, hash
    });
    const cap = this.memoryLedgerLimit();
    if (npc.memoryLedger.length > cap) {
      const ranked = npc.memoryLedger.map((m, i) => ({m, i, rank:(m.salience || 1) * 1000 + i}))
        .sort((a,b) => b.rank - a.rank).slice(0, cap).sort((a,b) => a.i - b.i);
      npc.memoryLedger = ranked.map(x => x.m);
    }
    this.pushMemory(npc, `${type}: ${excerpt}`);
  }

  static addGlobalEvent(name, type, text, salience = 3) {
    state.emergence.eventLedger.push({
      turn: state.emergence.turnCount || this.actionCount(),
      npc: name, type,
      location: state.emergence.currentLocation,
      text: this.excerpt(text, 160),
      salience
    });
    const cap = this.intConfig("MaxEventLedger", 90, 30, 160);
    if (state.emergence.eventLedger.length > cap) {
      const removed = state.emergence.eventLedger.length - cap;
      state.emergence.eventLedger.splice(0, removed);
      state.emergence.runtimeStats.prunedEvents += removed;
    }
  }

  static addCommitment(name, clause) {
    const npc = state.world.npcs[name];
    if (!npc) return;
    const value = this.excerpt(clause, 120);
    const hash = this.hashText(value.toLowerCase());
    if (npc.commitments.some(c => c.hash === hash && c.status === "open")) return;
    npc.commitments.push({hash, text:value, turn:state.emergence.turnCount, status:"open"});
    while (npc.commitments.length > 8) npc.commitments.shift();
  }

  static recordBoundary(name, clause) {
    const npc = state.world.npcs[name];
    if (!npc) return;
    const value = this.excerpt(clause, 120);
    const hash = this.hashText(value.toLowerCase());
    if (npc.boundaries.some(b => b.hash === hash)) return;
    npc.boundaries.push({hash, text:value, turn:state.emergence.turnCount});
    while (npc.boundaries.length > 8) npc.boundaries.shift();
  }

  static recalculateRelationshipTone(name) {
    const npc = state.world.npcs[name];
    if (!npc) return "Neutral";
    let tone = "Neutral";
    if (npc.grudge >= 70 || npc.trust <= 20) tone = "Hostile";
    else if (npc.fear >= 65 && npc.trust < 50) tone = "Wary";
    else if (npc.trust >= 78 && npc.grudge <= 15) tone = npc.attraction >= 60 ? "Intimate" : "Trusted";
    else if (npc.attraction >= 45 && npc.trust >= 45) tone = "Drawn";
    else if (npc.respect >= 70 && npc.trust >= 55) tone = "Respectful";
    else if (npc.grudge >= 35) tone = "Strained";
    else if (npc.trust >= 60) tone = "Warm";
    else if (npc.familiarity < 20) tone = "Unfamiliar";
    npc.relationshipTone = tone;
    return tone;
  }

  static applyNuancedPlayerEvents(inputText) {
    this.extractNuancedPlayerEvents(inputText).forEach(ev => {
      const fp = this.eventFingerprint(ev.target, ev.def.type, ev.clause);
      if (state.emergence.recentEventHashes[fp]) return;
      this.rememberEventFingerprint(fp);
      const npc = state.world.npcs[ev.target];
      if (!npc) return;
      const factor = ev.soft ? 0.35 : 1;
      const d = ev.def;
      if (this.enabled("GrudgeTracking")) {
        if (d.trust) this.updateStat(npc, "trust", Math.round(d.trust * factor));
        if (d.grudge) this.updateStat(npc, "grudge", Math.round(d.grudge * factor));
      }
      if (d.stress) this.updateStat(npc, "stress", Math.round(d.stress * factor));
      if (d.respect) this.updateStat(npc, "respect", Math.round(d.respect * factor));
      if (d.fear) this.updateStat(npc, "fear", Math.round(d.fear * factor));
      if (d.attraction && this.enabled("RomanceEngine")) this.updateStat(npc, "attraction", Math.round(d.attraction * factor));
      this.updateStat(npc, "familiarity", Math.max(1, Math.round(2 * factor)));
      if (d.commitment) this.addCommitment(ev.target, ev.clause);
      if (d.boundary) this.recordBoundary(ev.target, ev.clause);
      this.recordStructuredMemory(ev.target, d.type, ev.clause, d.salience || 3, "player");
      this.addGlobalEvent(ev.target, d.type, ev.clause, d.salience || 3);
      this.recalculateRelationshipTone(ev.target);
      this.updateThreatState(ev.target);
      this.markNpcDirty(ev.target);
    });
  }

  static relationshipSnapshot(name) {
    const npc = state.world.npcs[name];
    if (!npc) return null;
    return {
      trust:Math.round(npc.trust), grudge:Math.round(npc.grudge), attraction:Math.round(npc.attraction),
      respect:Math.round(npc.respect), fear:Math.round(npc.fear), familiarity:Math.round(npc.familiarity),
      tone:this.recalculateRelationshipTone(name)
    };
  }

  static trackRelationshipSnapshot(name, reason) {
    const snap = this.relationshipSnapshot(name);
    if (!snap) return;
    const signature = `${name}|${snap.tone}|${Math.floor(snap.trust/10)}|${Math.floor(snap.grudge/10)}|${Math.floor(snap.attraction/10)}`;
    const last = state.emergence.relationshipHistory[state.emergence.relationshipHistory.length - 1];
    if (last && last.signature === signature) return;
    state.emergence.relationshipHistory.push({turn:state.emergence.turnCount, name, reason:reason || "", snapshot:snap, signature});
    while (state.emergence.relationshipHistory.length > 60) state.emergence.relationshipHistory.shift();
  }

  static noteNpcMention(name) {
    const npc = state.world.npcs[name];
    if (npc) npc.mentionCount = (npc.mentionCount || 0) + 1;
  }

  static noteNpcScene(name) {
    const npc = state.world.npcs[name];
    if (!npc) return;
    if (npc._lastSceneCountTurn !== state.emergence.turnCount) {
      npc.sceneCount = (npc.sceneCount || 0) + 1;
      npc._lastSceneCountTurn = state.emergence.turnCount;
      this.updateStat(npc, "familiarity", 1);
    }
  }

  static updateLocationVisit(name, occupants) {
    const loc = state.world.locations[name];
    if (!loc) return;
    if (loc._lastVisitTurn !== state.emergence.turnCount) {
      loc.visitCount = (loc.visitCount || 0) + 1;
      loc._lastVisitTurn = state.emergence.turnCount;
    }
    (occupants || []).forEach(n => { if (loc.recentOccupants.indexOf(n) < 0) loc.recentOccupants.push(n); });
    while (loc.recentOccupants.length > 10) loc.recentOccupants.shift();
  }

  static strongestStructuredMemories(name, limit = 3) {
    const npc = state.world.npcs[name];
    if (!npc || !npc.memoryLedger.length) return [];
    return npc.memoryLedger.slice().sort((a,b) =>
      ((b.salience || 1) * 1000 + (b.turn || 0)) - ((a.salience || 1) * 1000 + (a.turn || 0))
    ).slice(0, limit);
  }

  static continuityLineForNpc(name) {
    const npc = state.world.npcs[name];
    if (!npc) return "";
    const detail = state.emergence.config.ContextDetail;
    let line = `${name}: ${this.recalculateRelationshipTone(name)}; trust ${Math.round(npc.trust)}, grudge ${Math.round(npc.grudge)}`;
    if (detail !== "Lean") {
      if (npc.respect <= 30 || npc.respect >= 70) line += `, respect ${Math.round(npc.respect)}`;
      if (npc.fear >= 35) line += `, fear ${Math.round(npc.fear)}`;
      if (this.enabled("RomanceEngine") && npc.attraction >= 25) line += `, ${this.relationshipStage(npc.attraction)}`;
    }
    if (detail === "Rich") {
      const mem = this.strongestStructuredMemories(name, 1)[0];
      if (mem && mem.salience >= 5) line += `; remembers ${this.excerpt(mem.text, 70)}`;
      const open = npc.commitments.filter(c => c.status === "open").slice(-1)[0];
      if (open) line += `; open promise: ${this.excerpt(open.text, 60)}`;
    }
    return line;
  }

  static boundedActiveNpcNames() {
    const roster = this.sceneRosterNames();
    if (roster.length) return roster.slice(0, 8);
    return Object.keys(state.world.npcs)
      .sort((a,b) => (state.world.npcs[b].lastSeenTurn || 0) - (state.world.npcs[a].lastSeenTurn || 0))
      .slice(0, 6);
  }

  static repairExpandedState() {
    if (!this.enabled("StateRepair")) return;
    const turn = state.emergence.turnCount || this.actionCount();
    if (state.emergence.runtimeStats.lastRepairTurn === turn) return;
    state.emergence.runtimeStats.lastRepairTurn = turn;
    let repairs = 0;
    Object.keys(state.world.npcs).forEach(name => {
      const npc = this.normalizeNpc(name);
      ["trust","grudge","stress","composure","attraction","respect","fear","familiarity"].forEach(key => {
        const before = npc[key];
        npc[key] = this.clamp(npc[key], 0, 100);
        if (before !== npc[key]) repairs++;
      });
      Object.keys(npc.undercurrents).forEach(target => {
        if (!state.world.npcs[target] || target === name) { delete npc.undercurrents[target]; repairs++; }
        else npc.undercurrents[target] = Math.max(-100, Math.min(100, Number(npc.undercurrents[target]) || 0));
      });
      this.recalculateRelationshipTone(name);
    });
    Object.keys(state.emergence.aliases).forEach(alias => {
      const target = state.emergence.aliases[alias];
      if (target !== "__ambiguous__" && !state.world.npcs[target]) { delete state.emergence.aliases[alias]; repairs++; }
    });
    Object.keys(state.emergence.sceneRoster).forEach(key => {
      const item = state.emergence.sceneRoster[key];
      if (!item || !state.world.npcs[item.name]) { delete state.emergence.sceneRoster[key]; repairs++; }
    });
    const before = Object.keys(state.emergence.nameCandidates).length + Object.keys(state.emergence.locationCandidates).length;
    Object.keys(state.emergence.nameCandidates).forEach(key => {
      const c = state.emergence.nameCandidates[key];
      if (!c || turn - (c.lastTurn || 0) > 16 || this.isExpandedNonPerson(c.name) || this.isPlayerControlledName(c.name)) delete state.emergence.nameCandidates[key];
    });
    Object.keys(state.emergence.locationCandidates).forEach(key => {
      const c = state.emergence.locationCandidates[key];
      if (!c || turn - (c.lastTurn || 0) > 20) delete state.emergence.locationCandidates[key];
    });
    const after = Object.keys(state.emergence.nameCandidates).length + Object.keys(state.emergence.locationCandidates).length;
    state.emergence.runtimeStats.prunedCandidates += before - after;
    state.emergence.runtimeStats.repairs += repairs;
    if (repairs && this.enabled("DebugMode")) this.debug(`State repair adjusted ${repairs} item(s).`);
  }

  static pruneExpandedState() {
    const cap = this.intConfig("MaxEventLedger", 90, 30, 160);
    if (state.emergence.eventLedger.length > cap) state.emergence.eventLedger = state.emergence.eventLedger.slice(-cap);
    if (state.emergence.sceneHistory.length > 24) state.emergence.sceneHistory = state.emergence.sceneHistory.slice(-24);
    if (state.emergence.relationshipHistory.length > 60) state.emergence.relationshipHistory = state.emergence.relationshipHistory.slice(-60);
    if (state.emergence.gossipLog.length > 16) state.emergence.gossipLog = state.emergence.gossipLog.slice(-16);
    if (state.emergence.debugLog.length > 30) state.emergence.debugLog = state.emergence.debugLog.slice(-30);
  }

  static runExpandedMaintenance(turnCount) {
    if (!turnCount) return;
    if (turnCount % 5 === 0) {
      this.repairExpandedState();
      this.pruneExpandedState();
    }
    if (turnCount % 3 === 0) this.boundedActiveNpcNames().forEach(name => this.recalculateRelationshipTone(name));
  }

  static expandedDiagnostics() {
    const e = state.emergence;
    return [
      `Schema ${e.schemaVersion || 3}`,
      `Scene roster ${this.sceneRosterNames().length} active / ${Object.keys(e.sceneRoster || {}).length} cached`,
      `Aliases ${Object.keys(e.aliases || {}).filter(k => e.aliases[k] !== "__ambiguous__").length} usable`,
      `Events ${(e.eventLedger || []).length} / ${this.intConfig("MaxEventLedger", 90, 30, 160)}`,
      `Repairs ${e.runtimeStats ? e.runtimeStats.repairs : 0} | Pruned candidates ${e.runtimeStats ? e.runtimeStats.prunedCandidates : 0}`
    ].join("\n");
  }

  // ---------------------------------------------------------------------------
  // GENRE / PERIODIC MAINTENANCE
  // ---------------------------------------------------------------------------
  static genreDefinitions() {
    if (this._genreDefs) return this._genreDefs;
    this._genreDefs = {
      Superhero: ["superhero", "villain", "cape", "powers", "metahuman", "mutant", "vigilante"],
      "Sci-Fi": ["spaceship", "starship", "laser", "orbit", "galaxy", "android", "alien", "warp", "space station"],
      Horror: ["horror", "haunted", "corpse", "monster", "dread", "ritual", "possessed", "nightmare"],
      Fantasy: ["magic", "wizard", "dragon", "kingdom", "sorcerer", "elf", "dwarf", "spell", "enchanted"],
      Cyberpunk: ["cyberpunk", "neon", "implant", "megacorp", "cyberware", "netrunner", "chrome"],
      Western: ["sheriff", "saloon", "cowboy", "outlaw", "frontier", "revolver", "ranch"],
      Noir: ["detective", "noir", "private eye", "femme fatale", "rain-soaked", "case file", "speakeasy"],
      Modern: ["phone", "text message", "apartment", "coffee shop", "office", "car", "internet"]
    };
    return this._genreDefs;
  }

  static detectGenre(text) {
    if (state.emergence.config.Genre !== "Auto") return state.emergence.config.Genre;
    const sample = String(text || "").toLowerCase().slice(-6000);
    const defs = this.genreDefinitions();
    let best = state.emergence.detectedGenre || "Modern";
    let high = 0;
    Object.keys(defs).forEach(genre => {
      let score = 0;
      defs[genre].forEach(term => {
        const re = new RegExp(`\\b${this.escapeRegExp(term)}\\b`, "i");
        if (re.test(sample)) score++;
      });
      state.emergence.genreScores[genre] = Math.max(0, (state.emergence.genreScores[genre] || 0) * 0.75 + score);
      if (state.emergence.genreScores[genre] > high) { high = state.emergence.genreScores[genre]; best = genre; }
    });
    state.emergence.detectedGenre = best;
    return best;
  }

  static activeGenre() {
    return state.emergence.config.Genre === "Auto" ? state.emergence.detectedGenre : state.emergence.config.Genre;
  }

  static decaySocialState() {
    Object.keys(state.world.npcs).forEach(name => {
      const npc = state.world.npcs[name];
      if (this.enabled("GrudgeTracking") && npc.grudge > 0) this.updateStat(npc, "grudge", -1);
      if (npc.stress > 10) this.updateStat(npc, "stress", -2);
      if (npc.composure < 100) this.updateStat(npc, "composure", 3);
      if (this.enabled("LivingWorldEngine")) {
        Object.keys(npc.undercurrents).forEach(target => {
          const v = npc.undercurrents[target];
          if (v > 0) npc.undercurrents[target] = Math.max(0, v - 1);
          else if (v < 0) npc.undercurrents[target] = Math.min(0, v + 1);
        });
      }
      this.updateThreatState(name);
      this.markNpcDirty(name);
    });
  }

  static runPeriodicMaintenance(turnCount, contextText) {
    if (!turnCount) return;
    if (state.emergence.lastMaintenanceAction === turnCount) return;
    state.emergence.lastMaintenanceAction = turnCount;
    if (turnCount <= 3 || turnCount % 8 === 0) this.detectGenre(contextText);
    if (turnCount % 4 === 0) this.decaySocialState();
    if (turnCount % 7 === 0) this.spreadReputation();
    this.runExpandedMaintenance(turnCount);
    this.maybeQueueReflection();
    this.flushDirtyCards(false);
  }

  // ---------------------------------------------------------------------------
  // OUTPUT PROCESSING (IDEMPOTENT)
  // ---------------------------------------------------------------------------
  static processOutput(visibleText) {
    this.init();
    // Key output mutation to platform actionCount + visible response hash. History
    // length can change between hook phases/retries, so it is intentionally not
    // part of this guard.
    const stamp = `out:${this.actionCount()}:${this.hashText(state.emergence.lastPlayerInput || "")}:${this.hashText(visibleText)}`;
    if (stamp === state.emergence.lastOutputStamp) return;
    state.emergence.lastOutputStamp = stamp;

    const combined = `${state.emergence.lastPlayerInput || ""}\n${visibleText || ""}`;
    // Locations claim names before character detection.
    this.discoverLocations(combined);
    this.discoverCharacters(combined);
    this.scanAliases(combined);
    this.processNpcPresence(visibleText);
    this.applyPlayerInteractions(state.emergence.lastPlayerInput || "", combined);
    this.applyNuancedPlayerEvents(state.emergence.lastPlayerInput || "");

    // Earned security responds to the targeted interaction once, not to passive presence.
    this.targetedPlayerEvents(state.emergence.lastPlayerInput || "").forEach(ev => this.updateEarnedSecurity(ev.target, ev.type));

    this.updateUndercurrents(visibleText);
    this.updateLocationConditions(visibleText);
    this.updateWorldState(combined);
    if (state.emergence.currentLocation !== "Unknown Location" && state.world.locations[state.emergence.currentLocation]) {
      this.updateLocationVisit(state.emergence.currentLocation, this.sceneRosterNames());
    }
    this.sceneRosterNames().forEach(name => this.trackRelationshipSnapshot(name, "scene"));
    this.flushDirtyCards(false);
  }

  // ---------------------------------------------------------------------------
  // SCRIPT-MANAGED CONTEXT
  // ---------------------------------------------------------------------------
  static removeManagedBlock(text) {
    return String(text || "").replace(/\n?\[\[EMERGENCE_OS_BEGIN\]\][\s\S]*?\[\[EMERGENCE_OS_END\]\]\n?/g, "\n").trim();
  }

  static compactNpcLine(name) {
    const npc = state.world.npcs[name];
    if (!npc) return "";
    let line = `${name}: trust ${Math.round(npc.trust)}, grudge ${Math.round(npc.grudge)}, ${npc.threatState}`;
    if (npc.cognitiveBias !== "Unclear") line += `, ${npc.cognitiveBias}`;
    if (this.enabled("RomanceEngine") && npc.attraction >= 25) line += `, ${this.relationshipStage(npc.attraction)}`;
    return line;
  }

  static buildManagedContext() {
    const e = state.emergence;
    const lines = [];
    lines.push(`EMERGENCE OS | ${this.activeGenre()} | ${e.config.DialogueStyle}`);
    lines.push("Keep NPCs self-directed: preserve established motives, boundaries, memory and continuity. Never write the player's dialogue, thoughts, choices or voluntary actions for them.");
    if (this.enabled("HumanAgency")) lines.push(`NPC agency ${e.config.AutonomyLevel}: refusal, negotiation or withdrawal are valid when demands are unearned; trust and leverage matter.`);
    if (this.enabled("PlayerTrauma") && state.playerInner.stress >= 65) lines.push(`Player stress is high (${Math.round(state.playerInner.stress)}): let perception/body cues show strain without dictating feelings or choices.`);
    if (e.currentLocation !== "Unknown Location" && state.world.locations[e.currentLocation]) {
      const loc = state.world.locations[e.currentLocation];
      lines.push(`Location: ${e.currentLocation} — ${loc.condition}, ${this.locationAtmosphere(loc)}.`);
    }
    if (this.enabled("NpcColorNotes") && e.sceneNames.length) {
      const active = this.enabled("SceneContinuity") ? this.sceneRosterNames() : e.sceneNames;
      active.slice(0, e.config.ContextDetail === "Rich" ? 5 : 4).forEach(name => {
        lines.push(this.enabled("RelationshipNuance") ? this.continuityLineForNpc(name) : this.compactNpcLine(name));
      });
    }
    if (this.enabled("LivingWorldEngine") && e.config.ProtagonistInvolvement !== "Low" && e.gossipLog.length) lines.push(`Social undercurrent: ${e.gossipLog[e.gossipLog.length - 1]}`);
    if (e.pendingNarrativeNudges.length) {
      const nudge = e.pendingNarrativeNudges.shift();
      lines.push(`Continuity nudge: ${nudge.text}`);
    }
    const profile = this.buildProfileRequest();
    if (profile) lines.push(profile);
    else {
      const reflection = this.buildReflectionRequest();
      if (reflection) lines.push(reflection);
    }
    let body = lines.filter(Boolean).join("\n");
    // Front Memory is always included in full, so keep the managed block bounded.
    const contextCap = e.config.ContextDetail === "Lean" ? 1050 : e.config.ContextDetail === "Rich" ? 1750 : 1450;
    if (body.length > contextCap) body = body.slice(0, contextCap - 3) + "…";
    return `[[EMERGENCE_OS_BEGIN]]\n${body}\n[[EMERGENCE_OS_END]]`;
  }

  static installManagedFrontMemory() {
    if (!state.memory || typeof state.memory !== "object") state.memory = {};
    const previous = this.removeManagedBlock(state.memory.frontMemory || "");
    const eos = this.buildManagedContext();
    state.memory.frontMemory = previous ? `${previous}\n${eos}` : eos;
  }

  // ---------------------------------------------------------------------------
  // COMMANDS
  // ---------------------------------------------------------------------------
  static commandNames() {
    if (!this._commandNames) {
      this._commandNames = [
        "help", "about", "settings", "locations", "loc", "cleanup", "forget",
        "undercurrents", "drives", "threads", "factions", "reputation",
        "reflections", "thoughts", "romance", "card", "npcs", "npc", "world",
        "memory", "scene", "debug"
      ];
    }
    return this._commandNames;
  }

  static isKnownCommand(name) {
    const n = String(name || "").toLowerCase();
    return this.commandNames().indexOf(n) !== -1;
  }

  static commandActorPattern() {
    // Do mode normally prefixes "You"; third-person mode can replace that with a
    // proper name. Keep this intentionally conservative so ordinary story prose
    // containing a slash is never swallowed as a command.
    return "(?:You|I|[A-Z][A-Za-z0-9'’_-]*(?:\\\\s+[A-Z][A-Za-z0-9'’_-]*){0,3})";
  }

  static commandCandidates(raw) {
    const original = String(raw || "").replace(/\r/g, "").trim();
    if (!original) return [];

    const candidates = [];
    const push = (value, mode) => {
      const v = String(value || "").trim();
      if (!v || v.charAt(0) !== "/") return;
      if (!candidates.some(c => c.text === v)) candidates.push({ text: v, mode });
    };

    // Story mode / raw slash input.
    push(original, "raw");

    // A user may manually quote a command in Story mode.
    const quoted = original.match(/^["“']\s*(\/[\s\S]*?)\s*["”']\s*[.!?]?\s*$/);
    if (quoted) push(quoted[1], "quoted");

    // Do / Say inputs arrive with a leading action marker. AI Dungeon can use
    // "You" or a third-person proper name as the acting subject.
    const body = original.replace(/^\s*>\s*/, "").trim();
    if (body !== original) {
      push(body, "raw");

      const doMatch = body.match(/^(?:You|I|[A-Z][A-Za-z0-9'’_-]*(?:\s+[A-Z][A-Za-z0-9'’_-]*){0,3})\s+(\/[\s\S]*)$/);
      if (doMatch) {
        const third = !/^(?:You|I)\b/i.test(body);
        push(doMatch[1], third ? "thirdPerson" : "do");
      }

      const sayMatch = body.match(/^(?:You|I|[A-Z][A-Za-z0-9'’_-]*(?:\s+[A-Z][A-Za-z0-9'’_-]*){0,3})\s+(?:say|says|said)\s*,?\s*["“']\s*(\/[\s\S]*?)\s*["”']\s*[.!?]?\s*$/i);
      if (sayMatch) {
        const third = !/^(?:You|I)\b/i.test(body);
        push(sayMatch[1], third ? "thirdPerson" : "say");
      }
    }

    return candidates;
  }

  static parseCommandInput(raw) {
    const candidates = this.commandCandidates(raw);
    if (!candidates.length) return null;

    for (let i = 0; i < candidates.length; i++) {
      let payload = candidates[i].text
        .replace(/\s*[\"”']\s*[.!?]?\s*$/, "")
        .replace(/[.!?]+\s*$/, "")
        .trim();

      const m = payload.match(/^\/([A-Za-z][A-Za-z0-9_-]*)(?:\s+([\s\S]*?))?\s*$/);
      if (!m) continue;

      const name = m[1].toLowerCase();
      const arg = this.cleanName(m[2] || "");
      return {
        command: this.isKnownCommand(name) ? name : "__unknown__",
        requestedCommand: name,
        arg,
        wrapperMode: candidates[i].mode,
        raw: String(raw || "")
      };
    }
    return null;
  }

  static clearPendingCommand(reason) {
    const e = state && state.emergence;
    if (!e) return;
    if (e.pendingCommand) {
      if (e.commandStats && reason !== "consumed") {
        e.commandStats.staleClears = (e.commandStats.staleClears || 0) + 1;
      }
      e.pendingCommand = null;
    }
    e.commandOutput = null; // legacy cleanup
    e.isCommandTurn = false;
  }

  static beginCommand(parsed) {
    if (!parsed) return null;
    this.clearPendingCommand("replaced");
    const e = state.emergence;
    const output = this.processCommand(parsed) || "⚙️ EMERGENCE OS command completed.";
    e.commandSequence = (e.commandSequence || 0) + 1;

    const action = this.actionCount();
    const packet = {
      id: `eos-cmd:${action}:${e.commandSequence}:${this.hashText(parsed.raw || parsed.command)}`,
      action,
      command: parsed.command,
      requestedCommand: parsed.requestedCommand || parsed.command,
      arg: parsed.arg || "",
      wrapperMode: parsed.wrapperMode || "raw",
      output: String(output || ""),
      createdTurn: e.turnCount || action
    };
    e.pendingCommand = packet;
    e.isCommandTurn = true;

    if (e.commandStats) {
      if (parsed.command === "__unknown__") e.commandStats.unknown = (e.commandStats.unknown || 0) + 1;
      else e.commandStats.recognized = (e.commandStats.recognized || 0) + 1;
      const mode = packet.wrapperMode;
      if (e.commandStats[mode] !== undefined) e.commandStats[mode]++;
    }
    return packet;
  }

  static hasPendingCommand() {
    return !!(state && state.emergence && state.emergence.pendingCommand);
  }

  static commandContextText() {
    const p = state && state.emergence ? state.emergence.pendingCommand : null;
    const id = p && p.id ? p.id : "eos-command";
    // Current AI Dungeon cannot safely stop generation from onInput without an
    // error. Give the model a tiny isolated context instead. Output will replace
    // the model's placeholder with the command result.
    return `[EMERGENCE OS INTERNAL COMMAND ${id}]\\nDo not continue the story. Return exactly: [EOS_COMMAND_PENDING]`;
  }

  static consumePendingCommand() {
    const e = state && state.emergence;
    if (!e || !e.pendingCommand) return null;
    const p = e.pendingCommand;
    const out = String(p.output || "⚙️ EMERGENCE OS command completed.");
    e.lastCommand = {
      id: p.id, action: p.action, command: p.requestedCommand || p.command,
      wrapperMode: p.wrapperMode, consumedAt: this.actionCount()
    };
    if (e.commandStats) e.commandStats.consumed = (e.commandStats.consumed || 0) + 1;
    this.clearPendingCommand("consumed");
    return out;
  }

  static processCommand(parsed) {
    if (!parsed) return null;
    const cmd = parsed.command, arg = parsed.arg;
    if (cmd === "__unknown__") return "🤖 Command not recognized. Type /help for the EMERGENCE OS command list.";
    if (cmd === "help") return "⚙️ EMERGENCE OS\n/help — command list\n/about — project + GitHub\n/npc NAME — dossier\n/npcs — tracked NPCs\n/card NAME — create/link character card\n/forget NAME — stop tracking an NPC\n/locations — tracked locations\n/loc NAME — set/create current location\n/world — world state\n/scene — current scene roster\n/memory NAME — structured relationship memories\n/romance [NAME] — romantic standing\n/undercurrents — NPC↔NPC dynamics\n/factions — mutual coalitions/rivalry triangles\n/reputation — overall player standing\n/reflections NAME — private reflections\n/settings — config summary\n/cleanup — remove obvious false positives\n/debug — diagnostics when DebugMode is enabled";
    if (cmd === "about") return `⚙️ EMERGENCE OS
Living NPC agency, persistent relationships, continuity and location memory.
GitHub: ${this.projectUrl()}
Use /help for commands or /settings for the current configuration.`;
    if (cmd === "settings") return `🎛️ SETTINGS\nEdit the “⚙️ EMERGENCE OS — Config” Story Card.\nGenre=${state.emergence.config.Genre} (detected ${state.emergence.detectedGenre})\nNPCBrainSystem=${state.emergence.config.NPCBrainSystem} | HumanAgency=${state.emergence.config.HumanAgency} | Autonomy=${state.emergence.config.AutonomyLevel}\nLivingWorld=${state.emergence.config.LivingWorldEngine} | Romance=${state.emergence.config.RomanceEngine} (${state.emergence.config.RomancePacing})\nLocations=${state.emergence.config.LocationCards}/${state.emergence.config.LocationAutoUpdate}\nDetection=${state.emergence.config.DetectionSensitivity} | CardRefresh=${state.emergence.config.CardRefreshInterval}\nSceneContinuity=${state.emergence.config.SceneContinuity} (${state.emergence.config.PresencePersistence}) | Nuance=${state.emergence.config.RelationshipNuance} | Memory=${state.emergence.config.MemoryDepth}\nStateRepair=${state.emergence.config.StateRepair} | ContextDetail=${state.emergence.config.ContextDetail}\nFull explanations are in the card notes.`;
    if (cmd === "card") return arg ? this.generateCharacterCard(arg) : "Usage: /card NAME";
    if (cmd === "loc") {
      if (!arg) return "Usage: /loc LOCATION";
      this.initializeLocation(this.titleCase(arg), { setCurrent: true });
      this.flushDirtyCards(true);
      return `📍 Current location set to ${this.titleCase(arg)}. Managed location state is synced.`;
    }
    if (cmd === "npcs") {
      const names = Object.keys(state.world.npcs);
      return names.length ? `👥 TRACKED NPCs\n${names.map(n => `• ${n} — Trust ${Math.round(state.world.npcs[n].trust)} | Grudge ${Math.round(state.world.npcs[n].grudge)} | ${state.world.npcs[n].threatState}`).join("\n")}` : "👥 No NPCs confirmed yet.";
    }
    if (cmd === "locations") {
      const names = Object.keys(state.world.locations);
      return names.length ? `🗺️ LOCATIONS\n${names.map(n => `• ${n}${n === state.emergence.currentLocation ? " ← current" : ""} — ${state.world.locations[n].condition} | ${this.locationAtmosphere(state.world.locations[n])}`).join("\n")}` : "🗺️ No locations confirmed yet.";
    }
    if (cmd === "npc") {
      if (!arg) return "Usage: /npc NAME";
      const name = this.findNpcByName(arg);
      if (!name) return `🤖 NPC “${arg}” not found. Try /npcs.`;
      const npc = state.world.npcs[name];
      const uc = this.strongestUndercurrent(name);
      let out = `👤 ${name}\n❤️ Trust ${Math.round(npc.trust)}/100 | 💢 Grudge ${Math.round(npc.grudge)}/100 | 🫀 Stress ${Math.round(npc.stress)}/100\n🛡️ ${npc.threatState} | 🧠 Bias ${npc.cognitiveBias} | 🔗 Attachment ${npc.attachmentStyle}\n🎭 Relationship: ${this.recalculateRelationshipTone(name)} | Respect ${Math.round(npc.respect)}/100 | Familiarity ${Math.round(npc.familiarity)}/100${npc.fear >= 25 ? ` | Fear ${Math.round(npc.fear)}/100` : ""}\n📍 Last seen: ${npc.lastSeenLocation || "Unknown"} (turn ${npc.lastSeenTurn || 0})`;
      if (this.enabled("RomanceEngine")) out += `\n💞 ${this.relationshipStage(npc.attraction)} (${Math.round(npc.attraction)}/100)`;
      if (uc) out += `\n🌊 ${uc.value >= 0 ? "Warmth" : "Tension"} with ${uc.target} (${uc.value})`;
      if (npc.memories.length) out += `\n🧠 Recent: ${npc.memories[npc.memories.length - 1]}`;
      if (npc.coreMemory) out += `\n⭐ Formative: ${npc.coreMemory}`;
      if (this.enabled("InnerSelfSystem")) {
        if (npc.hiddenGoal !== "Not established") out += `\n🎯 Goal: ${npc.hiddenGoal}`;
        if (npc.secret !== "Not established") out += `\n🤫 Secret: ${npc.secret}`;
        if (npc.coreBelief !== "Not established") out += `\n🧭 Belief: ${npc.coreBelief}`;
      }
      return out;
    }
    if (cmd === "romance") {
      if (!this.enabled("RomanceEngine")) return "💞 Romance Engine is disabled.";
      if (arg) {
        const name = this.findNpcByName(arg);
        if (!name) return `🤖 NPC “${arg}” not found.`;
        const npc = state.world.npcs[name];
        return `💞 ${name}: ${this.relationshipStage(npc.attraction)} (${Math.round(npc.attraction)}/100)`;
      }
      const names = Object.keys(state.world.npcs).filter(n => state.world.npcs[n].attraction > 0);
      return names.length ? `💞 ROMANTIC STANDING\n${names.map(n => `• ${n}: ${this.relationshipStage(state.world.npcs[n].attraction)} (${Math.round(state.world.npcs[n].attraction)}/100)`).join("\n")}` : "💞 No tracked romantic interest yet.";
    }
    if (cmd === "undercurrents" || cmd === "drives" || cmd === "threads") {
      const names = Object.keys(state.world.npcs), lines = [];
      for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
        const v = this.mutualUndercurrent(names[i], names[j]);
        if (v !== 0) lines.push(`• ${names[i]} ↔ ${names[j]}: ${v >= 0 ? "warmth" : "tension"} (${v})`);
      }
      let out = lines.length ? `🌊 UNDERCURRENTS\n${lines.join("\n")}` : "🌊 No confirmed NPC-to-NPC undercurrents yet.";
      if (state.emergence.gossipLog.length) out += `\n\n🗣️ RECENT SOCIAL SIGNALS\n${state.emergence.gossipLog.slice(-4).map(x => `• ${x}`).join("\n")}`;
      return out;
    }
    if (cmd === "factions") {
      const f = this.detectFactions();
      let out = "🤝 FACTIONS";
      if (!f.coalitions.length && !f.rivalryBlocs.length) return `${out}\nNo closed three-person coalition or rivalry triangle has formed yet.`;
      if (f.coalitions.length) out += `\nCoalitions:\n${f.coalitions.map(x => `• ${x.join(", ")}`).join("\n")}`;
      if (f.rivalryBlocs.length) out += `\nRivalry Blocs:\n${f.rivalryBlocs.map(x => `• ${x.join(", ")}`).join("\n")}`;
      return out;
    }
    if (cmd === "reputation") {
      const names = Object.keys(state.world.npcs);
      if (!names.length) return "📊 No NPC relationships are tracked yet.";
      const trust = Math.round(names.reduce((s, n) => s + state.world.npcs[n].trust, 0) / names.length);
      const grudge = Math.round(names.reduce((s, n) => s + state.world.npcs[n].grudge, 0) / names.length);
      const standing = trust >= 70 && grudge <= 20 ? "Well-regarded" : grudge >= 60 ? "Widely distrusted" : trust <= 35 ? "Poor standing" : "Mixed";
      return `📊 REPUTATION\nAcross ${names.length} NPC${names.length === 1 ? "" : "s"}: Trust ${trust}/100 | Grudge ${grudge}/100\nStanding: ${standing}`;
    }
    if (cmd === "reflections" || cmd === "thoughts") {
      if (!arg) return "Usage: /reflections NAME";
      const name = this.findNpcByName(arg);
      if (!name) return `🤖 NPC “${arg}” not found.`;
      if (!this.enabled("ReflectionSystem")) return "💭 ReflectionSystem is disabled in the config card.";
      const refs = state.world.npcs[name].reflections;
      return refs.length ? `💭 ${name} — PRIVATE REFLECTIONS\n${refs.map(r => `${r.n}. ${r.text}`).join("\n")}` : `💭 No reflections captured for ${name} yet.`;
    }
    if (cmd === "forget") {
      if (!arg) return "Usage: /forget NAME";
      const name = this.findNpcByName(arg);
      if (!name) return `🤖 NPC “${arg}” not found.`;
      const binding = state.emergence.cardBindings[name.toLowerCase()];
      // Only remove an EOS-generated card. Adopted user lore is deliberately kept.
      if (binding && binding.generated) {
        const cards = this.cardArray();
        if (cards) {
          const card = this.getBoundNpcCard(name);
          const idx = card ? cards.indexOf(card) : -1;
          if (idx >= 0) cards.splice(idx, 1);
        }
      } else if (binding) {
        // Detach our managed state block from adopted user lore when forgetting.
        const card = this.getBoundNpcCard(name);
        if (card) card.entry = String(card.entry || "").split("--- EMERGENCE STATE ---")[0].trim();
      }
      delete state.emergence.cardBindings[name.toLowerCase()];
      state.emergence.forgottenNpcs[name.toLowerCase()] = true;
      delete state.world.npcs[name];
      Object.keys(state.world.npcs).forEach(n => { if (state.world.npcs[n].undercurrents) delete state.world.npcs[n].undercurrents[name]; });
      return `🧹 ${name} is no longer tracked.${binding && !binding.generated ? " Your pre-existing Story Card was preserved." : ""}`;
    }
    if (cmd === "cleanup") {
      let removed = 0;
      Object.keys(state.world.npcs).forEach(name => {
        if (this.looksLikePlaceName(name) || this.looksLikeObjectName(name) || state.world.locations[name]) {
          delete state.world.npcs[name];
          delete state.emergence.cardBindings[name.toLowerCase()];
          removed++;
        }
      });
      return `🧹 Cleanup complete. Removed ${removed} obvious false-positive NPC entr${removed === 1 ? "y" : "ies"}.`;
    }
    if (cmd === "scene") {
      const names = this.sceneRosterNames();
      const loc = state.emergence.currentLocation;
      return names.length ? `🎬 SCENE — ${loc}\n${names.map(n => `• ${n} — ${this.recalculateRelationshipTone(n)}`).join("\n")}` : `🎬 SCENE — ${loc}\nNo NPCs are confidently present.`;
    }
    if (cmd === "memory") {
      if (!arg) return "Usage: /memory NAME";
      const name = this.findNpcByName(arg);
      if (!name) return `🤖 NPC “${arg}” not found.`;
      const npc = state.world.npcs[name];
      const memories = npc.memoryLedger.slice(-10);
      let out = `🧠 ${name} — STRUCTURED MEMORIES`;
      if (!memories.length) out += "\nNo structured relationship memories yet.";
      else out += "\n" + memories.map(m => `• T${m.turn} [${m.type}]${m.location && m.location !== "Unknown Location" ? ` @ ${m.location}` : ""}: ${m.text}`).join("\n");
      const open = npc.commitments.filter(c => c.status === "open");
      if (open.length) out += `\n\n🤝 OPEN PROMISES\n${open.map(c => `• ${c.text}`).join("\n")}`;
      if (npc.boundaries.length) out += `\n\n🛑 RECORDED BOUNDARIES\n${npc.boundaries.slice(-4).map(b => `• ${b.text}`).join("\n")}`;
      return out;
    }
    if (cmd === "world") {
      const loc = state.world.locations[state.emergence.currentLocation];
      return `🌍 WORLD\n📍 ${state.emergence.currentLocation}${loc ? ` — ${loc.condition}, ${this.locationAtmosphere(loc)}` : ""}\n🔥 Tension ${Math.round(state.emergence.worldTension)}/100\n🫀 Player stress ${Math.round(state.playerInner.stress)}/100 | Composure ${Math.round(state.playerInner.composure)}/100 (${state.playerInner.condition})\n🎭 Genre ${this.activeGenre()}${state.emergence.config.Genre === "Auto" ? " (Auto)" : " (Manual)"}`;
    }
    if (cmd === "debug") {
      if (!this.enabled("DebugMode")) return "🧪 DebugMode is disabled in the config card.";
      const lastError = state.emergence.lastError ? `\nLast hook error: ${state.emergence.lastError.hook} T${state.emergence.lastError.turn} — ${state.emergence.lastError.message}` : "";
      const cs = state.emergence.commandStats || {};
      const lastCmd = state.emergence.lastCommand
        ? `\nLast command: /${state.emergence.lastCommand.command} via ${state.emergence.lastCommand.wrapperMode} @ action ${state.emergence.lastCommand.action}`
        : "";
      const cmdLine = `Commands recognized/consumed/unknown/stale: ${cs.recognized || 0}/${cs.consumed || 0}/${cs.unknown || 0}/${cs.staleClears || 0}`;
      return `🧪 DEBUG\nTurn ${state.emergence.turnCount} | NPCs ${Object.keys(state.world.npcs).length} | Locations ${Object.keys(state.world.locations).length}\nCandidates ${Object.keys(state.emergence.nameCandidates).length}/${Object.keys(state.emergence.locationCandidates).length}\nDirty ${state.emergence.dirtyNpcs.length}/${state.emergence.dirtyLocations.length}\n${cmdLine}${lastCmd}\n${this.expandedDiagnostics()}${lastError}\n${state.emergence.debugLog.slice(-8).join("\n") || "No logged errors."}`;
    }
    return null;
  }
}
