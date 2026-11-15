import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './styles.css';
import { routes } from './routes';

declare global {
  interface Window {
    __staticRouterHydrationData?: Parameters<typeof createBrowserRouter>[1] extends infer O
      ? O extends { hydrationData?: infer H }
        ? H
        : never
      : never;
  }
}

const container = document.getElementById('root')!;

// The single-file preview build has no real URLs, so it keeps history in memory.
const router = import.meta.env.VITE_PREVIEW === '1'
  ? createMemoryRouter(routes, { initialEntries: ['/'] })
  : createBrowserRouter(routes, { hydrationData: window.__staticRouterHydrationData });

const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
