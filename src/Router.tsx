import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChatInterface } from './components/chatInterface/chatInterface';
import { HelpPage } from './pages/Help.page';
import { HelpHrPage } from './pages/Helphr.page';
import { HomePage } from './pages/Home.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/help',
    element: <HelpPage />,
    children: [{ path: 'hr', element: <HelpHrPage /> }],
  },
  {
    path: '/chat',
    element: <ChatInterface />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
