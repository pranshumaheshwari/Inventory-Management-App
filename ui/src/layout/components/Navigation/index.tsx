import NavGroup from './NavGroup'
import NavItem from './NavItem'
import { ScrollArea } from '@mantine/core'
import menuItem from '../../../menu-items'
import { useAuth } from '../../../services'

const Navigation = () => {
    const {
        token: { user },
    } = useAuth()

    const navGroups = menuItem.items
        // .filter((item) => {
        //     if (
        //         user.type === 'admin' ||
        //         item.allowedTypes?.includes(user.type)
        //     ) {
        //         return true
        //     }
        //     return false
        // })
        .map((item) => {
            switch (item.type) {
                case 'group':
                    return <NavGroup key={item.id} item={item} />
                default:
                    return <NavItem key={item.id} item={item} />
            }
        })

    return (
        <ScrollArea sx={{ pt: 2 }} h="80vh">
            {navGroups}
        </ScrollArea>
    )
}

export default Navigation
