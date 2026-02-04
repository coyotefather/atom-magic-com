# Shareable Characters Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to share characters via URL and QR codes, fully client-side.

**Architecture:** Compress character data with lz-string, encode in URL parameter, display with qrcode.react. Import flow validates and sanitizes data before saving to roster. Share buttons added to roster and character sheet.

**Tech Stack:** lz-string (compression), qrcode.react (QR generation), Next.js App Router

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install lz-string and qrcode.react**

Run:
```bash
npm install lz-string qrcode.react
npm install -D @types/lz-string
```

**Step 2: Verify installation**

Run: `npm ls lz-string qrcode.react`
Expected: Both packages listed without errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
feat: add lz-string and qrcode.react for character sharing

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Create Character Sharing Utility

**Files:**
- Create: `src/lib/characterSharing.ts`

**Context:** This utility handles compression, decompression, URL generation, and validation for shareable characters. The `CharacterState` interface is defined in `src/lib/slices/characterSlice.ts`.

**Step 1: Create the characterSharing.ts file**

```typescript
import lzstring from 'lz-string';
import { CharacterState } from './slices/characterSlice';

// Maximum compressed payload size (8KB)
const MAX_PAYLOAD_SIZE = 8192;

// UUID pattern for Sanity IDs
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Fields to exclude from sharing (derived or runtime-only)
const EXCLUDED_FIELDS = ['loaded', 'additionalScores', 'scorePoints'] as const;

/**
 * Strips derived/runtime fields from character data before compression
 */
type ShareableCharacter = Omit<CharacterState, typeof EXCLUDED_FIELDS[number]>;

function stripDerivedFields(character: CharacterState): ShareableCharacter {
  const { loaded, additionalScores, scorePoints, ...shareable } = character;
  return shareable;
}

/**
 * Escapes HTML entities in a string to prevent XSS
 */
function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitizes all string fields in the character data
 */
function sanitizeStrings(data: ShareableCharacter): ShareableCharacter {
  return {
    ...data,
    name: escapeHtml(data.name).slice(0, 100),
    pronouns: escapeHtml(data.pronouns).slice(0, 50),
    description: escapeHtml(data.description).slice(0, 2000),
    animalCompanion: {
      ...data.animalCompanion,
      name: escapeHtml(data.animalCompanion.name).slice(0, 100),
      details: escapeHtml(data.animalCompanion.details).slice(0, 500),
    },
  };
}

/**
 * Validates that a string matches UUID format (for Sanity IDs)
 */
function isValidUUID(str: string): boolean {
  return str === '' || UUID_PATTERN.test(str);
}

/**
 * Validates the structure and types of imported character data
 */
function validateCharacterStructure(data: unknown): data is ShareableCharacter {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const char = data as Record<string, unknown>;

  // Required string fields
  if (typeof char.name !== 'string') return false;
  if (typeof char.pronouns !== 'string') return false;
  if (typeof char.description !== 'string') return false;
  if (typeof char.culture !== 'string' || !isValidUUID(char.culture)) return false;
  if (typeof char.path !== 'string' || !isValidUUID(char.path)) return false;
  if (typeof char.patronage !== 'string' || !isValidUUID(char.patronage)) return false;

  // Age must be a number
  if (typeof char.age !== 'number' || char.age < 0) return false;

  // Arrays must be arrays with valid UUIDs
  if (!Array.isArray(char.disciplines)) return false;
  if (!char.disciplines.every((d) => typeof d === 'string' && isValidUUID(d))) return false;
  if (!Array.isArray(char.techniques)) return false;
  if (!char.techniques.every((t) => typeof t === 'string' && isValidUUID(t))) return false;

  // Scores array validation
  if (!Array.isArray(char.scores)) return false;
  for (const score of char.scores) {
    if (typeof score !== 'object' || score === null) return false;
    const s = score as Record<string, unknown>;
    if (typeof s._id !== 'string') return false;
    if (!Array.isArray(s.subscores)) return false;
  }

  // Gear array validation
  if (!Array.isArray(char.gear)) return false;

  // Wealth validation
  if (typeof char.wealth !== 'object' || char.wealth === null) return false;
  const wealth = char.wealth as Record<string, unknown>;
  if (typeof wealth.silver !== 'number') return false;
  if (typeof wealth.gold !== 'number') return false;
  if (typeof wealth.lead !== 'number') return false;
  if (typeof wealth.uranium !== 'number') return false;

  // Animal companion validation
  if (typeof char.animalCompanion !== 'object' || char.animalCompanion === null) return false;
  const companion = char.animalCompanion as Record<string, unknown>;
  if (typeof companion.id !== 'string') return false;
  if (typeof companion.name !== 'string') return false;
  if (typeof companion.details !== 'string') return false;

  return true;
}

/**
 * Compresses character data for URL sharing
 * Returns the compressed string or null if compression fails
 */
export function compressCharacter(character: CharacterState): string | null {
  try {
    const stripped = stripDerivedFields(character);
    const json = JSON.stringify(stripped);
    const compressed = lzstring.compressToEncodedURIComponent(json);

    if (compressed.length > MAX_PAYLOAD_SIZE) {
      console.error('Character data too large to share');
      return null;
    }

    return compressed;
  } catch (err) {
    console.error('Failed to compress character:', err);
    return null;
  }
}

/**
 * Decompresses and validates shared character data
 * Returns the character state or null if invalid
 */
export function decompressCharacter(compressed: string): ShareableCharacter | null {
  try {
    // Check payload size
    if (compressed.length > MAX_PAYLOAD_SIZE) {
      console.error('Payload too large');
      return null;
    }

    const json = lzstring.decompressFromEncodedURIComponent(compressed);
    if (!json) {
      console.error('Failed to decompress character data');
      return null;
    }

    const parsed = JSON.parse(json);

    if (!validateCharacterStructure(parsed)) {
      console.error('Invalid character data structure');
      return null;
    }

    // Sanitize strings after validation
    return sanitizeStrings(parsed);
  } catch (err) {
    console.error('Failed to decompress character:', err);
    return null;
  }
}

/**
 * Generates a shareable URL for a character
 */
export function generateShareUrl(character: CharacterState): string | null {
  const compressed = compressCharacter(character);
  if (!compressed) return null;

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://atommagic.com';

  return `${baseUrl}/character/shared?c=${compressed}`;
}

/**
 * Reinitializes derived fields for an imported character
 */
export function reinitializeDerivedFields(shareable: ShareableCharacter): CharacterState {
  return {
    ...shareable,
    loaded: true,
    additionalScores: [],
    scorePoints: 0,
  };
}
```

**Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/lib/characterSharing.ts`
Expected: No errors (or run full `npm run build` to check)

**Step 3: Commit**

```bash
git add src/lib/characterSharing.ts
git commit -m "$(cat <<'EOF'
feat: add character sharing utility with compression and validation

- Compress/decompress using lz-string
- Strip derived fields before sharing
- Validate structure and sanitize strings on import
- Generate shareable URLs

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Create Share Character Modal

**Files:**
- Create: `src/app/components/character/ShareCharacterModal.tsx`

**Context:** Uses HeroUI Modal component and qrcode.react. FunctionButton is at `src/app/components/common/FunctionButton.tsx`. The modal will show QR code and copy link functionality.

**Step 1: Create the ShareCharacterModal component**

```typescript
'use client';

import { useState, useRef } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { QRCodeSVG } from 'qrcode.react';
import Icon from '@mdi/react';
import { mdiContentCopy, mdiCheck, mdiDownload } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import { CharacterState } from '@/lib/slices/characterSlice';
import { generateShareUrl } from '@/lib/characterSharing';

interface ShareCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterState;
}

const ShareCharacterModal = ({ isOpen, onClose, character }: ShareCharacterModalProps) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const shareUrl = generateShareUrl(character);

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Create a canvas and draw the SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const link = document.createElement('a');
      const characterName = character.name || 'character';
      const fileName = characterName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${fileName}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (!shareUrl) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} radius="none">
        <ModalContent>
          <ModalHeader className="marcellus">Share Character</ModalHeader>
          <ModalBody>
            <p className="text-oxblood">
              Unable to generate share link. The character data may be too large.
            </p>
          </ModalBody>
          <ModalFooter>
            <FunctionButton variant="secondary" onClick={onClose}>
              Close
            </FunctionButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  const truncatedUrl = shareUrl.length > 60
    ? shareUrl.slice(0, 57) + '...'
    : shareUrl;

  return (
    <Modal isOpen={isOpen} onClose={onClose} radius="none" size="md">
      <ModalContent>
        <ModalHeader className="marcellus text-xl">
          Share Character
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="flex flex-col items-center gap-6">
            {/* QR Code */}
            <div
              ref={qrRef}
              className="bg-white p-4 border-2 border-stone"
            >
              <QRCodeSVG
                value={shareUrl}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <FunctionButton
                variant="primary"
                onClick={handleCopyLink}
                icon={copied ? mdiCheck : mdiContentCopy}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </FunctionButton>
              <FunctionButton
                variant="secondary"
                onClick={handleDownloadQR}
                icon={mdiDownload}
              >
                Download QR
              </FunctionButton>
            </div>

            {/* Link preview */}
            <div className="w-full text-center">
              <p className="text-xs text-stone mb-1">Link preview:</p>
              <p className="text-xs text-stone/70 font-mono break-all">
                {truncatedUrl}
              </p>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ShareCharacterModal;
```

