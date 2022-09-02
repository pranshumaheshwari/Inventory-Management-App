import { Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { Box, Toolbar } from '@mui/material'

import { Drawer, Header } from './components'
import { DrawerContext } from '../context'
import { BreadCrumbs } from '../components'


const MainLayout = () => {
    const { open: drawerOpen, setOpen } = useContext(DrawerContext)
    const handleDrawerToggle = () => {
        setOpen(!drawerOpen)
    }

    return (
        <Box sx={{ display: 'flex', width: '100%' }}>
            <Header open={drawerOpen} handleDrawerToggle={handleDrawerToggle} />
            <Drawer open={drawerOpen} setOpen={setOpen} />
            <Box component="main" sx={{ width: '100%', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                <Toolbar />
                <BreadCrumbs />
                <Box width="100%" height="75vh" paddingTop={3}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}

export default MainLayout