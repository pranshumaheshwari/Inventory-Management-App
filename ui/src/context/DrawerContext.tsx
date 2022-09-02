import { createContext } from "react";

interface drawerContextInterface {
    open: boolean;
    setOpen: (open: boolean) => void;
    selected: string;
    setSelected: (selected: string) => void;
}

const drawerContext = createContext<drawerContextInterface>({
    open: false,
    setOpen: (open) => {},
    selected: 'dashboard',
    setSelected: (selected) => {}
})
export default drawerContext