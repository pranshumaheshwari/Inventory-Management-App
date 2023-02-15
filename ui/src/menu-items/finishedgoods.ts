import {
    IconAssembly,
    IconBuildingStore,
    IconBuildingWarehouse,
    IconCheckupList,
    IconPackgeExport,
    IconTruckDelivery,
} from '@tabler/icons-react'

import { ItemInterface } from '.'

const dashboard: ItemInterface = {
    id: 'finishedgood',
    title: 'Finished Goods',
    type: 'group',
    children: [
        {
            id: 'finishedgood-inventory',
            title: 'Inventory',
            type: 'item',
            url: '/finishedGoods',
            icon: IconBuildingWarehouse,
            urls: [
                '/finishedGoods',
                '/finishedGoods/new',
                '/finishedGoods/edit',
            ],
        },
        {
            id: 'finishedgood-customer',
            title: 'Customer',
            type: 'item',
            url: '/customers',
            icon: IconBuildingStore,
            urls: ['/customers', '/customers/new', '/customers/edit'],
        },
        {
            id: 'finishedgood-salesOrders',
            title: 'Sales Orders',
            type: 'item',
            url: '/salesOrders',
            icon: IconPackgeExport,
            urls: ['/salesOrders', '/salesOrders/new', '/salesOrders/edit'],
        },
        {
            id: 'finishedgood-outwards',
            title: 'Outwards',
            type: 'group',
            children: [
                {
                    id: 'finishedgood-outwards-production',
                    title: 'Production',
                    type: 'item',
                    url: '/outwards/production',
                    icon: IconAssembly,
                    urls: ['/outwards/production'],
                },
                {
                    id: 'finishedgood-outwards-qualityCheck',
                    title: 'Quality Check',
                    type: 'item',
                    url: '/outwards/qualityCheck',
                    icon: IconCheckupList,
                    urls: ['/outwards/qualityCheck'],
                },
                {
                    id: 'finishedgood-outwards-dispatch',
                    title: 'Dispatch',
                    type: 'item',
                    url: '/outwards/dispatch',
                    icon: IconTruckDelivery,
                    urls: ['/outwards/dispatch'],
                },
            ],
        },
        {
            id: 'finishedgood-report',
            title: 'Reports',
            type: 'group',
            children: [
                {
                    id: 'finishedgood-report-byid',
                    title: 'By Unique Identifier',
                    type: 'item',
                    url: '/finishedGoods/report/byId',
                    urls: ['/finishedGoods/report/byId'],
                },
                {
                    id: 'finishedgood-report-byso',
                    title: 'By Sales Order',
                    type: 'item',
                    url: '/finishedGoods/report/bySo',
                    urls: ['/finishedGoods/report/bySo'],
                },
                {
                    id: 'finishedgood-report-production',
                    title: 'Production',
                    type: 'item',
                    url: '/finishedGoods/report/production',
                    urls: ['/finishedGoods/report/production'],
                },
                {
                    id: 'finishedgood-report-dispatch',
                    title: 'Dispatch',
                    type: 'item',
                    url: '/finishedGoods/report/dispatch',
                    urls: ['/finishedGoods/report/dispatch'],
                },
                {
                    id: 'finishedgood-report-productiontracker',
                    title: 'Production Tracker',
                    type: 'item',
                    url: '/finishedGoods/report/productionTracker',
                    urls: ['/finishedGoods/report/productionTracker'],
                },
                {
                    id: 'finishedgood-report-dispatchtracker',
                    title: 'Dispatch Tracker',
                    type: 'item',
                    url: '/finishedGoods/report/dispatchTracker',
                    urls: ['/finishedGoods/report/dispatchTracker'],
                },
            ],
        },
    ],
}

export default dashboard
