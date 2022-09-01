import { ChipProps } from '@mui/material';
import { ReactElement } from 'react';
import dashboard from './dashboard'
import rawmaterial from './rawmaterial'

const menuItems: MenuItemsInterface = {
    items: [dashboard, rawmaterial]
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
    chip?: ChipProps
}

export interface MenuItemsInterface {
    items: ItemInterface[] 
}