**Step 2: Verify the file compiles**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 3: Commit**

```bash
git add src/app/components/character/ShareCharacterModal.tsx
git commit -m "$(cat <<'EOF'
feat: add ShareCharacterModal with QR code and copy link

- Display QR code using qrcode.react
- Copy link to clipboard
- Download QR as PNG
- Handle error state for oversized data

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add Share Button to Character Roster

**Files:**
- Modify: `src/app/components/character/CharacterRoster.tsx`

**Context:** Add a share button next to the Edit and Delete buttons on each character card. The button opens ShareCharacterModal.

**Step 1: Import required modules**

Add to imports at top of file:
```typescript
import { mdiShareVariant } from '@mdi/js';
import ShareCharacterModal from './ShareCharacterModal';
import { CharacterState } from '@/lib/slices/characterSlice';
```

**Step 2: Add state for sharing**

Add inside the component, after the existing state declarations:
```typescript
const [shareCharacter, setShareCharacter] = useState<CharacterState | null>(null);
```

**Step 3: Add share handler**

Add after `handleImportClick`:
```typescript
const handleShareCharacter = (id: string, e?: React.MouseEvent) => {
  e?.stopPropagation();
  const character = getCharacterById(id);
  if (character) {
    setShareCharacter(character);
  }
};
```

**Step 4: Add share button to card actions**

In the action buttons overlay div (around line 168), add the share button before the Edit button:
```typescript
<FunctionButton
  variant="ghost"
  size="sm"
  onClick={(e) => handleShareCharacter(char.id, e)}
  icon={mdiShareVariant}
  title="Share character"
  className="hover:text-gold"
/>
```

**Step 5: Add modal at end of component**

Add before the closing `</div>` of the return statement:
```typescript
{/* Share Modal */}
{shareCharacter && (
  <ShareCharacterModal
    isOpen={!!shareCharacter}
    onClose={() => setShareCharacter(null)}
    character={shareCharacter}
  />
)}
```

**Step 6: Verify the changes compile**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 7: Commit**

```bash
git add src/app/components/character/CharacterRoster.tsx
git commit -m "$(cat <<'EOF'
feat: add share button to character roster cards

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Add Share Button to Character Sheet Header

**Files:**
- Modify: `src/app/components/character/Sections.tsx`

**Context:** The Sections.tsx component contains the main character editing view. Add a share button in the header area where character name is displayed. Need to find where the character header/name section is rendered.

First, read Sections.tsx to understand its structure, then add the share button appropriately.

**Step 1: Read Sections.tsx to understand structure**

Read the file to find where to add the share button (likely near the character name display or in a header actions area).

**Step 2: Import required modules**

Add to imports:
```typescript
import { mdiShareVariant } from '@mdi/js';
import ShareCharacterModal from './ShareCharacterModal';
```

**Step 3: Add share modal state**

Add to component state:
```typescript
const [isShareModalOpen, setIsShareModalOpen] = useState(false);
```

**Step 4: Add share button**

Add a share button in an appropriate location (near save/export buttons or in header).

**Step 5: Add modal**

Add the ShareCharacterModal component with the character from Redux state.

**Step 6: Commit**

