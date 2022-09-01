import { lazy } from 'react';

import { Loadable } from '../components';
import { MinimalLayout } from '../layout';

const AuthLogin = Loadable(lazy(() => import('../pages/Login/Login')));

const LoginRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/',
            element: <AuthLogin />
        },
    ]
};

export default LoginRoutes;