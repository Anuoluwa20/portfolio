import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';

/** Email address, a send button and a copy button. "Copied" is announced politely. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <div>
      <p className="mono break-all select-all">{email}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={`mailto:${email}`} className="pill pill-solid press">
          <span className="pill-roll">
            <span>Send an email</span>
            <span aria-hidden="true">Send an email</span>
          </span>
          <span className="pill-ico" data-dir="right">
            <Mail aria-hidden size={15} strokeWidth={2} />
          </span>
        </a>
        <button type="button" onClick={copy} className="pill press">
          <span className="pill-roll w-[6.5rem] text-left">
            <span>{copied ? 'Copied' : 'Copy address'}</span>
            <span aria-hidden="true">{copied ? 'Copied' : 'Copy address'}</span>
          </span>
          <span className="pill-ico">
            {copied ? <Check aria-hidden size={15} strokeWidth={2} /> : <Copy aria-hidden size={15} strokeWidth={2} />}
          </span>
        </button>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Email address copied' : ''}
      </span>
    </div>
  );
}
