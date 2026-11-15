import type { RouteObject } from 'react-router';
import Root from './root';
import Home from './pages/Home';
import Project from './pages/Project';
import Archive from './pages/Archive';
import NotFound from './pages/NotFound';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: 'work/:slug', element: <Project /> },
      { path: 'archive', element: <Archive /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
