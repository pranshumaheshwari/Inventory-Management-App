import { createContext } from "react";

interface drawerContextInterface {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const drawerContext = createContext<drawerContextInterface>({
    open: false,
    setOpen: (open) => {},
})
export default drawerContext