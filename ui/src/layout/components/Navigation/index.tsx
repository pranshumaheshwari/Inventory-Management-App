import { Box } from '@mantine/core'
import NavGroup from './NavGroup'
import { Title } from '@mantine/core'
import menuItem from '../../../menu-items'

const Navigation = () => {
    const navGroups = menuItem.items.map((item) => {
        switch (item.type) {
            case 'group':
                return <NavGroup key={item.id} item={item} />
            default:
                return (
                    <Title key={item.id} order={6} color="error" align="center">
                        Fix - Navigation Group
                    </Title>
                )
        }
    })

    return <Box sx={{ pt: 2 }}>{navGroups}</Box>
}

export default Navigation
