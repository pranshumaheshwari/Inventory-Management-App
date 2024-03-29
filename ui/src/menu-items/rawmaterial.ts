import {
    IconBuildingStore,
    IconBuildingWarehouse,
    IconCheckupList,
    IconCirclePlus,
    IconClipboardPlus,
    IconFileInvoice,
    IconPackage,
    IconTextPlus,
} from '@tabler/icons-react'

import { ItemInterface } from '.'

const dashboard: ItemInterface = {
    id: 'rawmaterial',
    title: 'Raw Material',
    type: 'group',
    allowedTypes: ['iqc', 'ppc'],
    children: [
        {
            id: 'rawmaterial-inventory',
            title: 'Inventory',
            type: 'item',
            url: '/rawMaterial',
            icon: IconBuildingWarehouse,
            allowedTypes: ['iqc', 'ppc'],
            urls: ['/rawMaterial', '/rawMaterial/new', '/rawMaterial/edit'],
        },
        {
            id: 'rawmaterial-suppliers',
            title: 'Suppliers',
            type: 'item',
            url: '/suppliers',
            icon: IconBuildingStore,
            urls: ['/suppliers', '/suppliers/new', '/suppliers/edit'],
            allowedTypes: ['ppc'],
        },
        {
            id: 'rawmaterial-purchaseOrders',
            title: 'Purchase Orders',
            type: 'item',
            url: '/purchaseOrders',
            icon: IconPackage,
            urls: [
                '/purchaseOrders',
                '/purchaseOrders/new',
                '/purchaseOrders/edit',
                '/purchaseOrders/newFromSalesOrder',
            ],
            allowedTypes: ['ppc'],
        },
        {
            id: 'rawmaterial-inwards',
            title: 'Inwards',
            type: 'group',
            allowedTypes: ['iqc', 'ppc'],
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
                    allowedTypes: ['ppc'],
                },
                {
                    id: 'rawmaterial-inwards-purchaseOrder',
                    title: 'Against Purchase Order',
                    type: 'item',
                    url: '/inwards/purchaseOrder',
                    icon: IconClipboardPlus,
                    urls: ['/inwards/purchaseOrder'],
                    allowedTypes: ['ppc'],
                },
                {
                    id: 'rawmaterial-inwards-qualityCheck',
                    title: 'Quality Check',
                    type: 'item',
                    url: '/inwards/qualityCheck',
                    icon: IconCheckupList,
                    urls: ['/inwards/qualityCheck'],
                    allowedTypes: ['iqc', 'ppc'],
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
                    allowedTypes: ['ppc'],
                },
                {
                    id: 'rawmaterial-requisition-issue',
                    title: 'Issue Against Requisition',
                    type: 'item',
                    url: '/requisition/issue',
                    icon: IconTextPlus,
                    urls: ['/requisition/issue'],
                    allowedTypes: ['ppc'],
                },
            ],
        },
        {
            id: 'rawmaterial-report',
            title: 'Reports',
            type: 'group',
            allowedTypes: ['iqc', 'ppc'],
            children: [
                {
                    id: 'rawmaterial-report-byid',
                    title: 'By Unique Identifier',
                    type: 'item',
                    url: '/rawMaterial/report/byId',
                    urls: ['/rawMaterial/report/byId'],
                    allowedTypes: ['iqc', 'ppc'],
                },
                {
                    id: 'rawmaterial-report-bypo',
                    title: 'By Purchase Order',
                    type: 'item',
                    url: '/rawMaterial/report/byPo',
                    urls: ['/rawMaterial/report/byPo'],
                    allowedTypes: ['ppc'],
                },
                {
                    id: 'rawmaterial-report-inwards',
                    title: 'Inwards',
                    type: 'item',
                    url: '/rawMaterial/report/inwards',
                    urls: ['/rawMaterial/report/inwards'],
                    allowedTypes: ['iqc', 'ppc'],
                },
                {
                    id: 'rawmaterial-report-requisition',
                    title: 'Requisition',
                    type: 'item',
                    url: '/rawMaterial/report/requisition',
                    urls: ['/rawMaterial/report/requisition'],
                    allowedTypes: ['ppc'],
                },
                {
                    id: 'rawmaterial-report-excess',
                    title: 'Excess',
                    type: 'item',
                    url: '/rawMaterial/report/excess',
                    urls: ['/rawMaterial/report/excess'],
                    allowedTypes: ['ppc'],
                },
                {
                    id: 'rawmaterial-report-shortage',
                    title: 'Shortage',
                    type: 'item',
                    url: '/rawMaterial/report/shortage',
                    urls: ['/rawMaterial/report/shortage'],
                    allowedTypes: ['ppc'],
                },
            ],
        },
    ],
}

export default dashboard
