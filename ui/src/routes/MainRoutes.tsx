import { Box } from '@mui/material'
import { lazy } from 'react'
import { Outlet } from 'react-router-dom'

import { Loadable } from '../components'
import { MainLayout } from '../layout'

const Dashboard = Loadable(lazy(() => import('../pages/Dashboard/Dashboard')))
const RawMaterial = Loadable(lazy(() => import('../pages/RawMaterial/RawMaterial')))
const NewRawMaterial = Loadable(lazy(() => import('../pages/RawMaterial/New')))
const Suppliers = Loadable(lazy(() => import('../pages/Suppliers/Suppliers')))
const NewSupplier = Loadable(lazy(() => import('../pages/Suppliers/New')))

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
                },
                {
                    path: 'new',
                    element: <NewRawMaterial />
                },
                {
                    path: 'edit',
                    element: <NewRawMaterial />
                }
            ]
        },
        {
            path: 'suppliers',
            children: [
                {
                    index: true,
                    element: <Suppliers />
                },
                {
                    path: 'new',
                    element: <NewSupplier />
                },
                {
                    path: 'edit',
                    element: <NewSupplier />
                }
            ]
        }
    ]
}

export default MainRoutes