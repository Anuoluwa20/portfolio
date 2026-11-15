import { availability, site } from '../../content/site';
import { CopyEmail } from '../CopyEmail';
import { SectionHead } from './SectionHead';
import { Chat } from './Chat';
import { Btn } from '../Btn';
import { Words } from '../Words';

/**
 * (08) Contact: the one inverted block on the page (white on Option A, black on Option B).
 * A short chat on the right; the plain ways to reach me on the left, for anyone who'd rather skip it.
 */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="flip-block">
      <div className="wrap pb-16 pt-16 md:pb-24 md:pt-24">
        <SectionHead id="contact-title" title="Contact" />

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5">
            <p className="t-display-2 sd-words max-w-[14ch] font-bold leading-[1.1] tracking-[-0.03em]">
              <Words text="Say hi." />
            </p>
            <p className="mt-4 max-w-[36ch] text-muted">{availability}</p>
            <div className="mt-8">
              <CopyEmail email={site.email} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn href={site.bookCall} ext>
                Book a 15-minute call
              </Btn>
              <Btn href={site.linkedin} ext>
                LinkedIn
              </Btn>
              <Btn href={site.x} ext>
                X
              </Btn>
              <Btn href={site.phoneHref} icon="none">
                {`Call ${site.phone}`}
              </Btn>
            </div>
          </div>
          <div className="sd-rise min-w-0 md:col-span-7">
            <Chat />
          </div>
        </div>
      </div>
    </section>
  );
}
