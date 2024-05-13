import { ItemInterface } from '.'

const others: ItemInterface[] = [
    {
        id: 'group-buldupdate',
        title: 'Bulk Update',
        type: 'item',
        url: '/bulkUpdate',
        urls: ['/bulkUpdate'],
        allowedTypes: ['ppc'],
    },
    {
        id: 'group-delete',
        title: 'Delete Entries',
        type: 'item',
        url: '/delete',
        urls: ['/delete'],
        onlyAdmin: true,
    }
]

export default others
