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
        }
    ]
}

export default dashboard