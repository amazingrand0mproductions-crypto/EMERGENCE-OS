// EMERGENCE OS — Library
// Independent NPC psychology, relationships, continuity, and living locations.
// Designed for AI Dungeon's Library / Input / Context / Output scripting hooks.

if (typeof state === "undefined") state = {};

class EmergenceEngine {
  // ---------------------------------------------------------------------------
  // CORE / MIGRATION
  // ---------------------------------------------------------------------------
  static init() {
    if (!state.emergence || typeof state.emergence !== "object") state.emergence = {};
    const e = state.emergence;

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
    if (e.initialized === undefined) e.initialized = false;
    if (e.isCommandTurn === undefined) e.isCommandTurn = false;

    // Migrate old NPC state into the safer schema. Nothing established is thrown away.
    Object.keys(state.world.npcs).forEach(name => this.normalizeNpc(name));
    Object.keys(state.world.locations).forEach(name => this.normalizeLocation(name));
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
    const beforeLen = cards.length;
    let result = null;
    let apiAttempted = false;
    let apiFailed = false;

    if (typeof addStoryCard === "function") {
      apiAttempted = true;
      try {
        // Current AI Dungeon sandboxes support the extended title/notes/options
        // shape; older/documented variants may return a number or false instead.
        result = addStoryCard(keys, entry, type, title || keys, notes || "", { returnCard: true });
      } catch (err) {
        apiFailed = true;
        this.debug(`addStoryCard extended call failed: ${err && err.message ? err.message : err}`);
        try {
          result = addStoryCard(keys, entry, type);
          apiFailed = false;
        } catch (err2) {
          apiFailed = true;
          this.debug(`addStoryCard fallback failed: ${err2 && err2.message ? err2.message : err2}`);
        }
      }
    }

    if (result && typeof result === "object") {
      if (title && !result.title) result.title = title;
      if (notes && !result.description && !result.notes) result.description = notes;
      return result;
    }

    // Most reliable cross-version signal: the API grew storyCards.
    if (cards.length > beforeLen) {
      const card = cards[cards.length - 1];
      if (card) {
        if (title) card.title = title;
        if (notes && !card.description && !card.notes) card.description = notes;
      }
      return card || null;
    }

    // Some variants return an index (or one-based length) without returning object.
    if (typeof result === "number") {
      const candidates = [result, result - 1].filter(i => i >= 0 && i < cards.length);
      for (let i = 0; i < candidates.length; i++) {
        const card = cards[candidates[i]];
        if (card && (this.cardKeyString(card).toLowerCase().includes(String(keys).toLowerCase()) || !keys)) return card;
      }
    }

    // false generally means a duplicate key. Reuse it instead of duplicating it.
    const existing = this.findCardByKey(String(keys).split(",")[0]) || (title ? this.findCardByTitle(title) : null);
    if (existing) return existing;

    // Only manually push if the API is unavailable or genuinely failed without
    // changing the array. Never double-create after a successful API write.
    if (!apiAttempted || apiFailed) {
      const card = {
        id: `eos-${Date.now ? Date.now() : 0}-${Math.floor(Math.random() * 1000000)}`,
        keys,
        entry,
        type,
        title: title || keys,
        name: title || keys,
        description: notes || ""
      };
      cards.push(card);
      return card;
    }
    return null;
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
DebugMode: Enabled | Disabled — keeps a small internal diagnostic log shown by /debug.

🎬 CONTENT
MatureContent: Enabled | Disabled — narrative tone hint only; platform/model safety settings still apply.
GraphicRealism: Mild | Standard | Unfiltered — violence-detail preference hint.

⌨️ COMMANDS
/help | /about | /npc NAME | /npcs | /card NAME | /forget NAME | /locations | /loc NAME | /world | /romance [NAME] | /undercurrents | /factions | /reputation | /reflections NAME | /settings | /cleanup | /debug

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
      MatureContent: ["Enabled", "Disabled"], GraphicRealism: ["Mild", "Standard", "Unfiltered"], DebugMode: ["Enabled", "Disabled"]
    };
    if (enums[key]) {
      const found = enums[key].find(v => v.toLowerCase() === value.toLowerCase());
      return found || state.emergence.config[key];
    }
    const numeric = {
      ReflectionInterval: [3, 50], ReflectionChance: [0, 100], CardRefreshInterval: [2, 20], MaxTrackedNPCs: [5, 100], MaxTrackedLocations: [5, 100]
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
    const parts = n.split(/\s+/);
    if (parts.length > 4) return false;
    const stop = this.personStopwords();
    if (parts.every(p => stop[p.toLowerCase()])) return false;
    if (/^\d/.test(n)) return false;
    if (!/^[A-Z][A-Za-z0-9'’\-]*(?:\s+[A-Z][A-Za-z0-9'’\-]*){0,3}$/.test(n)) return false;
    return !this.looksLikePlaceName(n) && !this.looksLikeObjectName(n);
  }

  static looksLikePlaceName(name) {
    return /\b(?:City|Town|Village|Kingdom|Realm|Nation|Empire|District|Province|State|Country|Island|Valley|Forest|Woods|Mountain|Mount|Lake|River|Ocean|Sea|Castle|Palace|Temple|Academy|School|University|College|Hospital|Clinic|Tavern|Inn|Hotel|Bar|Cafe|Café|Restaurant|Bookstore|Library|Shop|Store|Market|Mall|Warehouse|Office|Station|Airport|Port|Harbor|Harbour|Base|Laboratory|Lab|Tower|Fortress|Park|Plaza|Square|Arena|Stadium|Farm|Ranch|Estate|Manor|Church|Cathedral|Cemetery|Prison|Jail|Theater|Theatre|Museum|Beach|Cave|Mine|Ruins)\b/i.test(name);
  }

  static looksLikeObjectName(name) {
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
        generatedByEOS: false
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
    return matches.length === 1 ? matches[0] : null;
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
    const names = this.getPresentSceneNames(text);
    state.emergence.sceneNames = names;
    const danger = this.interactionPatterns().danger.test(text);
    names.forEach(name => {
      const npc = state.world.npcs[name];
      if (!npc) return;
      npc.lastSeenLocation = state.emergence.currentLocation;
      npc.lastSeenTurn = state.emergence.turnCount;
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
          loc.condition = condition;
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
    card.entry = merged;
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
      card.entry = `${base}\n\n${block}`.slice(0, 1800);
    } else {
      card.entry = this.locationEntry(name, loc);
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
    this.processNpcPresence(visibleText);
    this.applyPlayerInteractions(state.emergence.lastPlayerInput || "", combined);

    // Earned security responds to the targeted interaction once, not to passive presence.
    this.targetedPlayerEvents(state.emergence.lastPlayerInput || "").forEach(ev => this.updateEarnedSecurity(ev.target, ev.type));

    this.updateUndercurrents(visibleText);
    this.updateLocationConditions(visibleText);
    this.updateWorldState(combined);
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
      e.sceneNames.slice(0, 4).forEach(name => lines.push(this.compactNpcLine(name)));
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
    if (body.length > 1500) body = body.slice(0, 1497) + "…";
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
  static parseCommandInput(raw) {
    const s = String(raw || "").trim();
    // AI Dungeon can wrap actions; allow a leading > and optional quote, but the
    // slash command still has to be the first meaningful token.
    const cleaned = s.replace(/^>\s*/, "").replace(/^['"“”]+/, "").trim();
    const m = cleaned.match(/^\/(help|about|settings|locations|loc|cleanup|forget|undercurrents|drives|threads|factions|reputation|reflections|thoughts|romance|card|npcs|npc|world|debug)\b(?:\s+([^\n]*))?$/i);
    if (m) return { command: m[1].toLowerCase(), arg: this.cleanName(m[2] || "") };
    if (/^\/[A-Za-z]/.test(cleaned)) return { command: "__unknown__", arg: "" };
    return null;
  }

  static processCommand(parsed) {
    if (!parsed) return null;
    const cmd = parsed.command, arg = parsed.arg;
    if (cmd === "__unknown__") return "🤖 Command not recognized. Type /help for the EMERGENCE OS command list.";
    if (cmd === "help") return "⚙️ EMERGENCE OS\n/help — command list\n/about — project + GitHub\n/npc NAME — dossier\n/npcs — tracked NPCs\n/card NAME — create/link character card\n/forget NAME — stop tracking an NPC\n/locations — tracked locations\n/loc NAME — set/create current location\n/world — world state\n/romance [NAME] — romantic standing\n/undercurrents — NPC↔NPC dynamics\n/factions — mutual coalitions/rivalry triangles\n/reputation — overall player standing\n/reflections NAME — private reflections\n/settings — config summary\n/cleanup — remove obvious false positives\n/debug — diagnostics when DebugMode is enabled";
    if (cmd === "about") return `⚙️ EMERGENCE OS
Living NPC agency, persistent relationships, continuity and location memory.
GitHub: ${this.projectUrl()}
Use /help for commands or /settings for the current configuration.`;
    if (cmd === "settings") return `🎛️ SETTINGS\nEdit the “⚙️ EMERGENCE OS — Config” Story Card.\nGenre=${state.emergence.config.Genre} (detected ${state.emergence.detectedGenre})\nNPCBrainSystem=${state.emergence.config.NPCBrainSystem} | HumanAgency=${state.emergence.config.HumanAgency} | Autonomy=${state.emergence.config.AutonomyLevel}\nLivingWorld=${state.emergence.config.LivingWorldEngine} | Romance=${state.emergence.config.RomanceEngine} (${state.emergence.config.RomancePacing})\nLocations=${state.emergence.config.LocationCards}/${state.emergence.config.LocationAutoUpdate}\nDetection=${state.emergence.config.DetectionSensitivity} | CardRefresh=${state.emergence.config.CardRefreshInterval}\nFull explanations are in the card notes.`;
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
      let out = `👤 ${name}\n❤️ Trust ${Math.round(npc.trust)}/100 | 💢 Grudge ${Math.round(npc.grudge)}/100 | 🫀 Stress ${Math.round(npc.stress)}/100\n🛡️ ${npc.threatState} | 🧠 Bias ${npc.cognitiveBias} | 🔗 Attachment ${npc.attachmentStyle}\n📍 Last seen: ${npc.lastSeenLocation || "Unknown"} (turn ${npc.lastSeenTurn || 0})`;
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
    if (cmd === "world") {
      const loc = state.world.locations[state.emergence.currentLocation];
      return `🌍 WORLD\n📍 ${state.emergence.currentLocation}${loc ? ` — ${loc.condition}, ${this.locationAtmosphere(loc)}` : ""}\n🔥 Tension ${Math.round(state.emergence.worldTension)}/100\n🫀 Player stress ${Math.round(state.playerInner.stress)}/100 | Composure ${Math.round(state.playerInner.composure)}/100 (${state.playerInner.condition})\n🎭 Genre ${this.activeGenre()}${state.emergence.config.Genre === "Auto" ? " (Auto)" : " (Manual)"}`;
    }
    if (cmd === "debug") {
      if (!this.enabled("DebugMode")) return "🧪 DebugMode is disabled in the config card.";
      return `🧪 DEBUG\nTurn ${state.emergence.turnCount} | NPCs ${Object.keys(state.world.npcs).length} | Locations ${Object.keys(state.world.locations).length}\nCandidates ${Object.keys(state.emergence.nameCandidates).length}/${Object.keys(state.emergence.locationCandidates).length}\nDirty ${state.emergence.dirtyNpcs.length}/${state.emergence.dirtyLocations.length}\n${state.emergence.debugLog.slice(-8).join("\n") || "No logged errors."}`;
    }
    return null;
  }
}
