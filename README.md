# EMERGENCE-OS
EMERGENCE OS 1 — Independent NPCs, Trust &amp; Grudges, and Auto-Updating Location Cards
Hey everyone, dropping [REBUILT] EMERGENCE OS 1 — Independent NPCs, Trust & Grudges, and Auto-Updating Location Cards for AI Dungeon.

If you're tired of NPCs acting like mind-controlled puppets who obey every command, forget everything the moment the scene changes, and wait around for you to lead every beat, this script turns them into actual people — with motives, memories of specific things that actually happened, a real place they were last seen, and drama with each other that has nothing to do with you.

Zero technical setup required — on your very first action, it auto-creates a Master World Config story card in your deck, with every single setting explained and grouped by what it actually affects (Story Tone, NPC Psychology, Trust & Grudge, Relationships, World & Locations, Reflections, Pacing, Content) right there in its notes — not just a list of allowed values, but what you'd actually notice change in play if you touched it — so you can tweak anything mid-game without guessing.

New to AI Dungeon scripts? Two quick things before the feature list:

•	⁠A script is just a small program attached to your scenario that quietly reacts to the story as you play — you never see code, you never write any, you just paste it in once and it runs itself from then on.
•	⁠A Story Card is AI Dungeon's own built-in way of giving the AI a "note" about a character, place, or thing, which it automatically reads whenever that name comes up in the story. This script creates and updates those cards for you automatically.

You genuinely don't need to know how any of that works to use this — copy, paste, play. Full click-by-click steps are at the bottom of this post.

Here's the full run-through:

🧠 1. Human Agency & Anti-Railroading

•	⁠NPC Pushback: Characters will actively resist unearned demands, doubt your motives, call you out, or walk away if you try to command or manipulate them without leverage.
•	⁠Tunable intensity: AutonomyLevel (Low/Medium/High/Unchained) scales exactly how hard that pushback lands — and it's contextual, not flat: an NPC who already resents you escalates faster, while deep earned trust buys a little more benefit of the doubt for the same forceful moment.
•	⁠Cognitive Biases: NPCs process your actions through irrational personal lenses (Paranoid, Deflective, Prideful, Impulsive, Skeptical) rather than acting like logical robots — and they don't all warm up to you at the same speed: a Skeptical or Paranoid NPC makes you earn trust; an Impulsive one gives it fast.

🩸 2. Persistent Trust & Grudge Tracking

•	⁠Tracks separate Trust and Grudge levels. If you insult or betray an NPC, they won't just forget it a few turns later — their resentment lingers as coldness, passive-aggression, or outright hostility.
•	⁠ConsequenceSeverity (Mild/Moderate/Hardcore) controls exactly how hard betrayal and lying land.
•	⁠Grudge isn't a one-way ratchet, either — it softens slowly over time if nothing reinforces it, the way real anger fades even when trust still has to be earned back on purpose.
•	⁠Formative Memories: most memories cycle out after a few turns, but a genuinely pivotal moment — a betrayal severe enough to break real trust, a full emotional breakdown, falling completely in love — gets remembered permanently and separately, visible on /npc and their character card. Not everything is equally forgettable.
•	⁠Memories are concrete, not categories. An NPC doesn't just remember that you "forced them" — they remember it happening: a short excerpt of the actual moment gets saved alongside it, so their memory reads like something that really occurred instead of a generic status flag.
•	⁠Earned Security. This one's grounded in actual attachment research (Mikulincer & Shaver's work on "earned security"): a sustained pattern of real trust and low grudge — not one good scene, a genuine streak of it — can shift an NPC's attachment style toward Secure over time. It's one-directional and permanent, the same way the research frames it: earned through the relationship, not handed out, and not undone by a single bad turn. Progress shows up on /npc once it's underway, so it's not an invisible countdown — and the moment it actually happens, the narrator gets a nudge to let it show through the story itself, not just sit in the background data.
•	⁠NPCs remember specific incidents with each other, too, not just with you — a clash, a kindness, surviving danger together with another NPC gets logged the same way a moment with you does.
•	⁠Grounded in a real place and time: every NPC tracks where and when they were last actually present. /npc shows it, and if a real gap has passed since they last crossed paths with you, the narrator gets nudged to let that gap actually register instead of picking up as if no time passed.

🎭 3. Realistic Threat Psychology & Body Language

