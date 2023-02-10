import { useLocation, useNavigate } from 'react-router-dom'

import { ItemInterface } from '../../../menu-items'
import NavItem from './NavItem'
import { NavLink } from '@mantine/core'

const NavGroup = ({ item }: { item: ItemInterface }) => {
    const location = useLocation()
    const navigate = useNavigate()

    const navCollapse = item.children?.map((menuItem) => {
        if (menuItem.type === 'item') {
            return <NavItem key={menuItem.id} item={menuItem} />
        } else {
            return <NavGroup key={menuItem.id} item={menuItem} />
        }
    })

    const calculateIsSelected = (item: ItemInterface): boolean => {
        let isSelected = false
        if (item.children) {
            for (let i of item.children) {
                if (i.type === 'group') {
                    isSelected = isSelected || calculateIsSelected(i)
                } else {
                    isSelected =
                        isSelected ||
                        (i.urls
                            ? i.urls.indexOf(location.pathname) > -1
                            : false)
                }
            }
        }

        return isSelected
    }

    const isSelected = calculateIsSelected(item)

    if (item.title) {
        return (
            <NavLink
                variant="subtle"
                active={isSelected}
                label={item.title}
                icon={item.icon ? <item.icon /> : undefined}
                childrenOffset={28}
                onClick={() => {
                    if (item.url) {
                        navigate(item.url)
                    }
                }}
                defaultOpened={isSelected}
            >
                {navCollapse}
            </NavLink>
        )
    } else {
        return <>{navCollapse}</>
    }
}

export default NavGroup
