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
            icon: 'bar_chart_outlined',
            urls: ['/finishedGoods', '/finishedGoods/new', '/finishedGoods/edit']
        },
        {
            id: 'finishedgood-customer',
            title: 'Customer',
            type: 'item',
            url: '/customers',
            icon: 'local_shipping_outlined',
            urls: ['/customers', '/customers/new', '/customers/edit']
        },
        {
            id: 'finishedgood-salesOrders',
            title: 'Sales Orders',
            type: 'item',
            url: '/salesOrders',
            icon: 'discount_outlined',
            urls: ['/salesOrders', '/salesOrders/new', '/salesOrders/edit']
        },
        {
            id: 'finishedgood-production',
            title: 'Production',
            type: 'item',
            url: '/production',
            icon: 'precision_manufacturing'
        },
        {
            id: 'finishedgood-outwards',
            title: 'Outwards',
            type: 'group',
            children: [
                {
                    id: 'finishedgood-outwards-qualityCheck',
                    title: 'Quality Check',
                    type: 'item',
                    url: '/outwards/qualityCheck',
                    icon: 'check_outlined',
                    urls: ['/outwards/qualityCheck']
                },
                {
                    id: 'finishedgood-outwards-dispatch',
                    title: 'Dispatch',
                    type: 'item',
                    url: '/outwards/dispatch',
                    icon: 'note_outlined',
                    urls: ['/outwards/dispatch']
                },
            ],
        }
    ]
}

export default dashboard