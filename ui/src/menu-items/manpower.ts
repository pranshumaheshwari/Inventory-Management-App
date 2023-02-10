import { IconChartBar, IconUserPlus } from '@tabler/icons-react'

import { ItemInterface } from '.'

const dashboard: ItemInterface = {
    id: 'group-manpower',
    title: 'Man Power',
    type: 'group',
    children: [
        {
            id: 'manpower-attendance',
            title: 'Attendance',
            type: 'item',
            url: '/manPower/attendance',
            icon: IconUserPlus,
            urls: ['/manPower/attendance'],
        },
        {
            id: 'manpower-report',
            title: 'Report',
            type: 'item',
            url: '/manPower/report',
            icon: IconChartBar,
            urls: ['/manPower/report'],
        },
    ],
}

export default dashboard
