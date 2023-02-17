import { Navigate, RouteObject } from 'react-router-dom'

import { Loadable } from '../components'
import { MainLayout } from '../layout'
import { lazy } from 'react'

const Dashboard = Loadable(lazy(() => import('../pages/Dashboard/Dashboard')))

// Raw Material
const RawMaterial = Loadable(
    lazy(() => import('../pages/RawMaterial/RawMaterial'))
)
const NewRawMaterial = Loadable(lazy(() => import('../pages/RawMaterial/New')))
const Suppliers = Loadable(lazy(() => import('../pages/Suppliers/Suppliers')))
const NewSupplier = Loadable(lazy(() => import('../pages/Suppliers/New')))
const PurchaseOrders = Loadable(
    lazy(() => import('../pages/PurchaseOrders/PurchaseOrders'))
)
const NewPurchaseOrders = Loadable(
    lazy(() => import('../pages/PurchaseOrders/New'))
)
const NewPurchaseOrdersFromSalesOrder = Loadable(
    lazy(() => import('../pages/PurchaseOrders/NewFromSalesOrder'))
)
const NewInvoice = Loadable(lazy(() => import('../pages/Inwards/Invoice/New')))
const AgainstPurchaseOrder = Loadable(
    lazy(() => import('../pages/Inwards/PurchaseOrder/PurchaseOrder'))
)
const InwardsQualityCheck = Loadable(
    lazy(() => import('../pages/Inwards/QualityCheck/QualityCheck'))
)
const NewRequisition = Loadable(
    lazy(() => import('../pages/Requisition/New/New'))
)
const IssueRequisition = Loadable(
    lazy(() => import('../pages/Requisition/Issue/Issue'))
)
const RawMaterialReportById = Loadable(
    lazy(() => import('../pages/RawMaterial/Report/ById'))
)
const RawMaterialReportByPo = Loadable(
    lazy(() => import('../pages/RawMaterial/Report/ByPo'))
)
const RawMaterialReportInwards = Loadable(
    lazy(() => import('../pages/RawMaterial/Report/Inwards'))
)
const RawMaterialReportRequisition = Loadable(
    lazy(() => import('../pages/RawMaterial/Report/Requisition'))
)
const RawMaterialReportExcess = Loadable(
    lazy(() => import('../pages/RawMaterial/Report/Excess'))
)
const RawMaterialReportShortage = Loadable(
    lazy(() => import('../pages/RawMaterial/Report/Shortage'))
)

// Finished Goods
const FinishedGood = Loadable(
    lazy(() => import('../pages/FinishedGood/FinishedGood'))
)
const NewFinishedGood = Loadable(
    lazy(() => import('../pages/FinishedGood/New'))
)
const Customers = Loadable(lazy(() => import('../pages/Customer/Customers')))
const NewCustomers = Loadable(lazy(() => import('../pages/Customer/New')))
const SalesOrders = Loadable(
    lazy(() => import('../pages/SalesOrders/SalesOrders'))
)
const NewSalesOrders = Loadable(lazy(() => import('../pages/SalesOrders/New')))
const Production = Loadable(
    lazy(() => import('../pages/Outwards/Production/Production'))
)
const OutwardsQualityCheck = Loadable(
    lazy(() => import('../pages/Outwards/QualityCheck/QualityCheck'))
)
const Dispatch = Loadable(
    lazy(() => import('../pages/Outwards/Dispatch/Dispatch'))
)
const FinishedGoodReportById = Loadable(
    lazy(() => import('../pages/FinishedGood/Report/ById'))
)
const FinishedGoodReportBySo = Loadable(
    lazy(() => import('../pages/FinishedGood/Report/BySo'))
)
const FinishedGoodReportProduction = Loadable(
    lazy(() => import('../pages/FinishedGood/Report/Production'))
)
const FinishedGoodReportDispatch = Loadable(
    lazy(() => import('../pages/FinishedGood/Report/Dispatch'))
)
const FinishedGoodReportProductionTracker = Loadable(
    lazy(() => import('../pages/FinishedGood/Report/ProductionTracker'))
)
const FinishedGoodReportDisptachTracker = Loadable(
    lazy(() => import('../pages/FinishedGood/Report/DispatchTracker'))
)
const FinishedGoodReportManPowerEfficiency = Loadable(
    lazy(() => import('../pages/FinishedGood/Report/ManPowerEfficiency'))
)

// ManPower
const Attendance = Loadable(lazy(() => import('../pages/ManPower/Attendance')))
const AttendanceReport = Loadable(
    lazy(() => import('../pages/ManPower/Report/Report'))
)

