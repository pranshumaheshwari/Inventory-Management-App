import { IconGridDots } from '@tabler/icons-react'
import { ItemInterface } from '.'

const dashboard: ItemInterface = {
    id: 'group-dashboard',
    title: '',
    type: 'group',
    allowedTypes: ['hr', 'iqc', 'oqc', 'ppc'],
    children: [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/',
            icon: IconGridDots,
            urls: ['/'],
            allowedTypes: ['hr', 'iqc', 'oqc', 'ppc'],
        },
    ],
}

export default dashboard