•	⁠Polyvagal Threat States: NPCs dynamically shift between Composed, Fight, Flight, Freeze, or Fawn based on their stress and fear — shaped by attachment style as much as cognitive bias, so an Avoidant NPC shuts down (Freeze) under the same pressure that sends an Anxious one people-pleasing (Fawn) instead of fighting or fleeing. The severity ordering follows the actual research too, not just the four labels: Freeze reflects the nervous system's most extreme shutdown state, so it's reserved for the highest-stress tier rather than being an equal alternative to fight or flight at any stress level.
•	⁠NPCs react to real danger around them, too, not just to you personally — an explosion in the room raises their own stress and can push them into crisis, the same as a direct confrontation would.
•	⁠Emotional Contagion: when an NPC's composure genuinely breaks in front of others, whoever's actually there to witness it gets visibly rattled too — a real, documented phenomenon (Hatfield, Cacioppo & Rapson's work on emotional contagion), not just a story beat. Small and bounded so it can't spiral into a runaway panic cascade.
•	⁠Ego Depletion: When an NPC gets worn down (Ego < 30%), their social filter collapses, forcing them to blurt out secrets, panic, or prioritize immediate self-preservation — and it recovers naturally over time once they're no longer under active pressure, instead of staying broken until you say the exact right thing.
•	⁠All of this gets summarized for the narrator each turn as a short status note (threat state, bias, current feelings) — invisible in the story itself, but visible if you check your context breakdown, which some people would rather not see. Set NpcColorNotes: Disabled on the config card to turn that note off entirely; every mechanic underneath keeps working exactly the same, it's purely about what shows up in that panel.
•	⁠Physical Micro-Tells: Prompts the model to weave subconscious physical habits (clenched jaws, avoiding eye contact, shallow breathing) into dialogue and descriptions — tunable via PhysicalQuirks, with PsychologicalRealism: Raw Human pushing subconscious motivation to leak through even further.

💞 4. Romance Engine

•	⁠Attraction builds into real, discrete relationship stages — Platonic → Interested → Flirtatious → Romantic → In Love — instead of a hidden number nobody ever sees.
•	⁠RomancePacing (Fast / Normal / Slow Burn) controls exactly how quickly feelings develop, and it doesn't ignore the rest of the relationship: attraction grows much slower on an NPC who's currently furious at you, instead of romance and grudge existing in separate universes.
•	⁠Every time a stage actually shifts, the AI gets a one-time nudge to let it show through behavior and tone in the moment — not a stated label, an earned beat.
•	⁠Jealousy is no longer just an invisible stat bump: catching feelings for someone while another NPC is watching visibly cools that NPC's Undercurrent toward your new interest, so it has genuine narrative follow-through instead of vanishing the instant the scene changes.
•	⁠Check standing anytime with /romance (everyone) or /romance [name] (one character), or see it folded right into /npc.

🌊 5. Undercurrents — Passively-Read NPC Relationships

This is the part I care most about getting right, so let me explain the mechanism, not just the pitch:

Most "autonomous NPC drama" scripts work the same way underneath: on a schedule, the script picks an NPC and a target, assigns a social pressure from a list, and asks the AI to develop it — then parses a hidden report back to see what happened. It's a request-and-response loop the script initiates.

Undercurrents don't work like that at all. There's no schedule, no cooldown, no "decide to start something," and nothing asks the AI to report back. The script just reads what's already in the story. If two known NPCs are mentioned together in the same passage and something happens between them — a shove, a kindness, a betrayal, a kiss — that's picked up by the same conjugation-aware detection already driving your own Trust & Grudge with each NPC, just applied NPC-to-NPC instead of player-to-NPC. Nothing is invented; nothing is pre-scheduled. If it isn't in the text, it doesn't happen. It's careful about attribution, too — an NPC witnessing something romantic happen between you and someone else doesn't get miscounted as warmth between the two NPCs; that specific case is what Jealousy is for.

Every NPC can carry Undercurrents toward several other characters at once, not just whichever one they were most recently mentioned alongside — tension with one person doesn't quietly vanish because of an unrelated warm moment with someone else later.

The psychological layer still applies, but as pure flavor rather than a tracked state machine: how an Undercurrent actually reads in the narrator's prose depends on each NPC's own attachment style — the same warmth score lands as quiet fondness on a Secure NPC, anxious over-attachment on an Anxious one, and something they'd never admit out loud on an Avoidant one.

•	⁠Check any NPC's standing with everyone anytime with /undercurrents or see their strongest one folded into /npc. /reputation rolls it all the way up into a single "how am I doing overall" read across everyone you've met.
•	⁠Jealousy plugs straight into this: catching feelings for someone in front of another interested NPC doesn't just bump a hidden stat — it visibly cools that NPC's Undercurrent toward your new interest, and how they process the jealousy itself is attachment-style-flavored too (an Anxious NPC spirals; an Avoidant one just quietly shuts down).
•	⁠Shared danger bonds people, too — surviving chaos together nudges two co-mentioned NPCs' Undercurrent warmer, distinct from a direct conflict or kindness between them.
•	⁠Like grudge, an Undercurrent softens slowly on its own if nothing reinforces it — tension or warmth between two NPCs isn't permanent unless the story keeps making it true.

🗣️ 6. Word Gets Around

Reputation quietly spreads through the social web the other systems already built — this isn't a new engine bolted on, it's Trust/Grudge and Undercurrents talking to each other. If an NPC is a genuine confidant of someone with a much harsher opinion of you, some of that opinion rubs off on them too, slowly and boundedly — and it runs both ways, a confidant vouching for you spreads the same way a warning does. Cross someone badly enough and it can precede you with the people close to them, without anyone scripting a rumor mill.

🤝 7. Coalitions & Rivalry Blocs

Nothing new is tracked for this one — it's live graph analysis over the Undercurrents that already exist. If three or more NPCs all hold strong warmth with each other (not just each one liking a fourth person, an actual closed triangle), that's a Coalition. Three or more all holding strong mutual hostility is a Rivalry Bloc. /factions shows what's formed, along with your own average standing with that group — nothing is scripted into existence, and nothing shows up that didn't actually emerge from the story.

🕯️ 8. Location Echoes

The same threshold that creates a permanent Formative Memory for an NPC also tags where it happened. A place where someone's trust in you shattered, where someone fell for you completely, where someone's composure finally broke — that gets remembered on the location's own Story Card, not just the character's. Places start to carry weight the way people do.

💭 9. Reflections — Private Inner Monologues

•	⁠Optional, off by default. Turn it on and NPCs will occasionally form one private, first-person reflection about the current moment — grounded in how they're actually feeling right then (their real threat state and cognitive bias), not a generic prompt.
•	⁠Saved to their own "Private Reflections" card, never shown in the story, never fed back into the AI — just something for you to read back on later to see how a character's headspace actually evolved.
•	⁠Captured through the same hidden-tag mechanism the script uses for AI-written character profiles, rather than a special leading-line convention — one consistent way of asking the narrator for hidden data, used everywhere it's needed.

💥 10. Dynamic World Tension & Player Trauma

•	⁠Global Alert Scale: Gunfire, explosions, and chaos scale World Tension (0–100%), forcing nearby NPCs into cover, panic, or lockdown postures.
•	⁠Player Sensory Distortions: High player stress (>75%) injects realistic trauma effects into the narrative prose — tunnel vision, muffled audio, racing pulses.

🗺️ 11. Smart Multi-Location Tracking

•	⁠Tracks every location's condition independently instead of just "wherever you currently are" — burn down the warehouse and the tavern down the street stays untouched.
•	⁠Clause-aware damage detection: "the warehouse is destroyed, but the tavern's fine" correctly attributes each condition instead of blending them together.
•	⁠Each location also carries a felt Atmosphere (Calm, Uneasy, On Edge, Tense, Chaotic) derived from its condition and the current tension level — visible on /world and its Story Card.
•	⁠Auto-updating Story Cards for anywhere you've named, with a clean anti-confusion filter so places never get mistaken for people (or vice versa).
•	⁠/locations lists everywhere tracked so far with its condition and atmosphere at a glance, marking wherever you currently are.

🎬 12. AI-Written Character Sheets

•	⁠/card a character and the sheet doesn't sit there with [Define Race] forever — the AI fills it in for you on the next turn. It's a direct request that gets top priority in what the AI sees, and keeps asking across several turns if the first attempt doesn't land. Card several characters back to back and each one gets queued properly instead of the newest one silently bumping the others out.
•	⁠Recognizes established characters (movies, games, books, whatever) and writes their real profile; invents something fitting and consistent for original characters instead.
•	⁠Already made your own character cards before installing this? The moment that character actually shows up in the story, their existing card gets adopted into the tracking system — trust, grudge, memories, all of it starts working for them too. Your own lore is never touched or rewritten, not one word of it; the psychological state just gets added in a clearly separate section underneath. AI-authored profile-filling is a completely different path that only ever runs on blank sheets this script created itself via /card — an adopted card never goes through it, so nothing gets invented on top of what you already wrote.
•	⁠The full picture on any NPC refreshes automatically as things change, not just once — no need to keep re-checking a card to see if it's stale.

⚔️ 13. Auto-Genre Adaptation & Unrestricted Realism

•	⁠Automatically scans your story to detect setting/genre and adjusts vocabulary and danger level accordingly.
•	⁠Toggles for uncensored 18+ narrative prose, gritty combat damage, and unfiltered dialogue tone.

🧹 14. Cleaner Detection, Fewer Ghosts

•	⁠Rebuilt name detection so ordinary sentence-starting words ("His," "Your," "Then") stop getting mistaken for characters, and your setting's own city/kingdom name stops getting mistaken for an NPC.
•	⁠New /forget command to manually clear anything that still slips through, and /cleanup now catches names that turn out to double as a location too.
•	⁠You can also manually add character first names directly in the Master World Config card's notes ([CHARACTERS] section) to integrate them with the script immediately, instead of waiting for auto-detection.

💬 In-Game Commands

•	⁠/npc [name] — Full dossier: stats, threat state, bias, romance status, active Undercurrent, memories
•	⁠/npcs — List every known NPC
•	⁠/locations — List everywhere tracked, with condition and atmosphere
•	⁠/reputation — Your overall standing rolled up across every known NPC
•	⁠/undercurrents — View NPC-to-NPC relationship dynamics and recent gossip
•	⁠/factions — View emergent Coalitions and Rivalry Blocs
•	⁠/romance [name] — Romantic standing for one character, or everyone
•	⁠/reflections [name] — Read a character's private reflections
•	⁠/card [name] — Generate a character sheet (AI fills it in automatically)
•	⁠/loc [name] — Set your current location & generate its card
•	⁠/settings — Full settings guide
•	⁠/cleanup — Purge false-positive NPCs
•	⁠/forget [name] — Manually remove one specific NPC and its cards
•	⁠/world — Current location, tension %, player stress
•	⁠/help — Command list

Commands intercept immediately, so the AI never wastes a turn writing story prose when you're just checking stats. Typo one, or guess at a command that doesn't exist, and you get a direct "not recognized, try /help" instead of the AI trying to improvise a response to it.

🎛️ Config Toggles (Edit Anytime Mid-Game)

Inside your auto-generated Master World Config story card:

•	⁠AutonomyLevel: Low | Medium | High | Unchained
•	⁠ConsequenceSeverity: Mild | Moderate | Hardcore
•	⁠PsychologicalRealism: Standard | Advanced | Raw Human
•	⁠PhysicalQuirks: High | Moderate | Off
•	⁠HumanAgency: Enabled | Disabled
•	⁠GrudgeTracking: Enabled | Disabled
•	⁠WorldTensionEngine: Dynamic | Static | Disabled
•	⁠PlayerTrauma: Enabled | Disabled
•	⁠NpcColorNotes: Enabled | Disabled — the per-turn NPC status note sent to the narrator. Hidden from the story either way; this only controls whether it's generated at all, for anyone who checks their context breakdown and would rather not see it there.
•	⁠LivingWorldEngine: Enabled | Disabled — powers Undercurrents (passive, inferred from the story)
•	⁠ReflectionSystem: Enabled | Disabled (off by default)
•	⁠ReflectionInterval / ReflectionChance: reflection pacing
•	⁠RomanceEngine: 18+ Unrestricted | PG-13 | Disabled
•	⁠RomancePacing: Fast | Normal | Slow Burn
•	⁠JealousyMechanic: Enabled | Disabled
•	⁠MatureContent: 18+ Unrestricted | PG-13 | Disabled
•	⁠GraphicRealism: Unfiltered | Standard | Mild
•	⁠LocationCards / LocationAutoUpdate: Enabled | Disabled

📥 Links & Quick Setup

No coding knowledge needed — this is entirely copy and paste. Step by step:

1.	⁠Create a new Scenario (or open one you already made) — it needs to be a Simple Start or Character Creator scenario; Multiple Choice scenarios can't have scripts.
2.	⁠On the scenario's edit page, find the Scripting section (it sits alongside Prompt, Plot Essentials, Author's Note, and Story Cards).
3.	⁠You'll see four slots: Library, Input, Context, Output. Open each pastebin link below, copy everything in it, and paste it into the matching slot, replacing whatever's already there:

1.	⁠Save, then start (or continue) the adventure and take one action.
2.	⁠You'll see ⚙️ [EMERGENCE OS 1: Active] appear at the end of the story text — that's confirmation it's running. A Master World Config story card also appears in your deck automatically.
3.	⁠From here, just play normally. Whenever you're curious what it's tracking, type /help as an action to see everything you can check on.

Enjoy!

Scenario - https://play.aidungeon.com/scenario/nOikTvPTOb50/rebuilt-emergence-os-1-independent-npcs-trust-and-grudges-and-auto?share=true&published=true
