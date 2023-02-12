import {
    IconBuildingStore,
    IconBuildingWarehouse,
    IconCheckupList,
    IconCirclePlus,
    IconClipboardPlus,
    IconFileInvoice,
    IconPackgeImport,
    IconTextPlus,
} from '@tabler/icons-react'

import { ItemInterface } from '.'

const dashboard: ItemInterface = {
    id: 'rawmaterial',
    title: 'Raw Material',
    type: 'group',
    children: [
        {
            id: 'rawmaterial-inventory',
            title: 'Inventory',
            type: 'item',
            url: '/rawmaterial',
            icon: IconBuildingWarehouse,
            urls: ['/rawmaterial', '/rawmaterial/new', '/rawmaterial/edit'],
        },
        {
            id: 'rawmaterial-suppliers',
            title: 'Suppliers',
            type: 'item',
            url: '/suppliers',
            icon: IconBuildingStore,
            urls: ['/suppliers', '/suppliers/new', '/suppliers/edit'],
        },
        {
            id: 'rawmaterial-purchaseOrders',
            title: 'Purchase Orders',
            type: 'item',
            url: '/purchaseOrders',
            icon: IconPackgeImport,
            urls: [
                '/purchaseOrders',
                '/purchaseOrders/new',
                '/purchaseOrders/edit',
            ],
        },
        {
            id: 'rawmaterial-inwards',
            title: 'Inwards',
            type: 'group',
            children: [
                {
                    id: 'rawmaterial-inwards-invoice',
                    title: 'Invoice',
                    type: 'item',
                    url: '/inwards/invoice',
                    icon: IconFileInvoice,
                    urls: [
                        '/inwards/invoice',
                        '/inwards/invoice/new',
                        '/inwards/invoice/edit',
                    ],
                },
                {
                    id: 'rawmaterial-inwards-purchaseOrder',
                    title: 'Against Purchase Order',
                    type: 'item',
                    url: '/inwards/purchaseOrder',
                    icon: IconClipboardPlus,
                    urls: ['/inwards/purchaseOrder'],
                },
                {
                    id: 'rawmaterial-inwards-qualityCheck',
                    title: 'Quality Check',
                    type: 'item',
                    url: '/inwards/qualityCheck',
                    icon: IconCheckupList,
                    urls: ['/inwards/qualityCheck'],
                },
            ],
        },
        {
            id: 'rawmaterial-requisition',
            title: 'Requisition',
            type: 'group',
            children: [
                {
                    id: 'rawmaterial-requisition-new',
                    title: 'New Requisition',
                    type: 'item',
                    url: '/requisition/new',
                    icon: IconCirclePlus,
                    urls: ['/requisition/new'],
                },
                {
                    id: 'rawmaterial-requisition-issue',
                    title: 'Issue Against Requisition',
                    type: 'item',
                    url: '/requisition/issue',
                    icon: IconTextPlus,
                    urls: ['/requisition/issue'],
                },
            ],
        },
        {
            id: 'rawmaterial-report',
            title: 'Reports',
            type: 'group',
            children: [
                {
                    id: 'rawmaterial-report-byid',
                    title: 'By Unique Identifier',
                    type: 'item',
                    url: '/rawMaterial/report/byId',
                    urls: ['/rawMaterial/report/byId'],
                },
                {
                    id: 'rawmaterial-report-bypo',
                    title: 'By Purchase Order',
                    type: 'item',
                    url: '/rawMaterial/report/byPo',
                    urls: ['/rawMaterial/report/byPo'],
                },
                {
                    id: 'rawmaterial-report-inwards',
                    title: 'Inwards',
                    type: 'item',
                    url: '/rawMaterial/report/inwards',
                    urls: ['/rawMaterial/report/inwards'],
                },
                {
                    id: 'rawmaterial-report-requisition',
                    title: 'Requisition',
                    type: 'item',
                    url: '/rawMaterial/report/requisition',
                    urls: ['/rawMaterial/report/requisition'],
                },
                {
                    id: 'rawmaterial-report-excess',
                    title: 'Excess',
                    type: 'item',
                    url: '/rawMaterial/report/excess',
                    urls: ['/rawMaterial/report/excess'],
                },
            ],
        },
    ],
}

export default dashboard
