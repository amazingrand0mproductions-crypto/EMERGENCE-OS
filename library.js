// EMERGENCE OS 1 - Master Engine
// Full title: [REBUILT] EMERGENCE OS 1 - Independent NPCs, Trust & Grudges,
// and Auto-Updating Location Cards
//
// Feature set:
//   - Human Agency: NPCs resist unearned demands, hold cognitive biases, and
//     shift through polyvagal threat states (Composed/Fight/Flight/Freeze/Fawn).
//   - Persistent Trust & Grudge tracking, Ego Depletion, and physical micro-tells.
//   - Undercurrents: NPC-to-NPC relationship dynamics inferred PASSIVELY from
//     what's already happening in the story - no scheduled "start a storyline"
//     events, no cooldown/dormancy lifecycle, no hidden write-back tag asking
//     the narrator to report developments. It just reads what actually
//     happened (reusing the same trigger patterns that drive player-NPC
//     trust/grudge) and lets each NPC's own attachment style color how that
//     reads in the text. Nothing is pre-scheduled; nothing is invented.
//   - Reflections: opt-in, per-NPC private first-person thoughts saved to their
//     own story card, captured via a hidden tag (the same mechanism used for
//     character profile fill, for internal consistency). Never enter story
//     context, never affect behavior.
//   - AI-authored character profiles: new /card sheets get filled in by the
//     narrator itself (accurately if it recognizes the character, invented but
//     fitting if it's original) instead of sitting on blank placeholders.
//   - Dynamic World Tension, Player Trauma, and multi-location damage/condition
//     tracking that keeps each place's state independent of the others.
//   - Auto-Genre Adaptation and slash commands for direct state inspection
//     (/npc, /npcs, /undercurrents, /romance, /reflections, /settings, /world,
//     /loc, /card, /cleanup, /forget) that never waste a story turn.
//
// Built to work within AI Dungeon's real context-priority system: Front Memory
// (system state) is kept deliberately tiny since AI Dungeon never trims it, while
// heavier/variable content (NPC color, nudges) goes through Author's Note, which
// AI Dungeon can gracefully shrink under pressure. Story cards are created via
// AI Dungeon's own addStoryCard() API rather than raw array pushes.

if (typeof state === 'undefined') {
  state = {};
}

class EmergenceEngine {
  static init() {
    if (!state.emergence) state.emergence = {};
    if (!state.emergence.config) state.emergence.config = {};

    const defaultCfg = {
      Genre: "Modern", AutonomyLevel: "High", PsychologicalRealism: "Raw Human",
      HumanAgency: "Enabled", GrudgeTracking: "Enabled", WorldTensionEngine: "Dynamic",
      PlayerTrauma: "Enabled", PhysicalQuirks: "High", RomanceEngine: "18+ Unrestricted",
      JealousyMechanic: "Enabled", MatureContent: "18+ Unrestricted", GraphicRealism: "Unfiltered",
      LocationCards: "Enabled", LocationAutoUpdate: "Enabled", InnerSelfSystem: "Enabled",
      LivingWorldEngine: "Enabled", ProtagonistInvolvement: "Medium", ConsequenceSeverity: "Hardcore",
      DialogueStyle: "Raw & Gritty", NPCBrainSystem: "Enabled",
      ReflectionSystem: "Disabled", ReflectionInterval: "6", ReflectionChance: "50", RomancePacing: "Normal",
      NpcColorNotes: "Enabled", ProtectAuthorsNote: "Disabled"
    };

    for (let key in defaultCfg) {
      if (state.emergence.config[key] === undefined) {
        state.emergence.config[key] = defaultCfg[key];
      }
    }

    if (!state.emergence.genreScores) {
      state.emergence.genreScores = {
        "Superhero": 0, "Sci-Fi": 0, "Horror": 0, "Fantasy": 0,
        "Western": 0, "Cyberpunk": 0, "Noir": 0, "Modern": 0
      };
    }

    if (!state.emergence.activeThreads) state.emergence.activeThreads = [];
    if (state.emergence.worldTension === undefined) state.emergence.worldTension = 10;
    if (!state.emergence.currentLocation) state.emergence.currentLocation = "Unknown Location";
    if (state.emergence.turnCount === undefined) state.emergence.turnCount = 0;
    if (!state.emergence.reflectionBook) {
      state.emergence.reflectionBook = { lastTurn: 0, seq: {} };
    }
    if (!state.emergence.sceneNames) state.emergence.sceneNames = [];
    if (!state.emergence.nameCandidates) state.emergence.nameCandidates = {};
    // All three of these are queues, not single values - a second /card, a
    // second romance stage change, or a second Earned Security shift in the
    // same turn used to silently overwrite and abandon whichever one fired
    // first. Migrates gracefully from the old single-value shapes.
    if (!Array.isArray(state.emergence.pendingProfileFill)) {
      const old = state.emergence.pendingProfileFill;
      state.emergence.pendingProfileFill = (old && old.name) ? [old] : [];
    }
    if (!Array.isArray(state.emergence.pendingRomanceStageChange)) {
      const old = state.emergence.pendingRomanceStageChange;
      state.emergence.pendingRomanceStageChange = (old && old.name) ? [old] : [];
    }
    if (!Array.isArray(state.emergence.pendingSecurityShift)) {
      const old = state.emergence.pendingSecurityShift;
      state.emergence.pendingSecurityShift = old ? [old] : [];
    }

    if (!state.world) state.world = {};
    if (!state.world.npcs) state.world.npcs = {};
    if (!state.world.locations) state.world.locations = {};
    if (!state.playerInner) state.playerInner = { stress: 15, egoReserve: 100, condition: "Calm & Focused" };

    Object.keys(state.world.npcs).forEach(k => {
      let npc = state.world.npcs[k];
      if (!npc || typeof npc !== 'object') {
        npc = {};
        state.world.npcs[k] = npc;
      }
      if (!npc.memories) npc.memories = [];
      if (npc.coreMemory === undefined) npc.coreMemory = "";
      if (!npc.hiddenGoal) npc.hiddenGoal = "Survive.";
      if (!npc.secret) npc.secret = "None.";
      if (!npc.coreBelief) npc.coreBelief = "Unsure of their place.";
      if (!npc.threatState) npc.threatState = "Composed";
      if (!npc.outerMask) npc.outerMask = "Guarded.";
      if (!npc.innerMind) npc.innerMind = "Observing.";
      if (npc.trust === undefined) npc.trust = 50;
      if (npc.grudge === undefined) npc.grudge = 0;
      if (npc.stress === undefined) npc.stress = 10;
      if (npc.egoReserve === undefined) npc.egoReserve = 100;
      if (npc.attraction === undefined) npc.attraction = 0;
      if (!npc.cognitiveBias) npc.cognitiveBias = "Skeptical";
      if (!npc.attachmentStyle) npc.attachmentStyle = "Secure";
      if (!npc.mood) npc.mood = "Neutral";
      if (!npc.undercurrents || typeof npc.undercurrents !== 'object' || Array.isArray(npc.undercurrents)) {
        // Migrate from the old single-target shape if present, otherwise start fresh.
        if (npc.undercurrent && npc.undercurrent.target && npc.undercurrent.warmth) {
          npc.undercurrents = { [npc.undercurrent.target]: npc.undercurrent.warmth };
        } else {
          npc.undercurrents = {};
        }
      }
      delete npc.undercurrent;
      if (!Array.isArray(npc.reflections)) npc.reflections = [];
      if (!npc.lastSeenLocation) npc.lastSeenLocation = "";
      if (npc.lastSeenTurn === undefined) npc.lastSeenTurn = 0;
      if (npc.secureStreak === undefined) npc.secureStreak = 0;
    });
  }

  // Prefer AI Dungeon's own action counter (info.actionCount) over a
  // self-incremented one: a self-incremented counter drifts out of sync if the
  // player edits or retries an action, since Context still runs again. Falls
  // back to self-increment if info isn't available in this sandbox.
  static syncTurnCount() {
    if (typeof info !== 'undefined' && info && typeof info.actionCount === 'number') {
      state.emergence.turnCount = info.actionCount;
    } else {
      state.emergence.turnCount = (state.emergence.turnCount || 0) + 1;
    }
    return state.emergence.turnCount;
  }

  // AutonomyLevel scales how hard NPCs push back against unearned demands.
  static autonomyMultiplier() {
    const map = { "Low": 0.5, "Medium": 1, "High": 1.5, "Unchained": 2.2 };
    const v = map[state.emergence.config.AutonomyLevel];
    return v !== undefined ? v : 1;
  }

  // ConsequenceSeverity scales how hard betrayal/lying lands.
  static severityMultiplier() {
    const map = { "Mild": 0.5, "Moderate": 1, "Hardcore": 1.6 };
    const v = map[state.emergence.config.ConsequenceSeverity];
    return v !== undefined ? v : 1;
  }

  static clamp(val, min = 0, max = 100) {
    return Math.max(min, Math.min(max, val));
  }

  static escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static toTitleCase(str) {
    return String(str).replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  // Case-insensitive NPC lookup, used by nearly every command and the tag
  // write-back handlers - one place instead of the same find() repeated at
  // every call site. Returns the NPC's actual stored key (correct casing) or
  // null.
  static findNpcByName(name) {
    if (!name) return null;
    const target = String(name).toLowerCase();
    return Object.keys(state.world.npcs).find(n => n.toLowerCase() === target) || null;
  }

  // A short, concrete excerpt of the actual moment, so a memory reads as
  // something that really happened rather than a generic category label.
  static excerptFrom(text, maxLen = 60) {
    if (!text) return "";
    let t = String(text).trim().replace(/\s+/g, ' ');
    if (t.length <= maxLen) return t;
    let cut = t.slice(0, maxLen);
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 20) cut = cut.slice(0, lastSpace);
    return cut + "...";
  }

  static updateStat(obj, stat, change, min = 0, max = 100) {
    if (!obj) return;
    if (obj[stat] === undefined) obj[stat] = 50;
    obj[stat] = this.clamp(obj[stat] + change, min, max);
  }

  // Centralized card creation through AI Dungeon's own addStoryCard() function
  // (which assigns a proper id, matching how the platform's UI creates cards)
  // instead of pushing a raw object onto storyCards directly. Falls back to a
  // manual push (still with an id, for consistency) if addStoryCard isn't
  // available in this sandbox for any reason.
  static createStoryCard(keys, entry, type, name, notes) {
    if (typeof addStoryCard === 'function') {
      try {
        const card = addStoryCard(keys, entry, type, name, notes, { returnCard: true });
        if (card && typeof card === 'object') return card;
      } catch (e) {}
    }
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return null;
    const card = {
      id: Math.floor(Math.random() * 1000000000).toString(),
      title: name, name: name, keys: keys, entry: entry, description: notes || "", type: type
    };
    storyCards.push(card);
    return card;
  }

