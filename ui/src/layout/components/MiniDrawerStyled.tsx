import { Drawer, DrawerProps, Theme } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'

const drawerWidth = 310

const openedMixin = (theme: Theme) => ({
    width: drawerWidth,
    borderRight: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
    }),
    overflowX: 'hidden',
    boxShadow: 'none'
})

const closedMixin = (theme: Theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: 0,
    borderRight: 'none',
    boxShadow: `0px 2px 8px ${alpha(theme.palette.grey[900], 0.15)}`
})

interface MiniDrawerStyledInterface extends DrawerProps {
    open: boolean
    theme: Theme
}

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }: MiniDrawerStyledInterface) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        width: drawerWidth,
        borderRight: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        }),
        overflowX: 'hidden',
        boxShadow: 'none',
        '& .MuiDrawer-paper': openedMixin(theme)
    }),
    ...(!open && {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        overflowX: 'hidden',
        width: 0,
        borderRight: 'none',
        boxShadow: `0px 2px 8px ${alpha(theme.palette.grey[900], 0.15)}`,
        '& .MuiDrawer-paper': closedMixin(theme)
    })
}))

export default MiniDrawerStyled