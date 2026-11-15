import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUp, ArrowUpRight, RotateCcw } from 'lucide-react';
import { site } from '../../content/site';
import { Picture } from '../Picture';
import { Clock } from '../Clock';

type Msg = { id: number; from: 'me' | 'you'; text: string };
type Action = { label: string; href?: string; ext?: boolean; reply?: string; next?: Step };
type Step = 'start' | 'hire' | 'brand-name' | 'brand-need' | 'brand-when' | 'brand-done' | 'hi';

const mail = (subject: string, body: string) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/**
 * Contact as a short chat. Pick a reply; for a brand project the chat asks three quick questions and
 * then opens an email with the answers filled in. Nothing is sent from the page itself.
 */
export function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<Step | null>(null);
  const [draft, setDraft] = useState('');
  const answers = useRef({ name: '', need: '', when: '' });
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const nextId = useRef(0);
  const started = useRef(false);

  const add = (from: Msg['from'], text: string) => setMsgs((m) => [...m, { id: nextId.current++, from, text }]);

  /** Queue the other side's messages, each after a short "typing" pause, then move to a step. */
  const say = (lines: string[], then: Step) => {
    setStep(null);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let t = 0;
    lines.forEach((line) => {
      const pause = reduce ? 150 : Math.min(400 + line.length * 12, 1100);
      timers.current.push(window.setTimeout(() => setTyping(true), t));
      t += pause;
      timers.current.push(
        window.setTimeout(() => {
          setTyping(false);
          add('you', line);
        }, t),
      );
      t += 200;
    });
    timers.current.push(window.setTimeout(() => setStep(then), t));
  };

  const start = () => {
    timers.current.forEach((x) => window.clearTimeout(x));
    timers.current = [];
    answers.current = { name: '', need: '', when: '' };
    setMsgs([]);
    setTyping(false);
    say(['Hi, I’m Anuoluwapo.', 'What brings you here?'], 'start');
  };

  // Start the conversation the first time the chat scrolls into view.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          start();
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.current.forEach((x) => window.clearTimeout(x));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the newest message in view inside the chat (not the page).
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing, step]);

  const asking = step === 'brand-name' || step === 'brand-need' || step === 'brand-when';
  useEffect(() => {
    if (asking) input.current?.focus({ preventScroll: true });
  }, [asking]);

  const choose = (a: Action) => {
    if (!a.reply || !a.next) return;
    add('me', a.reply);
    if (a.next === 'hire')
      say(
        [
          'Great. MONTRA and Confam are good places to start.',
          'Book a quick call or send me an email.',
        ],
        'hire',
      );
    if (a.next === 'brand-name')
      say(['Nice! Three quick questions and I’ll open an email for you.', 'What’s your name?'], 'brand-name');
    if (a.next === 'hi') say(['Hi! Email is the best way to reach me.'], 'hi');
    if (a.next === 'brand-done') {
      answers.current.when = '';
      say(['Done. Tap below to send it.'], 'brand-done');
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !asking) return;
    add('me', text);
    setDraft('');
    if (step === 'brand-name') {
      answers.current.name = text;
      say([`Thanks, ${text}. What do you need? A brand, packaging, a campaign?`], 'brand-need');
    } else if (step === 'brand-need') {
      answers.current.need = text;
      say(['Any timeline or budget?'], 'brand-when');
    } else if (step === 'brand-when') {
      answers.current.when = text;
      say(['Done. Tap below to send it.'], 'brand-done');
    }
  };

  const a = answers.current;
  const briefHref = mail(
    `Project enquiry${a.name ? ` from ${a.name}` : ''}`,
    [`Hi Anuoluwapo,`, '', `Name: ${a.name}`, `What we need: ${a.need}`, `Timeline and budget: ${a.when || 'Not sure yet'}`, ''].join('\n'),
  );

  const actions: Record<Step, Action[]> = {
    start: [
      { label: 'I’m hiring for a product role', reply: 'I’m hiring for a product role', next: 'hire' },
      { label: 'I have a brand or packaging project', reply: 'I have a brand or packaging project', next: 'brand-name' },
      { label: 'Just saying hi', reply: 'Just saying hi 👋', next: 'hi' },
    ],
    hire: [
      { label: 'Book a 15-minute call', href: site.bookCall, ext: true },
      { label: 'Email me', href: mail('Product design role', 'Hi Anuoluwapo,\n\n') },
      { label: 'View LinkedIn profile', href: site.linkedin, ext: true },
    ],
    'brand-name': [],
    'brand-need': [],
    'brand-when': [{ label: 'Not sure yet', reply: 'Not sure yet', next: 'brand-done' }],
    'brand-done': [
      { label: 'Send it by email', href: briefHref },
      { label: `Call ${site.phone}`, href: site.phoneHref },
    ],
    hi: [
      { label: 'Email me', href: mail('Hello', 'Hi Anuoluwapo,\n\n') },
      { label: 'Follow on X', href: site.x, ext: true },
    ],
  };

  const shown = step ? actions[step] : [];

  return (
    <div ref={box} className="chat">
      <div className="flex items-center gap-3 border-b border-rule px-4 py-3">
        <span className="size-9 shrink-0 overflow-hidden rounded-full">
          <Picture image="portrait" alt="" sizes="36px" className="size-full object-cover grayscale" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{site.name}</span>
          <Clock className="label inline-flex items-center text-muted" />
        </span>
        <button type="button" onClick={start} className="press label inline-flex min-h-11 items-center gap-1.5 px-2 text-muted hover:text-ink">
          <RotateCcw aria-hidden size={14} strokeWidth={1.75} />
          Start over
        </button>
      </div>

      <div ref={log} role="log" aria-live="polite" aria-label="Conversation" className="chat-log">
        {msgs.map((m) => (
          <p key={m.id} className={`bubble ${m.from === 'me' ? 'bubble-me' : 'bubble-you'}`}>
            {m.from === 'you' && <span className="sr-only">{site.name}: </span>}
            {m.from === 'me' && <span className="sr-only">You: </span>}
            {m.text}
          </p>
        ))}
        {typing && (
          <p className="bubble bubble-you typing" aria-label={`${site.name} is typing`}>
            <span />
            <span />
            <span />
          </p>
        )}
        {shown.length > 0 && (
          <div className="chat-actions">
            {shown.map((x) =>
              x.href ? (
                <Choice key={x.label} href={x.href} ext={x.ext} solid={x.label === 'Send it by email'}>
                  {x.label}
                </Choice>
              ) : (
                <button key={x.label} type="button" onClick={() => choose(x)} className="chip-btn press">
                  {x.label}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-rule p-2">
        <label htmlFor="chat-input" className="sr-only">
          Your reply
        </label>
        <input
          ref={input}
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!asking}
          autoComplete={step === 'brand-name' ? 'name' : 'off'}
          placeholder={asking ? 'Type your answer' : 'Pick a reply above'}
          className="min-h-11 min-w-0 flex-1 rounded-full bg-l1 px-4 text-base outline-none placeholder:text-muted disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!asking || !draft.trim()}
          aria-label="Send reply"
          className="press grid size-11 shrink-0 place-items-center rounded-full bg-ink text-paper disabled:opacity-30"
        >
          <ArrowUp aria-hidden size={18} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

function Choice({ href, ext, solid, children }: { href: string; ext?: boolean; solid?: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      target={ext ? '_blank' : undefined}
      rel={ext ? 'noreferrer' : undefined}
      className={`chip-btn press ${solid ? 'chip-solid' : ''}`}
    >
      {children}
      {ext && (
        <>
          <ArrowUpRight aria-hidden size={14} strokeWidth={1.75} />
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </a>
  );
}