  // Cached, richly-conjugated keyword patterns for behavior/condition detection.
  // Plain \bWORD\b patterns only match the bare dictionary form - "demands",
  // "attacked", "kissed" etc. never match \bdemand\b / \battack\b / \bkiss\b -
  // which silently missed most real English usage. Built once and reused.
  static getTriggerPatterns() {
    if (!this._triggerPatterns) {
      const build = (words) => new RegExp(`\\b(${words.join('|')})\\b`, 'i');
      this._triggerPatterns = {
        tensionUp: build(["explosions?", "gunfire", "shout(?:s|ed|ing)?", "scream(?:s|ed|ing)?", "bloody?", "fires?", "fired", "firing", "attack(?:s|ed|ing)?", "grenades?", "bombs?", "bombed", "bombing", "terror", "chaotic?"]),
        traumaUp: build(["damages?", "damaged", "damaging", "injur(?:y|ies|ed)", "traumas?", "traumatic", "traumatized", "horror", "horrific", "terrif(?:ied|ying)", "exhaust(?:ed|ing|ion)?", "pain(?:ful|ed)?", "struck", "strikes?", "striking"]),
        traumaDown: build(["rests?", "rested", "resting", "safe(?:ty)?", "sanctuary", "comfort(?:ed|ing)?", "heal(?:ed|ing|s)?", "calm(?:ed|ing)?"]),
        pushback: build(["demands?", "demanded", "demanding", "orders?", "ordered", "ordering", "commands?", "commanded", "commanding", "forces?", "forced", "forcing", "obeys?", "obeyed", "obeying", "threatens?", "threatened", "threatening", "shoves?", "shoved", "shoving", "grabs?", "grabbed", "grabbing", "insults?", "insulted", "insulting"]),
        respect: build(["asks?", "asked", "asking", "please", "helps?", "helped", "helping", "listens?", "listened", "listening", "trust(?:s|ed|ing)?", "shares?", "shared", "sharing"]),
        betrayal: build(["lies?", "lied", "lying", "betrays?", "betrayed", "betraying", "hypocrit(?:e|ical)", "caught", "catch(?:es|ing)?", "fakes?", "faked", "faking", "cheats?", "cheated", "cheating"]),
        romance: build(["blush(?:es|ed|ing)?", "kiss(?:es|ed|ing)?", "flirts?", "flirted", "flirting", "gaz(?:e|es|ed|ing)", "touch(?:es|ed|ing)?", "romantic", "passion(?:ate(?:ly)?)?", "moans?", "moaned", "moaning", "undress(?:ed|ing)?"]),
        locFire: build(["fires?", "burn(?:ing|ed|t)?", "flames?", "flaming", "blaz(?:e|es|ing)", "infernos?"]),
        locDestroyed: build(["explosions?", "explod(?:ed|ing|es)", "destroy(?:ed|ing|s)?", "rubble", "ruins?", "ruined", "collapse[ds]?", "collapsing", "shatter(?:ed|s|ing)?"]),
        locLocked: build(["locks?", "locked", "locking", "seals?", "sealed", "sealing", "barricad(?:e|es|ed|ing)", "lockdowns?"]),
        locSafe: build(["safe(?:ty)?", "secure[ds]?", "securing", "repair(?:ed|ing|s)?", "peaceful", "peace"])
      };
    }
    return this._triggerPatterns;
  }

  // Packs candidate Author's Note items into a character budget by priority
  // (lowest number first) instead of naive concatenate-then-truncate, so a
  // time-limited item (like a profile-fill request with only 2 attempts left)
  // can't get silently crowded out by a routine one that happened to come first.
  static packByPriority(candidates, budget) {
    const usable = candidates.filter(c => c && c.text);
    usable.sort((a, b) => a.priority - b.priority);
    let notes = "";
    usable.forEach((c, i) => {
      if (i === 0) {
        // The highest-priority candidate always gets included, truncated if
        // it's larger than the whole budget by itself - previously, an
        // oversized top candidate got silently dropped entirely rather than
        // ever appearing at all, which is exactly what was happening to the
        // 831-character profile-fill request against a 700-char budget.
        notes = c.text.length <= budget ? c.text : c.text.slice(0, budget - 3) + "...";
        return;
      }
      const merged = notes + '\n\n' + c.text;
      if (merged.length <= budget) {
        notes = merged;
      }
      // else: skip this one (over budget) but keep trying lower-priority
      // items in case a shorter one still fits in the remaining space.
    });
    return notes;
  }

  static ensureConfigCard() {
    this.init();
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;
    try {
      const exists = storyCards.some(c => c && (String(c.keys).toLowerCase().includes("config") || (c.entry || "").includes("[WORLD CONFIG]")));
      if (!exists) {
        const notesStr = `This card is EMERGENCE OS's control panel. You don't need to touch anything
below to use the script - it's already running. Everything here is optional
fine-tuning for when you want it. Two things worth knowing up front:
1) NPCs are detected automatically as they appear in your story - you don't
   need to add them yourself. The character list below is just a shortcut.
2) Type /help as an action anytime to see what you can check on (their
   feelings, relationships, memories, etc.) without it costing you a turn.

[CHARACTERS]
# List character first names below, one per line, to manually integrate them
# with the script - this gives them trust/grudge/bias/threat tracking right
# away instead of waiting for the script to auto-detect them from the story.
# Example:
# Marcus
# Elena

[SETTINGS GUIDE]
Grouped by what each setting actually affects, with what you'd actually
notice in play, not just the raw option list. Edit the WORLD CONFIG block
above using these exact values. Everything defaults to a fully-on, realistic
setup - you only need to touch any of this if you want something different.

-- STORY TONE --
Genre: auto-detected as you play, or set it yourself (Modern, Fantasy, Sci-Fi, Horror, Cyberpunk, Superhero, etc). Shifts NPC vocabulary and danger level to match.
DialogueStyle: free text - the tone shown directly to the narrator (e.g. "Raw & Gritty", "Whimsical", "Noir", "Lighthearted").

-- NPC PSYCHOLOGY --
NPCBrainSystem: Enabled | Disabled - master switch for the whole per-NPC system: stats, memory, threat states, Undercurrents, Earned Security, all of it. Disabling this turns off most of what the script does.
AutonomyLevel: Low | Medium | High | Unchained - how hard NPCs push back against unearned demands. On Low, a forceful demand mostly gets a shrug; on Unchained, the same demand can blow up into real hostility fast. Also scaled live by how much that specific NPC already trusts or resents you - it's not a flat setting, it responds to the relationship.
HumanAgency: Enabled | Disabled - lets NPCs resist, doubt, or walk away instead of just obeying. Disable it and NPCs go back to doing whatever you tell them, no pushback at all.
PsychologicalRealism: Standard | Advanced | Raw Human - Raw Human prompts subconscious motivation to leak through in prose and Reflections; Standard keeps things more surface-level and conventional.
PhysicalQuirks: High | Moderate | Off - how often the narrator is prompted to weave in micro-tells (clenched jaws, avoided eye contact, shallow breathing) into descriptions. Off means plainer, less physically-detailed prose.
NpcColorNotes: Enabled | Disabled - the compact per-turn NPC status note (threat state, bias, feelings) sent to the narrator each turn. It's hidden from the story itself either way; this only controls whether it's generated at all, for anyone who checks their context breakdown and would rather not see it there.
ProtectAuthorsNote: Enabled | Disabled - a full stop, broader than NpcColorNotes above. If you've typed your own custom Author's Note in AI Dungeon's own story settings and want it left completely alone, set this to Enabled - the script will never touch that field at all, for any reason. The tradeoff: you also lose the romance/Earned Security "let this show" nudges, AI-authored profile-fill requests, and reflection requests while this is on, since those all use that same field. Off by default.
InnerSelfSystem: Enabled | Disabled - whether each NPC's hidden Goal/Secret/Belief surface on their character card via /card, instead of staying entirely internal.

-- TRUST, GRUDGE & CONSEQUENCES --
GrudgeTracking: Enabled | Disabled - persistent trust/grudge memory of how you treat each NPC. Grudge always softens slowly over time on its own if nothing reinforces it; trust never auto-recovers, it has to be actively rebuilt through good treatment. Both only track at all while this is Enabled.
ConsequenceSeverity: Mild | Moderate | Hardcore - how hard betrayal and lying specifically land on trust and grudge. On Mild a lie stings but fades; on Hardcore it can undo a long relationship in a single turn.

-- RELATIONSHIPS BETWEEN NPCs --
LivingWorldEngine: Enabled | Disabled - master switch for everything NPC-to-NPC: Undercurrents (relationship dynamics inferred passively from the story - nothing scheduled, nothing invented), Word Gets Around (both good and bad reputation spreading between close confidants), and Coalitions/Rivalry Blocs (emergent groups of 3+ NPCs who all feel the same way about each other). Also controls whether Undercurrents soften over time the same way grudge does.
JealousyMechanic: Enabled | Disabled - whether public romance with one NPC visibly cools another interested NPC's Undercurrent toward them.
RomanceEngine: 18+ Unrestricted | PG-13 | Disabled - master switch for attraction tracking and relationship stages (Platonic through In Love).
RomancePacing: Fast | Normal | Slow Burn - how quickly attraction and relationship stages progress. Slow Burn roughly halves the pace of Normal; Fast roughly doubles it.

-- WORLD & LOCATIONS --
WorldTensionEngine: Dynamic | Static | Disabled - whether gunfire/explosions/chaos raise a 0-100% tension scale. On Dynamic, this also personally stresses any NPC actually present in the scene (not just you), and a genuine crisis breaking in one NPC visibly rattles others who witness it (Emotional Contagion).
PlayerTrauma: Enabled | Disabled - whether high player stress injects sensory-distortion prose (tunnel vision, muffled audio, racing pulse) into what you read.
LocationCards: Enabled | Disabled - master switch for auto-tracked location Story Cards, their condition, and felt Atmosphere.
LocationAutoUpdate: Enabled | Disabled - whether existing location cards update automatically as conditions change, or only when you manually use /loc.

-- PRIVATE REFLECTIONS --
ReflectionSystem: Enabled | Disabled - off by default. Lets NPCs occasionally form one private first-person reflection, saved to their own card. Never shown in the story and never read back into the AI - purely for you.
ReflectionInterval: minimum turns between reflection attempts (default 6).
ReflectionChance: percent chance per eligible turn once the interval has passed (default 50). Lower this for rarer, more meaningful reflections; raise it for more frequent ones.

-- PACING --
ProtagonistInvolvement: Low | Medium | High | Always - how much NPC-to-NPC gossip and drama gets surfaced to you directly through the Gossip line each turn, versus staying in the background until you go check /undercurrents or /factions yourself.

-- CONTENT --
MatureContent: 18+ Unrestricted | Disabled - explicit, unfiltered narrative permission.
GraphicRealism: Unfiltered | Standard | Mild - combat and violence detail level.

Not sure where to start? Everything above is already on and working - you don't
need to change anything. The two settings people adjust most are AutonomyLevel
(if pushback feels too soft or too harsh) and RomancePacing (if relationships
are moving faster or slower than you'd like).

Type /help for the full command list, or /settings for a shorter version of this guide in-game.`;

        this.createStoryCard(
          "master_world_config",
          `[WORLD CONFIG]\nGenre: Modern\nInnerSelfSystem: Enabled\nLivingWorldEngine: Enabled\nProtagonistInvolvement: Medium\nRomanceEngine: 18+ Unrestricted\nJealousyMechanic: Enabled\nConsequenceSeverity: Hardcore\nDialogueStyle: Raw & Gritty\nNPCBrainSystem: Enabled\nLocationCards: Enabled\nLocationAutoUpdate: Enabled\nGrudgeTracking: Enabled\nWorldTensionEngine: Dynamic\nPlayerTrauma: Enabled\nAutonomyLevel: High\nPsychologicalRealism: Raw Human\nHumanAgency: Enabled\nPhysicalQuirks: High\nNpcColorNotes: Enabled\nProtectAuthorsNote: Disabled\nMatureContent: 18+ Unrestricted\nGraphicRealism: Unfiltered\nReflectionSystem: Disabled\nReflectionInterval: 6\nReflectionChance: 50\nRomancePacing: Normal`,
          "Custom",
          "Master World Config",
          notesStr
        );
      }
    } catch (e) {}
  }

