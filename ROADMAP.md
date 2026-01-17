# Atom Magic Roadmap

Feature ideas and improvements for the Atom Magic website.

## Character Manager Enhancements

### Quick wins
- [x] **Print stylesheet** - A dedicated print layout that formats the character as a proper character sheet
- [x] **Multiple characters** - Let users save/manage multiple characters in browser storage, not just one
- [ ] **Character summary card** - A compact view showing key stats at a glance

### Bigger features
- [ ] **Character generator** - Randomly generate a complete character with directed options:
  - Lock specific choices (e.g., "I want a Theurgist" or "I want Spiranos culture") and randomize the rest
  - Presets for common archetypes (battle mage, healer, rogue, etc.)
  - Option to generate backstory hooks based on culture/path/patronage
  - "Surprise me" mode for fully random generation
  - Review and tweak results before saving
- [ ] **Shareable characters** - Generate a URL or QR code to share a character (could encode in URL params or use a simple backend)

## New Utility Tools

### For players
- [x] **Dice roller** - Quick dice roller with presets for common rolls (d20, 2d6, etc.) - useful during play
- [x] **Quick reference panel** - Collapsible sidebar with commonly-needed rules (combat flow, damage types, etc.)

### For GMs (Dominus Ludi)
- [ ] **Encounter builder** - Select creatures from the creature roller, set quantities, calculate total threat
- [ ] **NPC quick generator** - Lightweight version of character manager for throwaway NPCs
- [x] **Loot/treasure roller** - Random item generation tables

### Session Tools
- [ ] **Adventure log** - Track rolls, character actions, and story events during play. Could include:
  - Roll history with context (what the roll was for, who rolled)
  - Character action entries ("Varro picked the lock", "Livia cast Thermal Surge")
  - GM notes for story beats, NPC encounters, discoveries
  - Timestamps for pacing analysis
  - Export to session summary / "Previously on..." recap

## Site-wide

- [ ] **Dark mode toggle** - The color palette would work well inverted (parchment to dark, etc.)
- [ ] **PWA support** - Offline access to Codex entries would be valuable for sessions without reliable internet
- [ ] **Bookmarks** - Let users save favorite Codex entries

## Vorago

- [ ] **Save/resume games** - Similar to character persistence
- [ ] **Game replay** - Step through a completed game move-by-move

---

## Completed

- [x] Character save/load to .solum files
- [x] Character resume from browser storage
- [x] Creature roller with filtering
- [x] Unified entry system (creatures, disciplines, techniques, paths in Codex)
- [x] Print stylesheet for character sheet
- [x] Dice roller with animation and history
- [x] Quick reference panel with accordion sections
- [x] Tools hub page and navigation updates
- [x] Loot/treasure roller with weapons, armor, items, and coins
- [x] Multiple characters support with roster management
