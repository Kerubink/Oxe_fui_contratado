import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';
import HomePage from './pages/HomePage';
import InterviewConfig from './pages/InterviewConfig';
import InterviewScreen from './pages/InterviewScreen';
import EntrevistaLoading from './pages/EntrevistaLoading.jsx';
import VideoCheck from './pages/VideoCheck.jsx';
import SalaDeEntrada from './pages/SalaDeEntrada.jsx';
import AvaliacaoCandidato from './pages/AvaliacaoCandidato.jsx';

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
    path: '/loading',
    element: <EntrevistaLoading />
  },
  {
    path: '/video-check',
    element: <VideoCheck />
  },
  {
    path: '/sala',
    element: <SalaDeEntrada />
  },
  {
    path: '/entrevista',
    element: <InterviewScreen />
  },
  {
    path: '/feedback',
    element: <AvaliacaoCandidato />
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
