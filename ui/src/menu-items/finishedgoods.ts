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
        }
    ]
}

export default dashboard