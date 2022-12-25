import { AlertContext, DrawerContext } from '../context'
import { Box, Toolbar } from '@mui/material'
import { Drawer, Header } from './components'

import Alert from '@mui/material/Alert'
import { BreadCrumbs } from '../components'
import CloseIcon from '@mui/icons-material/Close'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import { Outlet } from 'react-router-dom'
import { useContext } from 'react'

const MainLayout = () => {
    const { open: drawerOpen, setOpen } = useContext(DrawerContext)
    const {
        data: { type, children: alertChildern },
        setAlert,
    } = useContext(AlertContext)
    const handleDrawerToggle = () => {
        setOpen(!drawerOpen)
    }

    return (
        <Box sx={{ display: 'flex', width: '100%' }}>
            <Header open={drawerOpen} handleDrawerToggle={handleDrawerToggle} />
            <Drawer open={drawerOpen} setOpen={setOpen} />
            <Box
                component="main"
                sx={{ width: '100%', flexGrow: 1, p: { xs: 2, sm: 3 } }}
            >
                <Toolbar />
                <BreadCrumbs />
                <Collapse in={alertChildern ? true : false}>
                    <Alert
                        severity={type}
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setAlert({
                                        type: 'success',
                                        children: null,
                                    })
                                }}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                    >
                        {alertChildern}
                    </Alert>
                </Collapse>
                <Box width="100%" height="75vh" paddingTop={3}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}

export default MainLayout
