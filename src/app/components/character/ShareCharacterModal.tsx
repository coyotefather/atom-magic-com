'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { QRCodeSVG } from 'qrcode.react';
import Icon from '@mdi/react';
import { mdiContentCopy, mdiCheck, mdiDownload, mdiAlertCircleOutline } from '@mdi/js';
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
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate URL when modal opens
  useEffect(() => {
    if (isOpen) {
      setShareUrl(generateShareUrl(character));
      setCopied(false);
    }
  }, [isOpen, character]);

  // Manage timeout cleanup for copied state
  useEffect(() => {
    if (!copied) return;
    const timeoutId = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [copied]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [shareUrl]);

  const handleDownloadQR = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

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

      const fileName = character.name ? character.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'character';
      const link = document.createElement('a');
      link.download = `${fileName}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      console.error('Failed to load QR code image for download');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [character.name]);

  const truncateUrl = (url: string, maxLength: number = 60): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <Modal
      backdrop="opaque"
      size="md"
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      classNames={{
        base: 'rounded-none',
        header: 'rounded-none',
        body: 'rounded-none',
        footer: 'rounded-none',
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 marcellus">
              Share Character
            </ModalHeader>
            <ModalBody>
              {shareUrl ? (
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
                    />
                  </div>

                  {/* URL Preview */}
                  <div className="w-full">
                    <p className="text-xs text-stone dark:text-stone-light break-all text-center font-mono">
                      {truncateUrl(shareUrl)}
                    </p>
                  </div>

                  {/* Character Name */}
                  {character.name && (
                    <p className="text-sm text-stone-dark dark:text-stone-light">
                      Sharing: <span className="font-semibold">{character.name}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Icon
                    path={mdiAlertCircleOutline}
                    size={2}
                    className="text-oxblood"
                  />
                  <p className="text-center text-stone-dark dark:text-stone-light">
                    Unable to generate share link. The character data may be too large to share via URL.
                  </p>
                  <p className="text-sm text-stone dark:text-stone-light text-center">
                    Try reducing the character description or gear to create a shareable link.
                  </p>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex gap-3 justify-center">
              {/* Accessibility announcement for copy success */}
              <span className="sr-only" aria-live="polite" aria-atomic="true">
                {copied ? 'Link copied to clipboard' : ''}
              </span>
              {shareUrl && (
                <>
                  <FunctionButton
                    onClick={handleCopyLink}
                    icon={copied ? mdiCheck : mdiContentCopy}
                    variant="primary"
                    title={copied ? 'Link copied to clipboard' : 'Copy share link to clipboard'}
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </FunctionButton>
                  <FunctionButton
                    onClick={handleDownloadQR}
                    icon={mdiDownload}
                    variant="secondary"
                    title="Download QR code as PNG image"
                  >
                    Download QR
                  </FunctionButton>
                </>
              )}
              {!shareUrl && (
                <FunctionButton
                  onClick={onClose}
                  variant="secondary"
                >
                  Close
                </FunctionButton>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ShareCharacterModal;
