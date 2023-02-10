import { IconGridDots } from '@tabler/icons-react'
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
            icon: IconGridDots,
            urls: ['/'],
        },
    ],
}

export default dashboard
