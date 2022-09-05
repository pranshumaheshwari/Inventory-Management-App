import dashboard from './dashboard'
import rawmaterial from './rawmaterial'
import finishedgoods from './finishedgoods'

const menuItems: MenuItemsInterface = {
    items: [dashboard, rawmaterial, finishedgoods]
}

export default menuItems

export interface ItemInterface {
    id: string;
    title: string;
    type: 'collapse' | 'item' | 'group';
    children?: ItemInterface[];
    url?: string;
    icon?: string
    disabled?: boolean;
    urls?: string[];
}

export interface MenuItemsInterface {
    items: ItemInterface[] 
}