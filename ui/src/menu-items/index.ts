import dashboard from './dashboard'
import finishedgoods from './finishedgoods'
import manpower from './manpower'
import rawmaterial from './rawmaterial'

const menuItems: MenuItemsInterface = {
    items: [dashboard, rawmaterial, finishedgoods, manpower]
}

export default menuItems

export interface ItemInterface {
    id: string;
    title: string;
    type: 'item' | 'group';
    children?: ItemInterface[];
    url?: string;
    icon?: string
    disabled?: boolean;
    urls?: string[];
}

export interface MenuItemsInterface {
    items: ItemInterface[] 
}