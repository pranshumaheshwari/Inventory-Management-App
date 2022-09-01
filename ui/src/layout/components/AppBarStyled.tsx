import { styled, Theme } from '@mui/material/styles'
import AppBar, { AppBarProps } from '@mui/material/AppBar'

const drawerWidth = 260

interface AppBarStyledInterface extends AppBarProps {
    open: boolean;
    theme: Theme
}

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }: AppBarStyledInterface) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    })
}))

export default AppBarStyled