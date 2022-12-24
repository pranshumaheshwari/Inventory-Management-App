import { Loadable } from '../components';
import { MinimalLayout } from '../layout';
import { Navigate } from 'react-router-dom';
import { lazy } from 'react';

const AuthLogin = Loadable(lazy(() => import('../pages/Login/Login')));

const LoginRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/',
            element: <AuthLogin />
        },
        {
            path: '*',
            element: <Navigate replace={true} to='/' />
        }
    ]
};

export default LoginRoutes;