import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import HomePage from './pages/HomePage';
import InterviewConfig from './pages/InterviewConfig';
import InterviewScreen from './pages/InterviewScreen';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      }
    ]
  },
  {
    path: '/config',
    element: <InterviewConfig />
  },
  {
    path: '/interview',
    element: <InterviewScreen />
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
