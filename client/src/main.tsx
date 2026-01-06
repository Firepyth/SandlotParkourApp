import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import Main from './routes/Main';
import Courses from './routes/Courses';
import CourseDetails from './routes/CourseDetails';
import Players from './routes/Players';
import PlayerCourse from './routes/PlayerCourse';
import Error from './routes/Error';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Main /> },
      { path: "courses", element: <Courses /> },
      { path: "courses/:id", element: <CourseDetails /> },
      { path: "players", element: <Players /> },
      { path: "players/:player_id/:course_id", element: <PlayerCourse /> }
    ],
    errorElement: <ErrorBoundary />
  }
]);

function ErrorBoundary() {
  return <App><Error/></App>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);