const MainRoutes: RouteObject = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            index: true,
            element: <Dashboard />,
        },
        {
            path: 'rawMaterial',
            children: [
                {
                    index: true,
                    element: <RawMaterial />,
                },
                {
                    path: 'new',
                    element: <NewRawMaterial />,
                },
                {
                    path: 'edit',
                    element: <NewRawMaterial />,
                },
                {
                    path: 'report',
                    children: [
                        {
                            path: 'byId',
                            element: <RawMaterialReportById />,
                        },
                        {
                            path: 'byPo',
                            element: <RawMaterialReportByPo />,
                        },
                        {
                            path: 'inwards',
                            element: <RawMaterialReportInwards />,
                        },
                        {
                            path: 'requisition',
                            element: <RawMaterialReportRequisition />,
                        },
                        {
                            path: 'excess',
                            element: <RawMaterialReportExcess />,
                        },
                        {
                            path: 'shortage',
                            element: <RawMaterialReportShortage />,
                        },
                    ],
                },
            ],
        },
        {
            path: 'suppliers',
            children: [
                {
                    index: true,
                    element: <Suppliers />,
                },
                {
                    path: 'new',
                    element: <NewSupplier />,
                },
                {
                    path: 'edit',
                    element: <NewSupplier />,
                },
            ],
        },
        {
            path: 'finishedGoods',
            children: [
                {
                    index: true,
                    element: <FinishedGood />,
                },
                {
                    path: 'new',
                    element: <NewFinishedGood />,
                },
                {
                    path: 'edit',
                    element: <NewFinishedGood />,
                },
                {
                    path: 'report',
                    children: [
                        {
                            path: 'byId',
                            element: <FinishedGoodReportById />,
                        },
                        {
                            path: 'bySo',
                            element: <FinishedGoodReportBySo />,
                        },
                        {
                            path: 'production',
                            element: <FinishedGoodReportProduction />,
                        },
                        {
                            path: 'dispatch',
                            element: <FinishedGoodReportDispatch />,
                        },
                        {
                            path: 'productionTracker',
                            element: <FinishedGoodReportProductionTracker />,
                        },
                        {
                            path: 'dispatchTracker',
                            element: <FinishedGoodReportDisptachTracker />,
                        },
                        {
                            path: 'manpowerEfficiency',
                            element: <FinishedGoodReportManPowerEfficiency />,
                        },
                    ],
                },
            ],
        },
        {
            path: 'customers',
            children: [
                {
                    index: true,
                    element: <Customers />,
                },
                {
                    path: 'new',
                    element: <NewCustomers />,
                },
                {
                    path: 'edit',
                    element: <NewCustomers />,
                },
            ],
        },
        {
            path: 'salesOrders',
            children: [
                {
                    index: true,
                    element: <SalesOrders />,
                },
                {
                    path: 'new',
                    element: <NewSalesOrders />,
                },
                {
                    path: 'edit',
                    element: <NewSalesOrders />,
                },
            ],
        },
        {
            path: 'purchaseOrders',
            children: [
                {
                    index: true,
                    element: <PurchaseOrders />,
                },
                {
                    path: 'new',
                    element: <NewPurchaseOrders />,
                },
                {
                    path: 'newFromSalesOrder',
                    element: <NewPurchaseOrdersFromSalesOrder />,
                },
                {
                    path: 'edit',
                    element: <NewPurchaseOrders />,
                },
            ],
        },
        {
            path: 'inwards',
            children: [
                {
                    index: true,
                    element: <Navigate replace={true} to="invoice" />,
                },
                {
                    path: 'invoice',
                    children: [
                        {
                            index: true,
                            element: <Navigate replace to="new" />,
                        },
                        {
                            path: 'new',
                            element: <NewInvoice />,
                        },
                        {
                            path: 'edit',
                            element: <NewInvoice />,
                        },
                    ],
                },
                {
                    path: 'purchaseOrder',
                    children: [
                        {
                            index: true,
                            element: <AgainstPurchaseOrder />,
                        },
                    ],
                },
                {
                    path: 'qualityCheck',
                    children: [
                        {
                            index: true,
                            element: <InwardsQualityCheck />,
                        },
                    ],
                },
            ],
        },
        {
            path: 'outwards',
            children: [
                {
                    index: true,
                    element: <Navigate replace={true} to="production" />,
                },
                {
                    path: 'production',
                    children: [
                        {
                            index: true,
                            element: <Production />,
                        },
                    ],
                },
                {
                    path: 'qualityCheck',
                    children: [
                        {
                            index: true,
                            element: <OutwardsQualityCheck />,
                        },
                    ],
                },
                {
                    path: 'dispatch',
                    children: [
                        {
                            index: true,
                            element: <Dispatch />,
                        },
                    ],
                },
            ],
        },
        {
            path: 'requisition',
            children: [
                {
                    index: true,
                    element: <Navigate replace={true} to="new" />,
                },
                {
                    path: 'new',
                    element: <NewRequisition />,
                },
                {
                    path: 'issue',
                    element: <IssueRequisition />,
                },
            ],
        },
        {
            path: 'manPower',
            children: [
                {
                    index: true,
                    element: <Navigate replace={true} to="attendance" />,
                },
                {
                    path: 'attendance',
                    element: <Attendance />,
                },
                {
                    path: 'report',
                    element: <AttendanceReport />,
                },
            ],
        },
    ],
}

export default MainRoutes