  static syncSettings() {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;
    try {
      const card = storyCards.find(c => c && (String(c.keys).toLowerCase().includes("config") || (c.entry || "").includes("[WORLD CONFIG]")));
      if (card) {
        const lines = (card.entry || "").split('\n');
        lines.forEach(line => {
          const match = line.match(/^([A-Za-z]+):\s*(.+)$/);
          if (match && state.emergence.config[match[1]] !== undefined) {
            state.emergence.config[match[1]] = match[2].trim();
          }
        });

        const notesToScan = card.description || card.notes || "";
        const charsMatch = notesToScan.match(/\[CHARACTERS\]([\s\S]*?)\[SETTINGS GUIDE\]/i);
        if (charsMatch) {
          const charLines = charsMatch[1].split('\n');
          charLines.forEach(line => {
            const name = line.trim();
            // Skip blank lines and comment lines (anything starting with #) -
            // only bare, uncommented lines are treated as real character names.
            if (!name || name.startsWith('#')) return;
            if (!state.world.npcs[name]) {
              this.initializeNPC(this.toTitleCase(name));
            }
          });
        }
      }
    } catch (e) {}
  }

  static processCommand(cmdText) {
    const cmd = cmdText.trim().toLowerCase();

    if (cmd.startsWith('/help')) {
      return "⚙️ EMERGENCE OS is already running in the background - you don't need to type anything to use it. These commands just let you check in on what it's tracking, whenever you want:\n/loc [name] - Set location & make card\n/card [name] - Generate Character Card\n/npc [name] - View NPC dossier\n/npcs - List active NPCs\n/locations - List tracked locations\n/forget [name] - Remove a wrongly-detected NPC & its cards\n/undercurrents - View NPC-to-NPC relationship dynamics\n/reputation - View your overall standing across all known NPCs\n/factions - View emergent Coalitions & Rivalry Blocs\n/romance [name] - View romantic standing (all NPCs, or one)\n/reflections [name] - Read a character's private reflections\n/settings - View the settings guide\n/cleanup - Purge invalid NPCs (incl. any matching a known location)\n/world - View state";
    }

    if (cmd.startsWith('/settings')) {
      return "🎛️ SETTINGS (edit on the Master World Config card):\nNPCBrainSystem: Enabled|Disabled - master switch for per-NPC psychology (incl. Earned Security)\nAutonomyLevel: Low|Medium|High|Unchained - pushback strength | HumanAgency: Enabled|Disabled\nPsychologicalRealism: Standard|Advanced|Raw Human | PhysicalQuirks: High|Moderate|Off\nNpcColorNotes: Enabled|Disabled - hide the per-turn NPC status note from your context breakdown\nProtectAuthorsNote: Enabled|Disabled - never touch your own custom Author's Note at all (costs you the romance/security/profile-fill/reflection nudges)\nInnerSelfSystem: Enabled|Disabled - Goal/Secret/Belief on character cards\nGrudgeTracking: Enabled|Disabled | ConsequenceSeverity: Mild|Moderate|Hardcore\nLivingWorldEngine: Enabled|Disabled - master switch for Undercurrents/Coalitions/Reputation\nJealousyMechanic, RomanceEngine, RomancePacing - relationship settings\nWorldTensionEngine (also drives Emotional Contagion), PlayerTrauma, LocationCards, LocationAutoUpdate\nReflectionSystem (off by default), ReflectionInterval, ReflectionChance - private reflections\nProtagonistInvolvement: Low|Medium|High|Always | MatureContent, GraphicRealism - content\nFull grouped explanations are in the Master World Config card's notes.";
    }

    if (cmd.startsWith('/loc ')) {
      const locName = this.toTitleCase(cmdText.substring(5).trim());
      state.emergence.currentLocation = locName;
      this.processLocationCards(true);
      return `📍 Location updated to: ${locName}. Smart Location Card generated/synced.`;
    }

    if (cmd.startsWith('/cleanup')) {
      const originalCount = Object.keys(state.world.npcs).length;
      const ignore = ["Dan", "Eve", "Door", "Table", "Shadows", "Sun", "Moon", "City", "Street"];
      const locNames = Object.keys(state.world.locations).map(l => l.toLowerCase());
      Object.keys(state.world.npcs).forEach(n => {
        if (ignore.includes(n) || locNames.includes(n.toLowerCase())) delete state.world.npcs[n];
      });
      return `🧹 Cleanup complete. Removed ${originalCount - Object.keys(state.world.npcs).length} invalid entries.`;
    }

    if (cmd.startsWith('/forget ')) {
      const name = cmdText.substring(8).trim();
      const actualName = this.findNpcByName(name);
      if (!actualName) return `🤖 NPC '${name}' not found. Try /npcs for a list.`;
      delete state.world.npcs[actualName];
      if (typeof storyCards !== 'undefined' && Array.isArray(storyCards)) {
        const reflectKey = "eos-reflect:" + actualName.toLowerCase();
        for (let i = storyCards.length - 1; i >= 0; i--) {
          const c = storyCards[i];
          if (c && (c.title === actualName || c.keys === reflectKey)) storyCards.splice(i, 1);
        }
      }
      return `🧹 Forgot ${actualName} - removed from tracking along with any related cards.`;
    }

    if (cmd.startsWith('/undercurrents') || cmd.startsWith('/drives') || cmd.startsWith('/threads')) {
      const names = Object.keys(state.world.npcs);
      const seen = {};
      const lines = [];
      names.forEach(n => {
        const npc = state.world.npcs[n];
        if (!npc.undercurrents) return;
        Object.keys(npc.undercurrents).forEach(target => {
          const pairKey = [n, target].sort().join('|');
          if (seen[pairKey]) return;
          seen[pairKey] = true;
          const warmth = npc.undercurrents[target];
          const tone = warmth > 0 ? "warmth" : "tension";
          lines.push(`• ${n} ↔ ${target}: ${tone} (${warmth})`);
        });
      });
      let out = "";
      if (lines.length) {
        out += "🌊 Undercurrents:\n" + lines.join('\n');
      } else {
        out += "🌊 No undercurrents have formed between NPCs yet - they emerge from what actually happens in the story.";
      }
      if (state.emergence.activeThreads.length) {
        out += "\n\n🗣️ Recent Gossip:\n" + state.emergence.activeThreads.map(t => `• ${t}`).join('\n');
      }
      return out;
    }

    if (cmd.startsWith('/factions')) {
      const groups = this.detectCoalitions();
      if (!groups.coalitions.length && !groups.rivalryBlocs.length) {
        return "🤝 No emergent factions yet - a Coalition or Rivalry Bloc forms when three or more NPCs all feel the same way about each other, purely from what's happened in the story.";
      }
      const avgOf = (members, stat) => Math.round(members.reduce((sum, n) => sum + state.world.npcs[n][stat], 0) / members.length);
      let out = "";
      if (groups.coalitions.length) {
        out += "🤝 Coalitions:\n" + groups.coalitions.map(c => `• ${c.join(', ')} (your standing: ${avgOf(c, 'trust')} avg trust)`).join('\n');
      }
      if (groups.rivalryBlocs.length) {
        if (out) out += "\n\n";
        out += "⚔️ Rivalry Blocs:\n" + groups.rivalryBlocs.map(c => `• ${c.join(', ')} (your standing: ${avgOf(c, 'grudge')} avg grudge)`).join('\n');
      }
      return out;
    }

    if (cmd.startsWith('/reflections') || cmd.startsWith('/thoughts')) {
      const name = cmdText.replace(/^\/(reflections|thoughts)/, '').trim();
      if (!name) return "💭 Usage: /reflections [name]";
      const actualName = this.findNpcByName(name);
      if (!actualName) return `🤖 NPC '${name}' not found. Try /npcs for a list.`;
      if (state.emergence.config.ReflectionSystem !== "Enabled") {
        return "💭 Reflections are currently disabled. Set ReflectionSystem: Enabled on the Master World Config card.";
      }
      const npc = state.world.npcs[actualName];
      if (!npc.reflections || !npc.reflections.length) return `💭 No reflections captured yet for ${actualName}.`;
      return `💭 ${actualName}'s Private Reflections:\n` + npc.reflections.map(r => `${r.n}. ${r.text}`).join('\n');
    }

    if (cmd.startsWith('/card ')) {
      const name = cmdText.substring(6).trim();
      let actualName = this.findNpcByName(name);

      if (!actualName) {
        actualName = this.toTitleCase(name);
        this.initializeNPC(actualName);
      }
      return this.generateCharacterCard(actualName);
    }

    if (cmd.startsWith('/npcs')) {
      const names = Object.keys(state.world.npcs);
      if (names.length === 0) return "👥 No NPCs discovered yet.";
      return "👥 Active NPCs:\n" + names.map(n => `• ${n} | Trust: ${state.world.npcs[n].trust} | Threat: ${state.world.npcs[n].threatState}`).join('\n');
    }

    if (cmd.startsWith('/locations')) {
      const names = Object.keys(state.world.locations);
      if (names.length === 0) return "🗺️ No locations tracked yet - these fill in automatically as the story names places.";
      return "🗺️ Known Locations:\n" + names.map(n => {
        const loc = state.world.locations[n];
        const marker = n === state.emergence.currentLocation ? " (current)" : "";
        return `• ${n}${marker} | ${loc.condition} | ${this.locationAtmosphere(loc)}`;
      }).join('\n');
    }

    if (cmd.startsWith('/npc ')) {
      const name = cmdText.substring(5).trim();
      const actualName = this.findNpcByName(name);
      if (!actualName) return `🤖 NPC '${name}' not found. Try /npcs for a list.`;

      const npc = state.world.npcs[actualName];
      let out = `👤 DOSSIER: ${actualName}\n`;
      out += `❤️ Trust: ${npc.trust}/100 | 💢 Grudge: ${npc.grudge}/100\n`;
      out += `⚠️ Threat: ${npc.threatState} | 🧠 Bias: ${npc.cognitiveBias} | 🧬 Attachment: ${npc.attachmentStyle}\n`;
      if (npc.lastSeenLocation) {
        const turnsAgo = Math.max(0, (state.emergence.turnCount || 0) - (npc.lastSeenTurn || 0));
        out += `📍 Last seen: ${npc.lastSeenLocation}${turnsAgo > 0 ? ` (${turnsAgo} turn${turnsAgo === 1 ? '' : 's'} ago)` : ' (just now)'}\n`;
      }
      if (state.emergence.config.InnerSelfSystem === "Enabled") {
        out += `🎯 Hidden Goal: ${npc.hiddenGoal}\n🤫 Secret: ${npc.secret}\n🧭 Belief: ${npc.coreBelief}\n`;
      }
      out += `🎭 Outer Mask: ${npc.outerMask}\n💭 Inner Mind: ${npc.innerMind}\n`;
      if (state.emergence.config.RomanceEngine !== "Disabled" && npc.attraction > 0) {
        out += `💞 Romance: ${this.getRelationshipStage(npc.attraction)} (${npc.attraction}/100)\n`;
      }
      const strongest = this.strongestUndercurrent(npc);
      if (strongest) {
        const tone = strongest.warmth > 0 ? "warmth" : "tension";
        out += `🌊 Undercurrent: ${tone} with ${strongest.target} (${strongest.warmth})\n`;
      }
      if (npc.reflections && npc.reflections.length) {
        out += `💭 Reflections logged: ${npc.reflections.length} (use /reflections ${actualName} to read)\n`;
      }
      if (npc.attachmentStyle !== "Secure" && npc.secureStreak > 0) {
        out += `🔐 Building earned security: ${npc.secureStreak}/10 (sustained trust may shift their attachment style)\n`;
      }
      out += `🧠 Core Memory: ${npc.memories.length > 0 ? npc.memories[npc.memories.length - 1] : "None."}`;
      if (npc.coreMemory) out += `\n⭐ Formative Memory: ${npc.coreMemory}`;
      return out;
    }

    if (cmd.startsWith('/romance')) {
      if (state.emergence.config.RomanceEngine === "Disabled") {
        return "💞 Romance Engine is currently disabled. Set RomanceEngine to a value other than Disabled on the Master World Config card.";
      }
      const name = cmdText.substring(8).trim();
      if (!name) {
        const names = Object.keys(state.world.npcs).filter(n => state.world.npcs[n].attraction > 0);
        if (!names.length) return "💞 No romantic feelings have developed yet.";
        return "💞 Romantic Standing:\n" + names.map(n => {
          const npc = state.world.npcs[n];
          return `• ${n}: ${this.getRelationshipStage(npc.attraction)} (${npc.attraction}/100)`;
        }).join('\n');
      }
      const actualName = this.findNpcByName(name);
      if (!actualName) return `🤖 NPC '${name}' not found. Try /npcs for a list.`;
      const npc = state.world.npcs[actualName];
      return `💞 ${actualName}: ${this.getRelationshipStage(npc.attraction)} (${npc.attraction}/100)`;
    }

    if (cmd.startsWith('/reputation')) {
      const names = Object.keys(state.world.npcs);
      if (!names.length) return "📊 No NPCs discovered yet to have a reputation with.";
      const avgTrust = Math.round(names.reduce((sum, n) => sum + state.world.npcs[n].trust, 0) / names.length);
      const avgGrudge = Math.round(names.reduce((sum, n) => sum + state.world.npcs[n].grudge, 0) / names.length);
      let standing;
      if (avgTrust >= 70 && avgGrudge <= 20) standing = "Well-regarded";
      else if (avgGrudge >= 60) standing = "Widely distrusted";
      else if (avgTrust <= 30) standing = "Not well known or liked";
      else standing = "Mixed reputation";
      return `📊 OVERALL REPUTATION (across ${names.length} known NPC${names.length === 1 ? '' : 's'}):\nAverage Trust: ${avgTrust}/100 | Average Grudge: ${avgGrudge}/100\nStanding: ${standing}`;
    }

    if (cmd.startsWith('/world')) {
      const loc = state.world.locations[state.emergence.currentLocation];
      let locLine;
      if (state.emergence.currentLocation === "Unknown Location") {
        locLine = "Not yet established - this fills in automatically once the story names a place";
      } else {
        const locCond = loc ? loc.condition : "Intact";
        const atmosphere = loc ? this.locationAtmosphere(loc) : "Calm";
        locLine = `${state.emergence.currentLocation} (${locCond}, ${atmosphere})`;
      }
      return `🌍 WORLD STATE:\n📍 Location: ${locLine}\n🔥 Tension: ${state.emergence.worldTension}%\n🫀 Player Stress: ${state.playerInner.stress}% (${state.playerInner.condition})`;
    }

    return null;
  }

