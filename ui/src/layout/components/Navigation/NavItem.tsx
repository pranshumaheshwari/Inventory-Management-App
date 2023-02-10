import { useLocation, useNavigate } from 'react-router-dom'

import { ItemInterface } from '../../../menu-items'
import { NavLink } from '@mantine/core'

const NavItem = ({ item }: { item: ItemInterface }) => {
    const location = useLocation()
    const navigate = useNavigate()

    const isSelected = item.urls
        ? item.urls.indexOf(location.pathname) > -1
        : false

    return (
        <NavLink
            key={item.id}
            active={isSelected}
            label={item.title}
            icon={item.icon ? <item.icon /> : undefined}
            onClick={() => {
                if (item.url) {
                    navigate(item.url)
                }
            }}
        />
    )
}

export default NavItem