```bash
git add src/app/components/character/Sections.tsx
git commit -m "$(cat <<'EOF'
feat: add share button to character editing view

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Create Shared Character Import Page

**Files:**
- Create: `src/app/(website)/character/shared/page.tsx`

**Context:** This page handles the `/character/shared?c=<compressed>` URL. It decompresses the data, displays a read-only character view, and provides an "Add to My Roster" button.

**Step 1: Create the shared character page**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiAccountPlus, mdiAlertCircle } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import { decompressCharacter, reinitializeDerivedFields } from '@/lib/characterSharing';
import {
  createNewCharacterId,
  saveCharacterById,
  setActiveCharacter
} from '@/lib/characterPersistence';
import { CharacterState } from '@/lib/slices/characterSlice';

export default function SharedCharacterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const compressed = searchParams.get('c');

    if (!compressed) {
      setError('No character data found in URL');
      return;
    }

    const decompressed = decompressCharacter(compressed);

    if (!decompressed) {
      setError('Invalid or corrupted character data');
      return;
    }

    const fullCharacter = reinitializeDerivedFields(decompressed);
    setCharacter(fullCharacter);
  }, [searchParams]);

  const handleAddToRoster = () => {
    if (!character) return;

    setIsAdding(true);

    try {
      const id = createNewCharacterId();
      saveCharacterById(id, character);
      setActiveCharacter(id);
      router.push('/character');
    } catch (err) {
      console.error('Failed to add character to roster:', err);
      setError('Failed to add character to roster');
      setIsAdding(false);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="bg-parchment dark:bg-black min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/character"
            className="inline-flex items-center gap-2 text-stone hover:text-gold transition-colors mb-8"
          >
            <Icon path={mdiArrowLeft} size={0.875} />
            <span>Back to Character Manager</span>
          </Link>

          <div className="bg-white dark:bg-black/40 border-2 border-oxblood p-8 text-center">
            <Icon path={mdiAlertCircle} size={3} className="mx-auto text-oxblood mb-4" />
            <h1 className="marcellus text-2xl mb-2">Invalid Share Link</h1>
            <p className="text-stone dark:text-stone-light mb-6">{error}</p>
            <FunctionButton onClick={() => router.push('/character')}>
              Go to Character Manager
            </FunctionButton>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!character) {
    return (
      <div className="bg-parchment dark:bg-black min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-center text-stone">Loading character...</p>
        </div>
      </div>
    );
  }

  // Character display
  return (
    <div className="bg-parchment dark:bg-black min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/character"
          className="inline-flex items-center gap-2 text-stone hover:text-gold transition-colors mb-8"
        >
          <Icon path={mdiArrowLeft} size={0.875} />
          <span>Back to Character Manager</span>
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-black/40 border-2 border-stone p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-stone mb-1">Shared Character</p>
              <h1 className="marcellus text-3xl">
                {character.name || 'Unnamed Character'}
              </h1>
              {(character.age || character.pronouns) && (
                <p className="text-stone dark:text-stone-light mt-1">
                  {[
                    character.age ? `${character.age} years` : null,
                    character.pronouns,
                  ].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <FunctionButton
              onClick={handleAddToRoster}
              icon={mdiAccountPlus}
              isDisabled={isAdding}
            >
              {isAdding ? 'Adding...' : 'Add to My Roster'}
            </FunctionButton>
          </div>
          {character.description && (
            <p className="mt-4 text-stone dark:text-stone-light italic">
              {character.description}
            </p>
          )}
        </div>

        {/* Character Details - Read Only View */}
        <div className="space-y-6">
          {/* Core Identity */}
          <div className="bg-white dark:bg-black/40 border-2 border-stone p-6">
            <h2 className="marcellus text-lg mb-4 border-b border-stone pb-2">Identity</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase text-stone mb-1">Culture</p>
                <p className="font-medium">{character.culture || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-stone mb-1">Path</p>
                <p className="font-medium">{character.path || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-stone mb-1">Patronage</p>
                <p className="font-medium">{character.patronage || '—'}</p>
              </div>
            </div>
          </div>

          {/* Scores */}
          {character.scores.length > 0 && (
            <div className="bg-white dark:bg-black/40 border-2 border-stone p-6">
              <h2 className="marcellus text-lg mb-4 border-b border-stone pb-2">Scores</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {character.scores.map((score) => {
                  const avg = score.subscores.length > 0
                    ? Math.round(score.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0) / score.subscores.length)
                    : 0;
                  return (
                    <div key={score._id} className="border border-stone/30">
                      <div className="bg-stone dark:bg-stone-dark text-white px-3 py-1 text-sm flex justify-between">
                        <span>{score.title}</span>
                        <span className="font-bold">{avg}</span>
                      </div>
                      <div className="p-2 text-xs space-y-1">
                        {score.subscores.map((sub) => (
                          <div key={sub._id} className="flex justify-between">
                            <span className="text-stone dark:text-stone-light">{sub.title}</span>
                            <span className="font-medium">{sub.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Disciplines & Techniques */}
          {(character.disciplines.length > 0 || character.techniques.length > 0) && (
            <div className="bg-white dark:bg-black/40 border-2 border-stone p-6">
              <h2 className="marcellus text-lg mb-4 border-b border-stone pb-2">Disciplines & Techniques</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs uppercase text-stone mb-2">Disciplines ({character.disciplines.length})</h3>
                  {character.disciplines.length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {character.disciplines.map((id) => (
                        <li key={id} className="text-stone dark:text-stone-light">{id}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-stone/50 italic">None</p>
                  )}
                </div>
                <div>
                  <h3 className="text-xs uppercase text-stone mb-2">Techniques ({character.techniques.length})</h3>
                  {character.techniques.length > 0 ? (
                    <ul className="text-sm space-y-1">
                      {character.techniques.map((id) => (
                        <li key={id} className="text-stone dark:text-stone-light">{id}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-stone/50 italic">None</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Gear */}
          {character.gear.length > 0 && (
            <div className="bg-white dark:bg-black/40 border-2 border-stone p-6">
              <h2 className="marcellus text-lg mb-4 border-b border-stone pb-2">Gear</h2>
              <div className="space-y-2 text-sm">
                {character.gear.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="text-stone dark:text-stone-light">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wealth */}
          <div className="bg-white dark:bg-black/40 border-2 border-stone p-6">
            <h2 className="marcellus text-lg mb-4 border-b border-stone pb-2">Wealth</h2>
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <p className="text-xs uppercase text-stone mb-1">Silver</p>
                <p className="font-bold text-lg">{character.wealth.silver}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-stone mb-1">Gold</p>
                <p className="font-bold text-lg">{character.wealth.gold}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-stone mb-1">Lead</p>
                <p className="font-bold text-lg">{character.wealth.lead}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-stone mb-1">Uranium</p>
                <p className="font-bold text-lg">{character.wealth.uranium}</p>
              </div>
            </div>
          </div>

          {/* Animal Companion */}
          {character.animalCompanion.name && (
            <div className="bg-white dark:bg-black/40 border-2 border-stone p-6">
              <h2 className="marcellus text-lg mb-4 border-b border-stone pb-2">Animal Companion</h2>
              <p className="font-medium">{character.animalCompanion.name}</p>
              {character.animalCompanion.details && (
                <p className="text-sm text-stone dark:text-stone-light mt-2">
                  {character.animalCompanion.details}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <FunctionButton
            onClick={handleAddToRoster}
            icon={mdiAccountPlus}
            isDisabled={isAdding}
            size="lg"
          >
            {isAdding ? 'Adding...' : 'Add to My Roster'}
          </FunctionButton>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify the page compiles and renders**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/\(website\)/character/shared/page.tsx
git commit -m "$(cat <<'EOF'
feat: add shared character import page

- Decompress and validate character from URL
- Display read-only character preview
- Add to roster functionality
- Error handling for invalid links

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Test Full Sharing Flow

**Files:** None (manual testing)

**Context:** Test the complete flow: share from roster, copy link, open in new tab, verify data, add to roster.

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test share flow**

1. Go to `/character`
2. Create or select a character
3. Click share button on roster card
4. Verify modal shows QR and copy link works
5. Open the copied link in a new tab
6. Verify character data displays correctly
7. Click "Add to My Roster"
8. Verify character appears in roster

**Step 3: Test error cases**

1. Visit `/character/shared` without `c` param - should show error
2. Visit `/character/shared?c=invalid` - should show error
3. Create very large character (max description) - verify it still works

**Step 4: Commit any fixes**

If any fixes needed, commit them individually with descriptive messages.

---

## Task 8: Update ROADMAP.md

**Files:**
- Modify: `ROADMAP.md`

**Step 1: Mark shareable characters as complete**

Find the line:
```markdown
- [ ] **Shareable characters** - Generate a URL or QR code to share a character (could encode in URL params or use a simple backend)
```

Change to:
```markdown
- [x] **Shareable characters** - Generate a URL or QR code to share a character (could encode in URL params or use a simple backend)
```

**Step 2: Commit**

```bash
git add ROADMAP.md
git commit -m "$(cat <<'EOF'
docs: mark shareable characters feature as complete

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

After completing all tasks:
1. Users can share characters via URL from roster or character sheet
2. Share modal shows QR code and copy link
3. Shared links open a read-only preview
4. Recipients can add shared characters to their roster
5. All data is validated and sanitized on import
6. Feature works fully client-side/offline
