import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OptionPicker, OptionProvider } from './lib/option';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Scroll positions per history entry, so Back returns to the same place. */
const positions = new Map<string, number>();

function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const first = useRef(true);

  useIsoLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // After the first navigation, first-load entrances no longer replay
    document.documentElement.classList.remove('first-load');
    if (navType === 'POP') {
      const y = positions.get(location.key);
      if (y != null) {
        window.scrollTo(0, y);
        return;
      }
    }
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) {
        el.scrollIntoView({ block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.key]);

  useEffect(() => {
    const save = () => positions.set(location.key, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [location.key]);

  return null;
}

/** Move focus to the main landmark after a route change so screen readers start at the new page. */
function FocusManager() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (location.hash) return;
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [location.pathname]);
  return null;
}

export default function Root() {
  return (
    <OptionProvider>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <div className="progress" aria-hidden="true" />
        <ScrollManager />
        <FocusManager />
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          <Outlet />
        </main>
        <Footer />
        <OptionPicker />
    </OptionProvider>
  );
}
