import { useTheme } from '@mui/material/styles'
import { AppBar, Box, IconButton, Toolbar, useMediaQuery } from '@mui/material'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined'

import AppBarStyled from './AppBarStyled'
import Profile from './HeaderProfile'

interface HeaderInterface {
    open: boolean
    handleDrawerToggle: () => void
}

const Header = ({ open, handleDrawerToggle }: HeaderInterface) => {
    const theme = useTheme()
    const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'))

    const iconBackColor = 'grey.100'
    const iconBackColorOpen = 'grey.200'

    const mainHeader = (
        <Toolbar>
            <IconButton
                disableRipple
                aria-label="open drawer"
                onClick={handleDrawerToggle}
                edge="start"
                color="secondary"
                sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor, ml: { xs: 0, lg: -2 } }}
            >
                {!open ? <MenuOutlinedIcon /> : <MenuOpenOutlinedIcon />}
            </IconButton>
            <Box sx={{ width: '100%', ml: 1 }} />
            <Profile />
        </Toolbar>
    )

    const appBar = {
        elevation: 0,
        sx: {
            borderBottom: `1px solid ${theme.palette.divider}`
        }
    }

    return (
        <>
            {!matchDownMD ? (
                <AppBarStyled open={open} theme={theme} {...appBar}>
                    {mainHeader}
                </AppBarStyled>
            ) : (
                <AppBar {...appBar}>{mainHeader}</AppBar>
            )}
        </>
    )
}

export default Header