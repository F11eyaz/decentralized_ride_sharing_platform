import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignIn, NotFoundPage, Profile, Home, SignUp, MapPage } from '../pages';
import { Layout } from '../components';

const AppRouter = () => {
  const routes = [
    { path: '/sign-in', element: <SignIn /> },
    { path: '/sign-up', element: <SignUp /> },
    { path: '*', element: <NotFoundPage /> }, 
  ];

  const privateRoutes = [
    { path: '/', element: <Home/> },
    // { path: 'map', element: <Map/> },
    { path: '/profile', element: <Profile /> },
    { path: '/map', element: <MapPage /> },
  ];

  return (
    <Router>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))},
        {privateRoutes.map((route: any) => (
          <Route key={route.path} path={route.path} element={(<Layout>{route.element}</Layout>)} />
        ))}
      </Routes>
    </Router>
  );
};

export default AppRouter;
