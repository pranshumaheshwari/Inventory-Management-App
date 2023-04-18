import { TablerIconsProps } from '@tabler/icons-react'
import dashboard from './dashboard'
import finishedgoods from './finishedgoods'
import manpower from './manpower'
import others from './others'
import rawmaterial from './rawmaterial'

const menuItems: MenuItemsInterface = {
    items: [dashboard, rawmaterial, finishedgoods, manpower, ...others],
}

export default menuItems

export interface ItemInterface {
    id: string
    title: string
    type: 'item' | 'group'
    children?: ItemInterface[]
    icon?: (props: TablerIconsProps) => JSX.Element
    url?: string
    disabled?: boolean
    urls?: string[]
    allowedTypes?: string[]
}

export interface MenuItemsInterface {
    items: ItemInterface[]
}
