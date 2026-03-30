import {useEffect, useRef, useState, useCallback} from 'react';
import QRCode from 'qrcode';

interface ShareModalProps {
  listId: string;
  onClose: () => void;
}

export function ShareModal({listId, onClose}: ShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/list/${listId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, shareUrl, {
        width: 220,
        margin: 1,
        color: {dark: '#1a1a2e', light: '#ffffff'},
      });
    }
  }, [shareUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.querySelector<HTMLInputElement>('.modal-url input');
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shopping List',
          text: 'Join my shopping list!',
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    }
  }, [shareUrl]);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="modal-title">Share this list</h2>

          <div className="modal-qr">
            <canvas ref={canvasRef} />
          </div>

          <div className="modal-url">
            <input type="text" value={shareUrl} readOnly />
            <button className="btn btn-primary" onClick={handleCopy}>
              Copy
            </button>
          </div>

          <div className="modal-actions">
            {'share' in navigator && (
              <button className="btn btn-primary" onClick={handleNativeShare}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16,6 12,2 8,6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
              </button>
            )}
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
      {copied && <div className="copied-toast">Link copied!</div>}
    </>
  );
}
