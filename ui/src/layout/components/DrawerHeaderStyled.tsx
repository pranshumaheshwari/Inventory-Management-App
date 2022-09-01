import { styled } from '@mui/material/styles'
import { Box, BoxProps, Theme } from '@mui/material'

interface DrawerHeaderStyledInterface extends BoxProps {
    open: boolean;
    theme: Theme
}

const DrawerHeaderStyled = styled(Box, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }: DrawerHeaderStyledInterface) => ({
    ...theme.mixins.toolbar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: open ? 'flex-start' : 'center',
}))

export default DrawerHeaderStyled