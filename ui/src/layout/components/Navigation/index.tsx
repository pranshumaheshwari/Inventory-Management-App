import NavGroup from './NavGroup'
import NavItem from './NavItem'
import { ScrollArea } from '@mantine/core'
import menuItem from '../../../menu-items'

const Navigation = () => {
    const navGroups = menuItem.items.map((item) => {
        switch (item.type) {
            case 'group':
                return <NavGroup key={item.id} item={item} />
            default:
                return <NavItem key={item.id} item={item} />
        }
    })

    return <ScrollArea sx={{ pt: 2 }}>{navGroups}</ScrollArea>
}

export default Navigation
