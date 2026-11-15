import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { routes } from './routes';
import { projects, projectBySlug } from './content/projects';
import { site } from './content/site';

export const paths = ['/', '/archive', ...projects.map((p) => `/work/${p.slug}`), '/404'];

export function headFor(path: string) {
  const base = { title: `${site.name} — ${site.role}`, description: site.description, image: '/img/montra-cover-900.webp' };
  if (path === '/archive') return { ...base, title: `Archive — ${site.name}`, description: 'Earlier product and UI work.' };
  if (path === '/404') return { ...base, title: `Page not found — ${site.name}` };
  const m = path.match(/^\/work\/(.+)$/);
  const p = m ? projectBySlug(m[1]) : undefined;
  if (p) return { title: `${p.name} — ${site.name}`, description: p.description, image: `/img/${p.cover}-900.webp` };
  return base;
}

export async function render(path: string) {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`http://localhost${path}`));
  if (context instanceof Response) throw context;
  const router = createStaticRouter(handler.dataRoutes, context);
  const html = renderToString(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} />
    </StrictMode>,
  );
  return { html, head: headFor(path) };
}
