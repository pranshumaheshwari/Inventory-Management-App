import { useMemo } from 'react'

import { useTheme } from '@mui/material/styles'
import { Box, Drawer, useMediaQuery } from '@mui/material'

import DrawerHeader from './DrawerHeader'
import DrawerContent from './DrawerContent'
import MiniDrawerStyled from './MiniDrawerStyled'

const drawerWidth = 260

const MainDrawer = ({ open, setOpen }: MainDrawerInterface) => {
    const theme = useTheme()
    const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'))

    const drawerContent = useMemo(() => <DrawerContent />, [])
    const drawerHeader = useMemo(() => <DrawerHeader open={open} />, [open])

    return (
        <Box component="nav" sx={{ flexShrink: { md: 0 }, zIndex: 1300 }} aria-label="mailbox folders">
            {!matchDownMD ? (
                <MiniDrawerStyled variant="permanent" open={open} theme={theme}>
                    {drawerHeader}
                    {drawerContent}
                </MiniDrawerStyled>
            ) : (
                <Drawer
                    anchor='left'
                    variant="temporary"
                    open={open}
                    onClose={() => setOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            borderRight: `1px solid ${theme.palette.divider}`,
                            backgroundImage: 'none',
                            boxShadow: 'inherit'
                        }
                    }}
                >
                    {drawerHeader}
                    {drawerContent}
                </Drawer>
            )}
        </Box>
    )
}

interface MainDrawerInterface {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default MainDrawer