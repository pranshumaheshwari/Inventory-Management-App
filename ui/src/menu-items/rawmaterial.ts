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
            icon: 'bar_chart_outlined',
            urls: ['/rawmaterial', '/rawmaterial/new', '/rawmaterial/edit']
        },
        {
            id: 'rawmaterial-suppliers',
            title: 'Suppliers',
            type: 'item',
            url: '/suppliers',
            icon: 'local_shipping_outlined',
            urls: ['/suppliers', '/suppliers/new', '/suppliers/edit']
        },
        {
            id: 'rawmaterial-purchaseOrders',
            title: 'Purchase Orders',
            type: 'item',
            url: '/purchaseOrders',
            icon: 'local_offer_outlined',
            urls: ['/purchaseOrders', '/purchaseOrders/new', '/purchaseOrders/edit']
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
                    icon: 'note_outlined',
                    urls: ['/inwards/invoice', '/inwards/invoice/new', '/inwards/invoice/edit']
                },
                {
                    id: 'rawmaterial-inwards-purchaseOrder',
                    title: 'Against Purchase Order',
                    type: 'item',
                    url: '/inwards/purchaseOrder',
                    icon: 'add_box_outlined',
                    urls: ['/inwards/purchaseOrder']
                },
                {
                    id: 'rawmaterial-inwards-qualityCheck',
                    title: 'Quality Check',
                    type: 'item',
                    url: '/inwards/qualityCheck',
                    icon: 'check_outlined',
                    urls: ['/inwards/qualityCheck']
                }
            ],
        }
    ]
}

export default dashboard