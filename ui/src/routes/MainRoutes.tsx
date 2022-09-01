import { lazy } from 'react'

import { Loadable } from '../components'
import { MainLayout } from '../layout'

const Dashboard = Loadable(lazy(() => import('../pages/Dashboard/Dashboard')))
const RawMaterial = Loadable(lazy(() => import('../pages/RawMaterial/RawMaterial')))

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            index: true,
            element: <Dashboard />
        },
        {
            path: 'rawmaterial',
            children: [
                {
                    index: true,
                    element: <RawMaterial />
                }
            ]
        }
    ]
}

export default MainRoutes