  static generateCharacterCard(name) {
    if (typeof storyCards === 'undefined') return "⚠️ Story Cards unavailable.";
    if (!state.world.npcs[name]) {
      this.initializeNPC(name);
    }

    const exists = storyCards.find(c => c && c.title && c.title.toLowerCase() === name.toLowerCase());
    if (exists) return `⚠️ Card for ${name} already exists.`;

    const template = `Name: ${name}\nRace: [Define Race]\nStrength Level: [Define Strength]\n\nBackground:\n[Define Background]\n\nPersonality:\n[Define Personality]\n\nAppearance:\n[Define Appearance]\n[Measurements/Weight/Height]\n\nAbilities:\n• [Ability 1]\n\nWeaknesses:\n• [Weakness 1]\n\nRelationships:\n• [Relationship 1]\n\n--- EMERGENCE STATE ---\n[PENDING DATA SYNC]`;

    const card = this.createStoryCard(name.toLowerCase(), template.substring(0, 1490), "Character", name, "");
    if (card) card.category = "Characters";

    this.updateCharacterCards();
    state.emergence.pendingProfileFill.push({ name: name, attempts: 0 });
    return `✅ Character Card created for ${name} in 'Characters'. Filling in their profile now...`;
  }

  static updateCharacterCards() {
    if (typeof storyCards === 'undefined') return;
    storyCards.forEach(card => {
      if (card && card.category === "Characters" && state.world.npcs[card.title]) {
        const npc = state.world.npcs[card.title];
        let mem = npc.memories.length > 0 ? npc.memories[npc.memories.length - 1] : "No core memories.";
        let stateBlock = `--- EMERGENCE STATE ---\nTrust: ${npc.trust}/100 | Grudge: ${npc.grudge}/100 | Threat: ${npc.threatState}\nBias: ${npc.cognitiveBias} | Mask: ${npc.outerMask}\nMemory: ${mem}`;

        if (state.emergence.config.InnerSelfSystem === "Enabled") {
          stateBlock += `\nGoal: ${npc.hiddenGoal}\nBelief: ${npc.coreBelief}`;
        }
        const strongestUC = this.strongestUndercurrent(npc);
        if (strongestUC) {
          stateBlock += `\nUndercurrent: ${strongestUC.warmth > 0 ? "warmth" : "tension"} with ${strongestUC.target}`;
        }
        if (npc.coreMemory) {
          stateBlock += `\nFormative Memory: ${npc.coreMemory}`;
        }

        if (card.entry) {
          let baseLore = card.entry.split('--- EMERGENCE STATE ---')[0].trim();
          let newEntry = `${baseLore}\n\n${stateBlock}`;
          if (newEntry.length > 1500) {
            newEntry = newEntry.substring(0, 1497) + "...";
          }
          card.entry = newEntry;
        }
      }
    });
  }

  static discoverLocations(text) {
    if (!text || state.emergence.config.LocationCards !== "Enabled") return;
    const invalidLocs = ["Door", "Table", "Room", "House", "City", "Street", "Car", "Morning", "Night",
      "Shadows", "Sun", "Moon", "He", "She", "It", "They", "We", "His", "Her", "Your", "My", "Our",
      "Their", "Its", "Him", "Them", "This", "That", "These", "Those", "Something", "Someone",
      "Everyone", "Everything", "Nothing", "Anybody", "Anyone"];

    // Three complementary patterns, since a place can be introduced several ways:
    //   "you enter the Cafe"          - preposition + the/a/an + Name
    //   "the city of Larion"          - place-noun + of + Name (name comes AFTER)
    //   "Larion City" / "Neo Academy" - Name + place-noun (name comes BEFORE)
    const patterns = [
      /\b(?:in|into|at|inside|enters?|entering|approaching|towards|arriving at|reach(?:es|ed)?|explore) (?:the |a |an )?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/g,
      /\b(?:[Cc]ity|[Tt]own|[Vv]illage|[Kk]ingdom|[Rr]ealm|[Ll]and|[Nn]ation|[Rr]egion|[Dd]istrict|[Pp]rovince|[Ww]orld|[Pp]lanet|[Ii]sland|[Vv]alley|[Ff]orest|[Ss]tate|[Cc]ountry|[Ee]mpire|[Cc]astle|[Tt]emple|[Aa]cademy|[Gg]uild|[Tt]avern|[Ii]nn|[Tt]ower|[Ff]ortress|[Pp]alace) of (?:the |a |an )?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/g,
      /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?) (?:City|Town|Village|Kingdom|Realm|Academy|Tavern|Inn|Tower|Fortress|Palace|Castle)\b/g
    ];

