import { useState } from 'react';
import { Hero } from '../components/home/Hero';
import { Intro } from '../components/home/Intro';
import type { Filter } from '../components/home/work';
import { WorkCarousel } from '../components/home/WorkCarousel';
import { MoreCarousel } from '../components/home/MoreCarousel';
import { Playground } from '../components/home/Playground';
import { Services } from '../components/home/Services';
import { Skills } from '../components/home/Skills';
import { About } from '../components/home/About';
import { Testimonials } from '../components/home/Testimonials';
import { Contact } from '../components/home/Contact';
import { useTitle } from '../lib/nav';

/**
 * Home: TV intro, title card, then eight numbered sections: work (carousel), more projects,
 * playground, services, skills, testimonials, about, contact (chat). Option A (black) and
 * Option B (white) share every section; only the colours differ.
 */
export default function Home() {
  const [filter, setFilter] = useState<Filter>('all');
  useTitle();
  return (
    <>
      <Intro />
      <Hero onDoor={setFilter} />
      <WorkCarousel filter={filter} onFilter={setFilter} />
      <MoreCarousel />
      <Playground />
      <Services onFilter={setFilter} />
      <Skills />
      <Testimonials />
      <About />
      <Contact />
    </>
  );
}
