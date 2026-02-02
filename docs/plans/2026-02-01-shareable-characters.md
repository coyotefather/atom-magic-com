# Shareable Characters Design

## Overview

A client-side character sharing system using compressed URL encoding and optional QR code generation. No server-side storage required.

## Goals

- Share characters via URL (copy/paste)
- Generate QR codes for in-person sharing
- Import shared characters into roster
- Fully client-side, works offline

## Non-Goals

- Server-side short links
- Real-time collaborative editing
- Character versioning/history

## Technical Approach

### Compression

Use `lz-string` library for URL-safe compression.

**Data to compress (include):**
- name, age, pronouns, description
- culture, path, patronage (Sanity IDs)
- scores (with subscore values)
- disciplines, techniques (Sanity IDs)
- gear (full gear data)
- wealth, animalCompanion

**Data to strip (exclude):**
- loaded (runtime flag)
- additionalScores (calculated from scores)
- scorePoints (can be recalculated)

**Compression flow:**
```typescript
// Compress
const stripped = stripDerivedFields(character);
const json = JSON.stringify(stripped);
const compressed = lzstring.compressToEncodedURIComponent(json);

// Decompress
const json = lzstring.decompressFromEncodedURIComponent(compressed);
const character = JSON.parse(json);
```

### URL Format

```
https://atommagic.com/character/shared?c=<compressed-data>
```

**Estimated URL lengths:**
- Minimal character: ~500-800 chars
- Full character: ~1000-1500 chars

### QR Codes

- Library: `qrcode.react`
- Error correction: Medium (M)
- Display size: 200x200px
- Download size: 400x400px PNG

## User Interface

### Share Modal

Triggered from roster card or character sheet.

```
┌─────────────────────────────────────────┐
│  Share Character                     ✕  │
├─────────────────────────────────────────┤
│                                         │
│         ┌───────────────┐               │
│         │   QR CODE     │               │
│         └───────────────┘               │
│                                         │
│  [Copy Link]      [Download QR]         │
│                                         │
│  Link preview (truncated):              │
│  atommagic.com/character/shared?c=eJy...│
│                                         │
└─────────────────────────────────────────┘
```

**Button placements:**
- Roster card: Share icon next to edit/delete
- Character sheet: "Share" button in header

### Import Flow (Read-Only View)

When visiting `/character/shared?c=...`:

1. Extract and decompress `c` parameter
2. Validate data structure
3. Display character in read-only view
4. "Add to My Roster" button to save

```
┌─────────────────────────────────────────┐
│  ← Back to Character Manager            │
├─────────────────────────────────────────┤
│  Shared Character                       │
│  "Marcus Aurelius"                      │
│                                         │
│  [Add to My Roster]                     │
├─────────────────────────────────────────┤
│  (Character sheet content - read only)  │
└─────────────────────────────────────────┘
```

**Add to roster flow:**
1. Generate new character ID
2. Reinitialize derived fields
3. Save via `saveCharacterById`
4. Redirect to `/character` with new character active

## Security

### Validation on Import

```typescript
function validateSharedCharacter(data: unknown): CharacterState | null {
  // 1. Check it's an object
  // 2. Validate required fields exist and have correct types
  // 3. Sanitize all string fields (name, description, pronouns)
  // 4. Validate IDs match UUID pattern
  // 5. Validate scores/gear arrays have expected structure
  // 6. Reject if any check fails
}
```

### Mitigations

| Risk | Mitigation |
|------|------------|
| XSS via strings | Escape HTML entities before rendering |
| Prototype pollution | Validate object shape explicitly |
| Oversized payloads | Reject compressed data > 8KB |
| Invalid Sanity IDs | Validate UUID format |
| Malformed data | Try/catch, validate before use |

### String Sanitization

- Escape `<`, `>`, `&`, `"`, `'` in all text fields
- Truncate: name (100 chars), description (2000 chars)

## Dependencies

```bash
npm install lz-string qrcode.react
npm install -D @types/lz-string
```

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/lib/characterSharing.ts` | Compress/decompress, URL encoding, validation |
| `src/app/components/character/ShareCharacterModal.tsx` | Share UI with QR code |
| `src/app/(website)/character/shared/page.tsx` | Read-only import view |
| `src/app/components/character/CharacterRoster.tsx` | Add share button |
| `src/app/components/character/CharacterSheet.tsx` | Add share button |

## Error Handling

- Invalid/corrupted data: Friendly error message with link to Character Manager
- Missing `c` param: Redirect to Character Manager
- Decompression failure: Show "Invalid share link" message