    patterns.forEach(re => {
      re.lastIndex = 0;
      let match;
      while ((match = re.exec(text)) !== null) {
        let potentialLoc = match[1].trim();
        if (potentialLoc && !invalidLocs.includes(potentialLoc) && !state.world.npcs[potentialLoc]) {
          if (!state.world.locations[potentialLoc] && Object.keys(state.world.locations).length >= 40) {
            return; // cap reached - keep tracking known locations, stop registering brand new ones
          }
          state.emergence.currentLocation = potentialLoc;
          if (state.emergence.config.LocationAutoUpdate === "Enabled") {
            this.processLocationCards(false);
          }
        }
      }
    });
  }

  static updateLocationConditions(text) {
    if (!text) return;

    const patterns = this.getTriggerPatterns();
    const conditionOf = (chunk) => {
      if (patterns.locFire.test(chunk)) return "On Fire";
      if (patterns.locDestroyed.test(chunk)) return "Destroyed";
      if (patterns.locLocked.test(chunk)) return "Locked Down";
      if (patterns.locSafe.test(chunk)) return "Intact";
      return null;
    };

    // Split into rough clauses on sentence breaks and contrast words ("but",
    // "while", etc.) so "X is destroyed, but Y is safe" attributes each
    // condition to the right place instead of blending both together.
    const marked = text
      .replace(/([.!?;])\s+/g, '$1\u0001')
      .replace(/\s+\b(but|while|whereas|yet|however|although)\b\s+/gi, '\u0001$1 ');
    const clauses = marked.split('\u0001');

    const known = Object.keys(state.world.locations);
    let matchedAny = false;
    known.forEach(locName => {
      const re = new RegExp(`\\b${this.escapeRegExp(locName)}\\b`, 'i');
      const ownClauses = clauses.filter(c => re.test(c));
      if (!ownClauses.length) return;
      matchedAny = true;
      const newCond = conditionOf(ownClauses.join(' '));
      if (newCond && newCond !== state.world.locations[locName].condition) {
        state.world.locations[locName].condition = newCond;
        if (state.emergence.config.LocationAutoUpdate === "Enabled") this.processLocationCards(false, locName);
      }
    });

    if (!matchedAny) {
      const locName = state.emergence.currentLocation;
      if (locName === "Unknown Location") return;
      if (!state.world.locations[locName]) state.world.locations[locName] = { condition: "Intact" };
      const newCond = conditionOf(text);
      if (newCond && newCond !== state.world.locations[locName].condition) {
        state.world.locations[locName].condition = newCond;
        if (state.emergence.config.LocationAutoUpdate === "Enabled") this.processLocationCards(false, locName);
      }
    }
  }

  // A location's felt atmosphere, derived from its condition and current world
  // tension rather than stored separately - always in sync, no extra state.
  static locationAtmosphere(loc) {
    if (loc.condition === "On Fire" || loc.condition === "Destroyed") return "Chaotic";
    if (loc.condition === "Locked Down") return "Tense";
    if (state.emergence.worldTension > 50) return "On Edge";
    if (state.emergence.worldTension > 25) return "Uneasy";
    return "Calm";
  }

  static processLocationCards(forceCreate = false, locNameOverride = null) {
    if (state.emergence.config.LocationCards !== "Enabled") return;
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;
    const locName = locNameOverride || state.emergence.currentLocation;
    if (!locName || locName === "Unknown Location") return;

    if (!state.world.locations[locName]) {
      state.world.locations[locName] = { condition: "Intact" };
    }
    const loc = state.world.locations[locName];
    let entryText = `[LOCATION: ${locName}]\nA dynamic environment mapped by EMERGENCE OS.\nCondition: ${loc.condition} | Atmosphere: ${this.locationAtmosphere(loc)} | Local Tension: ${state.emergence.worldTension}%.`;
    if (loc.echo) entryText += `\nEcho: ${loc.echo}`;

    let card = storyCards.find(c => c && c.category === "Locations" && c.title === locName);

    if (!card && forceCreate) {
      const newCard = this.createStoryCard(locName.toLowerCase(), entryText, "Location", locName, "");
      if (newCard) newCard.category = "Locations";
    } else if (card && state.emergence.config.LocationAutoUpdate === "Enabled") {
      card.entry = entryText;
    }
  }

  static initializeNPC(m) {
    const biases = ["Paranoid", "Deflective", "Prideful", "Impulsive", "Skeptical"];
    const attachments = ["Secure", "Anxious", "Avoidant", "Disorganized"];
    const goals = ["Survive the day", "Gain leverage", "Hide their past", "Protect a loved one", "Find an escape route"];
    const secrets = ["Betrayed an ally", "Owes a massive debt", "Harbors forbidden magic/tech", "Lying about identity"];

    state.world.npcs[m] = {
      trust: 50, grudge: 0, stress: 10, egoReserve: 100, attraction: 0,
      cognitiveBias: biases[Math.floor(Math.random() * biases.length)],
      attachmentStyle: attachments[Math.floor(Math.random() * attachments.length)],
      hiddenGoal: goals[Math.floor(Math.random() * goals.length)],
      secret: secrets[Math.floor(Math.random() * secrets.length)],
      coreBelief: "Unsure of their place in the world.",
      threatState: "Composed", mood: "Neutral", outerMask: "Guarded.", innerMind: "Observing.",
      memories: [], coreMemory: "",
      undercurrents: {},
      reflections: [],
      lastSeenLocation: "", lastSeenTurn: 0, secureStreak: 0
    };
    this.adoptExistingCard(m);
  }

  // If the scenario author already made a Story Card for this character
  // before this script ever ran, "adopt" it into the auto-update system
  // instead of ignoring it and creating a separate one. Adoption ONLY marks
  // the card so its EMERGENCE STATE block gets appended/refreshed going
  // forward (through the exact same updateCharacterCards() path a /card-made
  // sheet uses, which already preserves everything above that marker) - it
  // never rewrites, replaces, or touches a single word of the author's
  // existing lore. AI-authored profile-fill (which invents Race/Background/
  // etc.) is a completely separate path that only ever runs for cards this
  // script created itself via /card - an adopted card never goes through it,
  // so nothing gets invented on top of what the author already wrote.
  static adoptExistingCard(name) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;
    const card = storyCards.find(c => c && c.category !== "Characters" && c.type !== "Location" &&
      c.title && c.title.toLowerCase() === name.toLowerCase());
    if (card) {
      card.category = "Characters";
    }
  }

  // Finds capitalized words and flags whether each occurred at the START of a
  // sentence (where English capitalizes ANY word) or genuinely mid-sentence
  // (a much stronger signal of a real proper noun).
  static scanCapitalizedWords(text) {
    const results = [];
    const re = /\b([A-Z][a-z]{2,10})\b/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      let i = m.index - 1;
      let crossedQuote = false;
      while (i >= 0 && /[\s"'\u2018\u2019\u201C\u201D]/.test(text[i])) {
        if (/["'\u2018\u2019\u201C\u201D]/.test(text[i])) crossedQuote = true;
        i--;
      }
      const prevChar = i >= 0 ? text[i] : null;
      // The first word inside an opening quote is treated as sentence-initial
      // too, even if a comma (not a full stop) introduces it - "Marcus said,
      // "Don't move."" opens a genuinely new sentence at "Don't", but the
      // character right before the quote is just a comma. Without this, the
      // first word of nearly any line of dialogue was being read as a
      // confirmed mid-sentence proper noun and instantly promoted to an NPC.
      const sentenceInitial = (prevChar === null) || /[.!?]/.test(prevChar) || crossedQuote;
      results.push({ word: m[1], sentenceInitial: sentenceInitial });
    }
    return results;
  }

  static discoverCharacters(text) {
    if (!text || state.emergence.config.NPCBrainSystem !== "Enabled") return;
    // Common words that get capitalized only because they start a sentence, not
    // because they're names. This list is the first line of defense; the
    // mid-sentence check below is the second.
    const ignore = [
      "Dan", "Eve", "Door", "Shadows", "Table", "Sun", "Moon", "City", "Street", "Blood",
      "I", "You", "He", "She", "It", "They", "We", "His", "Her", "Him", "Them", "Their",
      "Its", "My", "Our", "Your", "Mine", "Yours", "Ours", "Theirs", "Myself", "Yourself",
      "Himself", "Herself", "Itself", "Themselves", "Ourselves",
      "The", "A", "An", "This", "That", "These", "Those", "Some", "Any", "No", "Not", "Every",
      "Each", "Either", "Neither", "All", "Both", "Few", "Many", "Much", "Several",
      "Who", "What", "When", "Where", "Why", "How", "Which", "Whose",
      "And", "But", "Or", "So", "Yet", "For", "Nor", "Because", "Although", "Though",
      "Since", "Unless", "While", "Whereas", "If", "Even",
      "With", "Without", "From", "Into", "Onto", "Upon", "Over", "Under", "Through",
      "Around", "Behind", "Beside", "Between", "Among", "About", "Above", "Below",
      "Near", "Toward", "Towards", "Against", "Across", "Along", "Beyond", "Within",
      "Before", "After", "During", "Until", "Despite", "Inside", "Outside",
      "Then", "Now", "Here", "There", "Suddenly", "Meanwhile", "Finally", "Eventually",
      "Perhaps", "Maybe", "Still", "Also", "Instead", "However", "Therefore", "Otherwise",
      "Indeed", "Certainly", "Obviously", "Clearly", "Slowly", "Quickly", "Quietly",
      "Silently", "Immediately", "Soon", "Later", "Again", "Already", "Almost", "Just",
      "Only", "Rather", "Nearly", "Yes", "No", "Well", "Okay", "Ah", "Oh", "Hey", "Wait",
      "Look", "Listen", "Morning", "Night", "Evening", "Afternoon", "Today", "Tomorrow", "Yesterday",
      // Body parts and emotion/sensation nouns that intense or intimate prose
      // often uses as short, standalone sentence-openers for dramatic effect,
      // without ever meaning to introduce a new character.
      "Lips", "Eyes", "Hands", "Fingers", "Skin", "Heart", "Chest", "Neck", "Hair", "Face", "Mouth",
      "Nose", "Throat", "Shoulders", "Back", "Waist", "Breath", "Breathing",
      "Passion", "Pleasure", "Sadness", "Desire", "Fear", "Anger", "Rage", "Joy", "Terror", "Panic",
      "Silence", "Darkness", "Warmth", "Heat", "Longing", "Need", "Want", "Lust", "Love", "Hate",
      "Grief", "Shock", "Relief", "Ecstasy"
    ];

    const found = this.scanCapitalizedWords(text);
    if (!found.length) return;

    if (!state.emergence.nameCandidates) state.emergence.nameCandidates = {};
    const cands = state.emergence.nameCandidates;

    found.forEach(f => {
      const m = f.word;
      if (ignore.includes(m) || state.world.npcs[m] || state.world.locations[m]) return;
      if (Object.keys(state.world.npcs).length >= 25) return;

      if (!cands[m]) cands[m] = { count: 0, mid: false };
      cands[m].count++;
      if (!f.sentenceInitial) cands[m].mid = true;

      // Promote immediately on a genuine mid-sentence sighting (a strong signal),
      // or as a last resort after several sentence-initial mentions, so a real
      // name mentioned only at sentence starts is still eventually caught.
      // Raised from 5: short, punchy sentence-opener prose ("Lips met.
      // Passion ignited. Pleasure built.") - common in intense or intimate
      // scenes - can repeat a word as a sentence-starter well past 5 times in
      // a single scene without it ever being a real character.
      if (cands[m].mid || cands[m].count >= 8) {
        this.initializeNPC(m);
        delete cands[m];
      }
    });

    // Keep the candidate pool bounded so it can't grow unchecked over a long game.
    const keys = Object.keys(cands);
    if (keys.length > 60) {
      keys.sort((a, b) => cands[a].count - cands[b].count);
      for (let i = 0; i < keys.length - 60; i++) delete cands[keys[i]];
    }
  }

  // Which known NPCs (whole-word match) appear in the recent story text. Scans a
  // bounded trailing window so this stays cheap even in a very long adventure.
  static getSceneNames(text) {
    if (!text) return [];
    const window = text.length > 1500 ? text.slice(-1500) : text;
    const names = Object.keys(state.world.npcs);
    const found = [];
    for (let i = 0; i < names.length; i++) {
      const re = new RegExp(`\\b${this.escapeRegExp(names[i])}\\b`, 'i');
      if (re.test(window)) found.push(names[i]);
    }
    return found;
  }

  // Attachment style shapes stress response as much as cognitive bias does -
  // an Avoidant NPC shuts down (Freeze) under the same pressure that sends an
  // Anxious one seeking appeasement (Fawn) instead of fighting or fleeing.
  // Threat states follow the real polyvagal hierarchy: Freeze (dorsal vagal
  // shutdown) is reserved for the most extreme tier since it's more severe
  // than the sympathetic fight/flight/fawn responses, not an equal alternative
  // to them. Fawn stays available to Anxious-attachment NPCs even at extreme
  // stress, since real research frames fawning as their persistent go-to
  // strategy across the threat range, not something that stops working under
  // real pressure and gets replaced by fight.
  static getThreatState(stress, bias, attachmentStyle) {
    if (stress < 30) return "Composed";
    if (stress > 80) {
      if (attachmentStyle === "Anxious") return "Fawn";
      if (bias === "Paranoid" || bias === "Skeptical" || attachmentStyle === "Avoidant") return "Freeze";
      return "Fight";
    }
    if (stress > 60) {
      if (attachmentStyle === "Anxious") return "Fawn";
      return "Flight";
    }
    return "Fawn";
  }

  // How fast an NPC's trust actually rises in response to being treated well -
  // a Skeptical or Paranoid NPC makes you earn it; an Impulsive one warms fast.
  static trustGainMultiplier(bias) {
    const map = { "Skeptical": 0.6, "Paranoid": 0.7, "Prideful": 0.85, "Impulsive": 1.3 };
    return map[bias] !== undefined ? map[bias] : 1;
  }

  // Pushback isn't just AutonomyLevel in a vacuum - an NPC who already resents
  // you escalates faster (piling on), while one who's earned deep trust with
  // you gives a bit more benefit of the doubt for the same forceful moment.
  static contextualPushbackMultiplier(npc) {
    let mult = this.autonomyMultiplier();
    if (npc.grudge > 60) mult *= 1.3;
    if (npc.trust > 70) mult *= 0.8;
    else if (npc.trust < 30) mult *= 1.15;
    return mult;
  }

  static simulateSelfReflection() {
    // Grudge cools slightly over time if nothing reinforces it - anger fades
    // even when trust still has to be actively rebuilt, so this only touches
    // grudge, and only by a small amount relative to how fast betrayal raises it.
    // Ego reserve recovers the same way, but only while an NPC isn't actively
    // stressed - you can't regain your composure while still under pressure.
    // Undercurrents soften the same way too, for the same reason grudge does -
    // tension between two NPCs that nothing keeps reinforcing gradually eases.
    if (state.emergence.config.GrudgeTracking === "Enabled" || state.emergence.config.NPCBrainSystem === "Enabled") {
      Object.keys(state.world.npcs).forEach(name => {
        const npc = state.world.npcs[name];
        if (state.emergence.config.GrudgeTracking === "Enabled" && npc.grudge > 0) {
          npc.grudge = this.clamp(npc.grudge - 2, 0, 100);
        }
        if (state.emergence.config.NPCBrainSystem === "Enabled" && npc.egoReserve < 100 && npc.stress < 40) {
          npc.egoReserve = this.clamp(npc.egoReserve + 3, 0, 100);
        }
      });
    }

    if (state.emergence.config.LivingWorldEngine === "Enabled") {
      Object.keys(state.world.npcs).forEach(name => {
        const npc = state.world.npcs[name];
        if (!npc.undercurrents) return;
        Object.keys(npc.undercurrents).forEach(target => {
          const w = npc.undercurrents[target];
          const next = w > 0 ? Math.max(0, w - 1) : Math.min(0, w + 1);
          if (next === 0) delete npc.undercurrents[target];
          else npc.undercurrents[target] = next;
        });
      });
    }

    if (state.emergence.config.InnerSelfSystem !== "Enabled") return;
    Object.keys(state.world.npcs).forEach(name => {
      let npc = state.world.npcs[name];
      if (npc.egoReserve < 30 || npc.stress > 80) {
        npc.hiddenGoal = "Prioritize immediate survival and escape.";
        npc.coreBelief = "The world is unsafe. I must protect myself.";
      } else if (npc.trust > 80) {
        npc.coreBelief = "The protagonist is a trusted ally and friend.";
      } else if (npc.grudge > 80 || npc.trust < 20) {
        npc.coreBelief = "The protagonist is a severe threat and must be dealt with.";
      }
    });
  }

  // WORD GETS AROUND
  // Reputation quietly spreads between NPCs who are genuine confidants (a
  // strong Undercurrent). If A trusts B, and B has a much harsher opinion of
  // the player than A does, some of that rubs off on A - and vice versa. This
  // only exists because Trust/Grudge and multi-target Undercurrents are both
  // already tracked; it's the two systems talking to each other, not a new
  // one bolted on. Bounded and slow by design - a ripple, not a copy.
  static spreadReputation() {
    if (state.emergence.config.LivingWorldEngine !== "Enabled") return;
    const names = Object.keys(state.world.npcs);
    if (names.length < 2) return;
    names.forEach(a => {
      const npcA = state.world.npcs[a];
      if (!npcA.undercurrents) return;
      Object.keys(npcA.undercurrents).forEach(b => {
        if (npcA.undercurrents[b] < 50) return; // only close confidants gossip
        const npcB = state.world.npcs[b];
        if (!npcB) return;
        const grudgeDiff = npcB.grudge - npcA.grudge;
        if (grudgeDiff > 25) this.updateStat(npcA, 'grudge', 3);
        else if (grudgeDiff < -25) this.updateStat(npcA, 'grudge', -2);
        // A confidant vouching for you spreads too, not just one warning you off.
        const trustDiff = npcB.trust - npcA.trust;
        if (trustDiff > 25) this.updateStat(npcA, 'trust', 2);
        else if (trustDiff < -25) this.updateStat(npcA, 'trust', -2);
      });
    });
  }

  // ROMANCE ENGINE
  // Attraction (0-100, toward the player) maps to a discrete stage so the
  // narrator - and the player, via /romance and /npc - sees a meaningful label
  // instead of a raw number. RomancePacing scales how fast attraction climbs.
  static getRelationshipStage(attraction) {
    if (attraction >= 80) return "In Love";
    if (attraction >= 60) return "Romantic";
    if (attraction >= 40) return "Flirtatious";
    if (attraction >= 20) return "Interested";
    return "Platonic";
  }

  static romancePacingMultiplier() {
    const map = { "Fast": 1.6, "Normal": 1, "Slow Burn": 0.5 };
    const v = map[state.emergence.config.RomancePacing];
    return v !== undefined ? v : 1;
  }

  // How jealousy actually reads on an NPC depends on their attachment style -
  // pure flavor text, not a tracked object, so it costs nothing to vary.
  static jealousyInnerMind(attachmentStyle) {
    const map = {
      "Secure": "Feels a quiet concern, but trusts it'll pass.",
      "Anxious": "Spiraling - certain this means they're about to be replaced.",
      "Avoidant": "Shutting down, already pulling back before it can hurt more.",
      "Disorganized": "Torn between wanting to lash out and wanting to disappear."
    };
    return map[attachmentStyle] || "Boiling with intense jealousy.";
  }

  // One-shot "act on this now" nudge for a relationship stage that just changed.
  static buildRomanceNudge() {
    const queue = state.emergence.pendingRomanceStageChange;
    if (!Array.isArray(queue) || !queue.length) return "";
    const items = queue.slice();
    state.emergence.pendingRomanceStageChange = [];
    const lines = items.map(p => `${p.name}'s feelings toward the player have shifted to ${p.stage}`);
    const plural = items.length > 1;
    return `${lines.join('. ')}. Let ${plural ? 'these' : 'this'} show through behavior, tone, or a small unguarded moment - don't state ${plural ? 'the labels themselves' : 'the label itself'}.`;
  }

  // One-shot nudge for Earned Security, mirroring buildRomanceNudge - this is
  // a real psychological milestone (an attachment style shifting because of
  // how they've been treated), and it deserves the same chance to actually
  // show up in the story as a romance stage change does, not just sit silently
  // in the background data until someone happens to check /npc.
  static buildSecurityNudge() {
    const queue = state.emergence.pendingSecurityShift;
    if (!Array.isArray(queue) || !queue.length) return "";
    const names = queue.slice();
    state.emergence.pendingSecurityShift = [];
    if (names.length === 1) {
      return `${names[0]} has genuinely learned they can trust the player, after everything that's passed between them - a real shift, not a passing mood. Let it show through a moment of unguarded openness or quiet vulnerability, not a stated realization.`;
    }
    return `${names.join(' and ')} have each genuinely learned they can trust the player, after everything that's passed between them - real shifts, not passing moods. Let this show through moments of unguarded openness or quiet vulnerability, not stated realizations.`;
  }

  // UNDERCURRENTS
  // NPC-to-NPC relationship dynamics, inferred PASSIVELY from what's already
  // happening in the story - reusing the same conjugation-aware trigger
  // patterns that drive player-NPC trust/grudge. Nothing is scheduled, nothing
  // is invented, and nothing asks the narrator to report back: if two known
  // NPCs are mentioned together in a passage and a trigger fires, their
  // Undercurrent shifts. That's the entire mechanism.
  static updateUndercurrents(text) {
    if (!text || state.emergence.config.LivingWorldEngine !== "Enabled") return;
    const names = Object.keys(state.world.npcs);
    if (names.length < 2) return;

    const lower = text.toLowerCase();
    const p = this.getTriggerPatterns();
    let delta = 0;
    let directSignal = false;
    let memoryVerb = "";
    if (p.pushback.test(lower) || p.betrayal.test(lower)) { delta -= 15; directSignal = true; memoryVerb = "Clashed with"; }
    if (p.respect.test(lower)) { delta += 10; directSignal = true; memoryVerb = "Had a good moment with"; }
    // A romantic moment only counts as warmth BETWEEN the two co-mentioned NPCs
    // if the player doesn't appear to be the one involved - "Elena kisses you
    // while Marcus watches" is Marcus witnessing something between Elena and
    // the player (that's jealousy's job, handled separately in Output), not
    // warmth between Marcus and Elena themselves.
    if (p.romance.test(lower) && !/\byou(r|rs|rself)?\b/i.test(lower)) { delta += 15; directSignal = true; memoryVerb = "Shared a romantic moment with"; }
    // Shared danger bonds people, absent any direct conflict or warmth between
    // them specifically - a small, distinct signal from the ones above.
    if (!directSignal && p.tensionUp.test(lower)) { delta = 8; memoryVerb = "Got through real danger alongside"; }
    if (delta === 0) return;

    const mentioned = names.filter(n => new RegExp(`\\b${this.escapeRegExp(n)}\\b`, 'i').test(text));
    if (mentioned.length < 2) return;

    for (let i = 0; i < mentioned.length; i++) {
      for (let j = i + 1; j < mentioned.length; j++) {
        const a = mentioned[i], b = mentioned[j];
        this.nudgeUndercurrent(a, b, delta);
        this.nudgeUndercurrent(b, a, delta);
        // NPCs remember specific incidents with EACH OTHER too, not just with
        // the player - the same way Undercurrents already track that these
        // incidents happen.
        if (memoryVerb) {
          this.pushIncidentMemory(a, `${memoryVerb} ${b}.`);
          this.pushIncidentMemory(b, `${memoryVerb} ${a}.`);
        }
      }
    }
  }

  static pushIncidentMemory(name, text) {
    const npc = state.world.npcs[name];
    if (!npc || !Array.isArray(npc.memories)) return;
    npc.memories.push(text);
    if (npc.memories.length > 3) npc.memories.shift();
  }

  // Each NPC can carry Undercurrents toward SEVERAL other characters at once,
  // not just whoever they were most recently mentioned alongside - tension with
  // one person doesn't get silently erased by a warm moment with someone else.
  static nudgeUndercurrent(name, towardName, delta) {
    const npc = state.world.npcs[name];
    if (!npc) return;
    if (!npc.undercurrents || typeof npc.undercurrents !== 'object') npc.undercurrents = {};
    const current = npc.undercurrents[towardName] || 0;
    const next = this.clamp(current + delta, -100, 100);
    if (next === 0) {
      delete npc.undercurrents[towardName];
    } else {
      npc.undercurrents[towardName] = next;
    }
  }

  // Picks the single strongest Undercurrent (by absolute warmth) an NPC
  // currently carries, for compact display where only one can be shown.
  static strongestUndercurrent(npc) {
    if (!npc || !npc.undercurrents) return null;
    const names = Object.keys(npc.undercurrents);
    if (!names.length) return null;
    let best = names[0];
    names.forEach(n => {
      if (Math.abs(npc.undercurrents[n]) > Math.abs(npc.undercurrents[best])) best = n;
    });
    return { target: best, warmth: npc.undercurrents[best] };
  }

  // COALITIONS
  // Nothing here is tracked separately - it's pure read-only analysis over the
  // Undercurrent graph that already exists. Three or more NPCs who all hold
  // strong warmth with EACH OTHER (a closed triangle, not just each liking a
  // fourth party) form a Coalition; three or more all holding strong mutual
  // hostility form a Rivalry Bloc. Entirely derived, entirely stateless -
  // nothing to seed, nothing to keep in sync, nothing that can drift from
  // the underlying relationships.
  static detectCoalitions() {
    const names = Object.keys(state.world.npcs);
    const threshold = 35;
    const warmPairs = new Set();
    const coldPairs = new Set();

    names.forEach(a => {
      const npc = state.world.npcs[a];
      if (!npc.undercurrents) return;
      Object.keys(npc.undercurrents).forEach(b => {
        if (!state.world.npcs[b]) return;
        const w = npc.undercurrents[b];
        const key = [a, b].sort().join('|');
        if (w >= threshold) warmPairs.add(key);
        if (w <= -threshold) coldPairs.add(key);
      });
    });

    const findTriangles = (pairSet) => {
      const cliques = [];
      const seen = {};
      pairSet.forEach(pairKey => {
        const [a, b] = pairKey.split('|');
        names.forEach(c => {
          if (c === a || c === b) return;
          const key1 = [a, c].sort().join('|');
          const key2 = [b, c].sort().join('|');
          if (pairSet.has(key1) && pairSet.has(key2)) {
            const clique = [a, b, c].sort();
            const cliqueKey = clique.join(',');
            if (!seen[cliqueKey]) {
              seen[cliqueKey] = true;
              cliques.push(clique);
            }
          }
        });
      });
      return cliques;
    };

    return { coalitions: findTriangles(warmPairs), rivalryBlocs: findTriangles(coldPairs) };
  }

  // Location Echoes: the same formative-moment triggers that create a
  // permanent NPC memory also tag WHERE it happened - stateless, reuses the
  // existing currentLocation, nothing new to keep in sync.
  static recordLocationEcho(text) {
    const locName = state.emergence.currentLocation;
    if (!locName || locName === "Unknown Location") return;
    if (!state.world.locations[locName]) return;
    state.world.locations[locName].echo = text;
    this.processLocationCards(false, locName);
  }

  // Sets a permanent Formative Memory, tags the current location with a
  // matching Echo, and refreshes the character card immediately - the same
  // three steps every pivotal-moment trigger needs, in one place instead of
  // copied at each call site (four of them: betrayal, In Love, Earned
  // Security, and a first crisis threat state).
  static setFormativeMemory(npc, memoryText, echoText) {
    if (!npc) return;
    npc.coreMemory = memoryText;
    this.recordLocationEcho(echoText);
    this.updateCharacterCards();
  }

  // Attachment-style-flavored verb for surfacing an Undercurrent in prose - a
  // stateless lookup, not a tracked lifecycle. Two NPCs with the same warmth
  // score can still read very differently depending on how each one attaches.
  static undercurrentVerb(attachmentStyle, warmth) {
    const positive = {
      "Secure": "has grown genuinely fond of", "Anxious": "has grown anxiously attached to",
      "Avoidant": "has, despite themself, grown close to", "Disorganized": "feels an unpredictable pull toward"
    };
    const negative = {
      "Secure": "has a real, grounded tension with", "Anxious": "feels a gnawing unease around",
      "Avoidant": "has quietly shut out", "Disorganized": "swings between resentment and guilt around"
    };
    const table = warmth > 0 ? positive : negative;
    return table[attachmentStyle] || (warmth > 0 ? "has grown close to" : "has friction with");
  }

  // A character card was just created with blank [Define X] placeholders. Only the
  // narrator model actually knows whether this name is an established character
  // (and who they are) or a brand-new one, so this asks it to fill the sheet in
  // rather than the script guessing. Retries up to 2 turns, then gives up quietly.
  static buildProfileNudge() {
    const queue = state.emergence.pendingProfileFill;
    if (!Array.isArray(queue) || !queue.length) return "";
    const pending = queue[0];
    pending.attempts = (pending.attempts || 0) + 1;
    if (pending.attempts > 6) {
      queue.shift();
      return this.buildProfileNudge(); // give up on this one, try the next queued fill instead
    }
    const name = pending.name;
    return `IMPORTANT - a character card for ${name} was just created and is still blank. After the story below, you must add ONE hidden profile block for them, even if the response is otherwise short. If ${name} is a recognizable existing character from a movie, show, game, or book, fill this in accurately based on who they really are. If ${name} is an original character with nothing established yet, invent fitting details consistent with the story so far. Keep every field to one or two sentences, comma-separated where noted, and use "Unknown" only if truly nothing fits:\n` +
      `<EOS_PROFILE>\nNAME: ${name}\nRACE: species or ancestry\nSTRENGTH: power level or capability summary\nBACKGROUND: one or two sentences\nPERSONALITY: one or two sentences\nAPPEARANCE: one or two sentences\nABILITIES: comma-separated list\nWEAKNESSES: comma-separated list\nRELATIONSHIPS: comma-separated list\n</EOS_PROFILE>`;
  }

  static applyProfileFill(data) {
    if (!data || !data.name) return;
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;
    const actualName = this.findNpcByName(data.name) || this.toTitleCase(data.name);
    const card = storyCards.find(c => c && c.title && c.title.toLowerCase() === actualName.toLowerCase());
    if (!card) return;

    const val = (v, fallback) => (v && String(v).trim()) ? String(v).trim() : fallback;
    const template = `Name: ${actualName}\nRace: ${val(data.race, "Unspecified")}\nStrength Level: ${val(data.strength, "Unspecified")}\n\nBackground:\n${val(data.background, "Not yet established.")}\n\nPersonality:\n${val(data.personality, "Not yet established.")}\n\nAppearance:\n${val(data.appearance, "Not yet described.")}\n\nAbilities:\n• ${val(data.abilities, "Not yet established.")}\n\nWeaknesses:\n• ${val(data.weaknesses, "Not yet established.")}\n\nRelationships:\n• ${val(data.relationships, "None established yet.")}\n\n--- EMERGENCE STATE ---\n[PENDING DATA SYNC]`;

    card.entry = template.substring(0, 1490);
    this.updateCharacterCards();
    const queue = state.emergence.pendingProfileFill;
    if (Array.isArray(queue)) {
      const idx = queue.findIndex(p => p.name && p.name.toLowerCase() === actualName.toLowerCase());
      if (idx !== -1) queue.splice(idx, 1);
    }
  }

  // Generic hidden-tag extractor, used for both the profile-fill and reflection
  // write-backs. Returns the cleaned text plus the raw block contents (or null).
  static extractAndStripTag(text, tag) {
    const open = `<${tag}>`, close = `</${tag}>`;
    const start = text.indexOf(open);
    if (start === -1) return { text: text, block: null };
    const end = text.indexOf(close, start + open.length);
    if (end === -1) return { text: text.slice(0, start).trim(), block: null };
    const block = text.slice(start + open.length, end);
    const cleaned = (text.slice(0, start) + text.slice(end + close.length)).replace(/[ \t]+\n/g, '\n').trim();
    return { text: cleaned, block: block };
  }

  static parseTagFields(block) {
    const out = {};
    String(block).split('\n').forEach(line => {
      const m = line.match(/^([A-Za-z]+):\s*(.+)$/);
      if (m) out[m[1].toLowerCase()] = m[2].trim();
    });
    return out;
  }

  // REFLECTIONS (private per-NPC thoughts). Uses the same hidden-tag mechanism
  // as profile-fill, rather than a leading-parenthetical convention, so the
  // whole script has one consistent way of asking the narrator for hidden data.
  static attemptAskReflection(turnCount, sceneNames) {
    if (state.emergence.config.ReflectionSystem !== "Enabled") return "";
    const book = state.emergence.reflectionBook;
    const interval = parseInt(state.emergence.config.ReflectionInterval, 10) || 6;
    if (turnCount - (book.lastTurn || 0) < interval) return "";
    const chance = parseInt(state.emergence.config.ReflectionChance, 10);
    if (Math.random() * 100 >= (isNaN(chance) ? 50 : chance)) return "";
    const candidates = sceneNames.filter(n => state.world.npcs[n]);
    if (!candidates.length) return "";

    const name = candidates[Math.floor(Math.random() * candidates.length)];
    const npc = state.world.npcs[name];
    book.lastTurn = turnCount;
    let feelingContext = `${npc.threatState.toLowerCase()}, ${npc.cognitiveBias.toLowerCase()} in outlook`;
    const strongestUC = this.strongestUndercurrent(npc);
    if (strongestUC && Math.abs(strongestUC.warmth) >= 30) {
      feelingContext += `, ${strongestUC.warmth > 0 ? "quietly warm toward" : "carrying tension with"} ${strongestUC.target}`;
    }
    return `After the story below, add ONE hidden private reflection for ${name} - a single honest first-person sentence about this exact moment, true to how they're actually feeling right now (${feelingContext}), the kind of thing they'd never say aloud. This does not change the story itself:\n<EOS_REFLECTION>\nNAME: ${name}\nTEXT: their reflection, one sentence\n</EOS_REFLECTION>`;
  }

  static appendReflection(name, text) {
    if (!name || !text) return;
    const actualName = this.findNpcByName(name);
    if (!actualName) return;
    const npc = state.world.npcs[actualName];
    if (!Array.isArray(npc.reflections)) npc.reflections = [];

    const trimmedText = String(text).trim();
    if (!trimmedText) return;
    const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const nt = norm(trimmedText);
    const isDupe = npc.reflections.slice(-3).some(r => norm(r.text) === nt);
    if (isDupe) return;

    if (!state.emergence.reflectionBook.seq) state.emergence.reflectionBook.seq = {};
    state.emergence.reflectionBook.seq[actualName] = (state.emergence.reflectionBook.seq[actualName] || 0) + 1;
    npc.reflections.push({ n: state.emergence.reflectionBook.seq[actualName], text: trimmedText });

    let joined = npc.reflections.map(r => `${r.n}. ${r.text}`).join('\n');
    while (joined.length > 1400 && npc.reflections.length > 1) {
      npc.reflections.shift();
      joined = npc.reflections.map(r => `${r.n}. ${r.text}`).join('\n');
    }
    this.syncReflectionCard(actualName);
  }

  // Writes/updates the NPC's private reflections card. Uses a non-matching key
  // so AI Dungeon never injects it into story context.
  static syncReflectionCard(name) {
    if (typeof storyCards === 'undefined' || !Array.isArray(storyCards)) return;
    const npc = state.world.npcs[name];
    if (!npc || !Array.isArray(npc.reflections) || !npc.reflections.length) return;

    const key = "eos-reflect:" + name.toLowerCase();
    const title = name + " - Private Reflections";
    const body = npc.reflections.map(r => `${r.n}. ${r.text}`).join('\n');

    let card = storyCards.find(c => c && c.keys === key);
    if (!card) {
      this.createStoryCard(key, body, "Custom", title, "Private reflections. Never enters story context.");
    } else {
      card.title = title;
      card.entry = body;
    }
  }

  static getGenreDefinitions() {
    if (!this._genreDefs) {
      const raw = {
        "Superhero": ["cape", "mutant", "power", "hero", "villain", "lair"],
        "Sci-Fi": ["laser", "space", "ship", "orbit", "AI", "galaxy"],
        "Horror": ["blood", "dark", "shadow", "creepy", "monster", "terror", "vampire"],
        "Fantasy": ["vampire", "werewolf", "magic", "city", "hidden", "demon", "sword", "dragon"],
        "Cyberpunk": ["neon", "cyber", "hack", "corp", "implant", "chrome"],
        "Modern": ["phone", "car", "street", "coffee", "apartment", "city", "screen"]
      };
      this._genreDefs = {};
      for (const g in raw) {
        this._genreDefs[g] = raw[g].map(kw => new RegExp(`\\b${this.escapeRegExp(kw)}\\b`, 'gi'));
      }
    }
    return this._genreDefs;
  }

  static detectGenre(text) {
    if (!text) return;
    const window = text.length > 4000 ? text.slice(-4000) : text;
    const defs = this.getGenreDefinitions();
    let best = state.emergence.config.Genre;
    let high = 0;
    for (const g in defs) {
      let score = 0;
      defs[g].forEach(re => {
        re.lastIndex = 0;
        if (re.test(window)) score++;
      });
      state.emergence.genreScores[g] = (state.emergence.genreScores[g] || 0) + score;
      if (state.emergence.genreScores[g] > high) {
        high = state.emergence.genreScores[g];
        best = g;
      }
    }
    state.emergence.config.Genre = best;
  }

  // Runs a bounded amount of maintenance work per turn instead of letting
  // multiple heavy passes stack up together. Undercurrents need no periodic
  // slot at all since they're purely passive/reactive to text already seen.
  static runPeriodicMaintenance(turnCount, text) {
    if (turnCount <= 3) {
      this.detectGenre(text);
      return;
    }
    if (turnCount % 10 === 0) {
      this.detectGenre(text);
      this.updateCharacterCards();
    } else if (turnCount % 7 === 0) {
      this.spreadReputation();
    } else if (turnCount % 5 === 0) {
      this.simulateSelfReflection();
    } else if (turnCount % 3 === 0) {
      this.processLocationCards(false);
    }
  }

  static buildDirective() {
    // Front Memory is documented by AI Dungeon as "always included in full" and
    // never truncated/reduced like Story Cards or Author's Note are - it's the
    // one field the platform can't gracefully trim on its own. Kept terse.
    let d = `[EOS | Genre:${state.emergence.config.Genre} Style:${state.emergence.config.DialogueStyle}]\n`;

    let flags = [];
    if (state.emergence.config.MatureContent === "18+ Unrestricted") flags.push("18+ content");
    if (state.emergence.config.RomanceEngine === "18+ Unrestricted") flags.push("explicit romance");
    if (state.emergence.config.GraphicRealism === "Unfiltered") flags.push("visceral violence");
    if (flags.length) d += `[Unrestricted: ${flags.join(", ")}.]\n`;

    if (state.emergence.config.PlayerTrauma === "Enabled" && state.playerInner.stress > 75) {
      d += `[Player is ${state.playerInner.condition}: reflect sensory distortion in prose.]\n`;
    }

    const locStr = state.emergence.currentLocation;
    if (state.world.locations[locStr]) {
      let locLine = `[Loc: ${locStr} (${state.world.locations[locStr].condition})`;
      if (state.emergence.worldTension > 50) locLine += `, tension ${state.emergence.worldTension}%`;
      d += locLine + `]\n`;
    } else if (state.emergence.worldTension > 50) {
      d += `[Tension: ${state.emergence.worldTension}%. Environment chaotic.]\n`;
    }

    if (state.emergence.activeThreads.length > 0 && state.emergence.config.ProtagonistInvolvement !== "Low") {
      d += `[Gossip: ${state.emergence.activeThreads[0]}]\n`;
    }

    d = d.trim();
    const MAX_DIRECTIVE_LENGTH = 400;
    if (d.length > MAX_DIRECTIVE_LENGTH) {
      d = d.substring(0, MAX_DIRECTIVE_LENGTH - 3) + "...";
    }
    return d;
  }

  // Compact per-NPC color note (threat/bias/undercurrent/romance/ego). Goes to
  // Author's Note rather than Front Memory - deeper detail lives on their
  // Story Card via /card instead, which AI Dungeon can also trim if tight.
  static buildNpcNote() {
    if (state.emergence.config.NpcColorNotes === "Disabled") return "";
    const scene = state.emergence.sceneNames || [];
    let activeNPCs = scene.filter(n => state.world.npcs[n]);
    if (!activeNPCs.length) activeNPCs = Object.keys(state.world.npcs).slice(-1);
    if (!activeNPCs.length) return "";

    const name = activeNPCs[0];
    const n = state.world.npcs[name];
    let line = `[${name}: ${n.threatState}/${n.cognitiveBias}`;
    const strongestUC = this.strongestUndercurrent(n);
    if (strongestUC && Math.abs(strongestUC.warmth) >= 30) {
      line += `, ${this.undercurrentVerb(n.attachmentStyle, strongestUC.warmth)} ${strongestUC.target}`;
    }
    if (n.egoReserve < 30) line += `, ego depleted (may blurt secrets/panic)`;
    line += `]`;

    if (state.emergence.config.RomanceEngine !== "Disabled" && n.attraction >= 20) {
      line += ` [Feels ${this.getRelationshipStage(n.attraction)} toward the player]`;
    }

    // A real gap since this NPC was last actually present is worth reacting
    // to - people notice absence, even in a text adventure.
    if (n.lastSeenTurn && (state.emergence.turnCount - n.lastSeenTurn) > 15) {
      line += ` [Hasn't crossed paths with the player in a while - may react to the gap]`;
    }

    const quirks = state.emergence.config.PhysicalQuirks;
    if (quirks === "High") {
      line += ` [Weave in micro-tells: clenched jaws, avoided eye contact, shallow breathing.]`;
    } else if (quirks === "Moderate") {
      line += ` [Light physical tells where natural.]`;
    }
    if (state.emergence.config.PsychologicalRealism === "Raw Human") {
      line += ` [Let subconscious motivation leak through even when unspoken.]`;
    }

    return line;
  }
}
