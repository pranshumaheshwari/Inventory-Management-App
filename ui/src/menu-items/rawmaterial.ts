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
        }
    ]
}

export default dashboard