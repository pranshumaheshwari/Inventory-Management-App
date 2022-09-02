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
        },
        {
            id: 'rawmaterial-suppliers',
            title: 'Suppliers',
            type: 'item',
            url: '/suppliers',
            icon: 'local_shipping_outlined',
        }
    ]
}

export default dashboard