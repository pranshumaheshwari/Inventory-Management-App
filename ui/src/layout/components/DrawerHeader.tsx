import { useTheme } from '@mui/material/styles'
import { Stack, Chip, Typography } from '@mui/material'

import DrawerHeaderStyled from './DrawerHeaderStyled'

const DrawerHeader = ({ open }: { open: boolean }) => {
    const theme = useTheme()

    return (
        <DrawerHeaderStyled theme={theme} open={open}>
            <Stack direction="column" alignItems="center" width="100%">
                <Typography
                    fontSize={25}
                    alignItems="center"
                    justifyContent="center"
                    fontFamily="monospace"
                >
                    IMS
                </Typography>
            </Stack>
        </DrawerHeaderStyled>
    )
}

export default DrawerHeader