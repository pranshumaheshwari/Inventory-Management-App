import { IconChartBar, IconUserPlus } from '@tabler/icons-react'

import { ItemInterface } from '.'

const manpower: ItemInterface = {
    id: 'group-manpower',
    title: 'Man Power',
    type: 'group',
    allowedTypes: ['hr', 'ppc'],
    children: [
        {
            id: 'manpower-attendance',
            title: 'Attendance',
            type: 'item',
            url: '/manPower/attendance',
            icon: IconUserPlus,
            urls: ['/manPower/attendance'],
            allowedTypes: ['hr', 'ppc'],
        },
        {
            id: 'manpower-report',
            title: 'Report',
            type: 'item',
            url: '/manPower/report',
            icon: IconChartBar,
            urls: ['/manPower/report'],
            allowedTypes: ['hr', 'ppc'],
        },
    ],
}

export default manpower
