import { Outlet } from 'react-router-dom'

import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import { Drawer, Header } from './components'
import { useContext, useState } from 'react'
import { DrawerContext } from '../context'
import drawerContext from '../context/DrawerContext'


const MainLayout = () => {
    const theme = useTheme();
    const matchDownLG = useMediaQuery(theme.breakpoints.down('xl'));
    const { open: drawerOpen, setOpen } = useContext(drawerContext)
    const handleDrawerToggle = () => {
        setOpen(!drawerOpen)
    }

    return (
        <Box sx={{ display: 'flex', width: '100%' }}>
            <Header open={drawerOpen} handleDrawerToggle={handleDrawerToggle} />
            <Drawer open={drawerOpen} setOpen={setOpen} />
            <Box component="main" sx={{ width: '100%', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    )
}

export default MainLayout