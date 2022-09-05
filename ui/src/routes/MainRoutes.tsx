import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'

import { Loadable } from '../components'
import { MainLayout } from '../layout'

const Dashboard = Loadable(lazy(() => import('../pages/Dashboard/Dashboard')))

// Raw Material
const RawMaterial = Loadable(lazy(() => import('../pages/RawMaterial/RawMaterial')))
const NewRawMaterial = Loadable(lazy(() => import('../pages/RawMaterial/New')))
const Suppliers = Loadable(lazy(() => import('../pages/Suppliers/Suppliers')))
const NewSupplier = Loadable(lazy(() => import('../pages/Suppliers/New')))

// Finished Goods
const FinishedGood = Loadable(lazy(() => import('../pages/FinishedGood/FinishedGood')))
const NewFinishedGood = Loadable(lazy(() => import('../pages/FinishedGood/New')))
const Customers = Loadable(lazy(() => import('../pages/Customer/Customers')))
const NewCustomers = Loadable(lazy(() => import('../pages/Customer/New')))

const MainRoutes: RouteObject = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            index: true,
            element: <Dashboard />
        },
        {
            path: 'rawMaterial',
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
        },
        {
            path: 'finishedGoods',
            children: [
                {
                    index: true,
                    element: <FinishedGood />
                },
                {
                    path: 'new',
                    element: <NewFinishedGood />
                },
                {
                    path: 'edit',
                    element: <NewFinishedGood />
                }
            ]
        },
        {
            path: 'customers',
            children: [
                {
                    index: true,
                    element: <Customers />
                },
                {
                    path: 'new',
                    element: <NewCustomers />
                },
                {
                    path: 'edit',
                    element: <NewCustomers />
                }
            ]
        }
    ]
}

export default MainRoutes