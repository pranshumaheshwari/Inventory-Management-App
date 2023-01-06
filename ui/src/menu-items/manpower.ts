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
            icon: 'man_outlined',
        },
        {
            id: 'manpower-report',
            title: 'Report',
            type: 'item',
            url: '/manPower/report',
            icon: 'assessment_outlined',
        },
    ],
}

export default dashboard
