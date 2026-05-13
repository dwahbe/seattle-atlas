'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import {
  EmailShareButton,
  FacebookShareButton,
  WhatsappShareButton,
  XShareButton,
} from 'react-share';
import { toast } from 'sonner';
import {
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconBrandX,
  IconLink,
  IconMail,
  IconShare2,
} from '@tabler/icons-react';

interface SharePopoverProps {
  /** Relative or absolute URL to share. Absolute is resolved at click time. */
  url: string;
  /** Subject line / pre-filled message used by Email / X / WhatsApp. */
  title: string;
}

export function SharePopover({ url, title }: SharePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Resolve the absolute URL at render time of the popover (after mount).
  const absoluteUrl =
    typeof window !== 'undefined' && url.startsWith('/') ? window.location.origin + url : url;

  const handleCopy = () => {
    navigator.clipboard.writeText(absoluteUrl);
    toast.success('Link copied to clipboard');
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="p-2 hover:bg-secondary-bg rounded-md transition-colors"
        aria-label="Share This View"
        aria-expanded={isOpen}
      >
        <IconShare2 className="w-5 h-5 text-text-secondary" stroke={2} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="
            absolute top-full right-0 mt-2 w-52 z-20
            bg-panel-bg border border-border rounded-lg shadow-lg overflow-hidden
            py-1
          "
        >
          <MenuRow
            onClick={handleCopy}
            icon={<IconLink size={16} stroke={2} />}
            label="Copy Link"
          />
          <EmailShareButton
            url={absoluteUrl}
            subject={title}
            body={`${title}\n\n`}
            className="!block w-full"
            beforeOnClick={() => setIsOpen(false)}
          >
            <MenuRow icon={<IconMail size={16} stroke={2} />} label="Email" as="span" />
          </EmailShareButton>
          <WhatsappShareButton
            url={absoluteUrl}
            title={title}
            className="!block w-full"
            beforeOnClick={() => setIsOpen(false)}
          >
            <MenuRow icon={<IconBrandWhatsapp size={16} stroke={2} />} label="WhatsApp" as="span" />
          </WhatsappShareButton>
          <XShareButton
            url={absoluteUrl}
            title={title}
            className="!block w-full"
            beforeOnClick={() => setIsOpen(false)}
          >
            <MenuRow icon={<IconBrandX size={16} stroke={2} />} label="X" as="span" />
          </XShareButton>
          <FacebookShareButton
            url={absoluteUrl}
            className="!block w-full"
            beforeOnClick={() => setIsOpen(false)}
          >
            <MenuRow icon={<IconBrandFacebook size={16} stroke={2} />} label="Facebook" as="span" />
          </FacebookShareButton>
        </div>
      )}
    </div>
  );
}

interface MenuRowProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  /** Render as a span when this row is the child of a react-share button. */
  as?: 'button' | 'span';
}

function MenuRow({ icon, label, onClick, as = 'button' }: MenuRowProps) {
  const className =
    'flex items-center gap-3 w-full px-3 py-2 text-sm text-text-primary hover:bg-secondary-bg transition-colors text-left';
  if (as === 'span') {
    return (
      <span className={className}>
        <span className="w-4 h-4 flex items-center justify-center text-text-secondary">{icon}</span>
        {label}
      </span>
    );
  }
  return (
    <button onClick={onClick} className={className}>
      <span className="w-4 h-4 flex items-center justify-center text-text-secondary">{icon}</span>
      {label}
    </button>
  );
}
