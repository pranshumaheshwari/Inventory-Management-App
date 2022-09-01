import { ItemInterface } from '.'

const dashboard: ItemInterface = {
    id: 'group-rawmaterial',
    title: 'Raw Material',
    type: 'group',
    children: [
        {
            id: 'rawmaterial-inventory',
            title: 'Inventory',
            type: 'item',
            url: '/rawmaterial',
            icon: 'bar_chart_outlined',
        }
    ]
}

export default dashboard