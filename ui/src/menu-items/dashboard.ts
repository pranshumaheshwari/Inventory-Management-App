import { ItemInterface } from '.'

const dashboard: ItemInterface = {
    id: 'group-dashboard',
    title: '',
    type: 'group',
    children: [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/',
            icon: 'grid_view_outlined',
            urls: ['/']
        }
    ]
}

export default dashboard