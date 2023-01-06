import { Box, SxProps } from '@mui/material'
import { BrowserView, MobileView } from 'react-device-detect'
import { alpha, styled } from '@mui/material/styles'

import { ReactElement } from 'react'
import SimpleBar from 'simplebar-react'

const RootStyle = styled(BrowserView)({
    flexGrow: 1,
    height: '100%',
    overflow: 'hidden',
})

const SimpleBarStyle = styled(SimpleBar)(({ theme }) => ({
    maxHeight: '100%',
    '& .simplebar-scrollbar': {
        '&:before': {
            backgroundColor: alpha(theme.palette.grey[500], 0.48),
        },
        '&.simplebar-visible:before': {
            opacity: 1,
        },
    },
    '& .simplebar-track.simplebar-vertical': {
        width: 10,
    },
    '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': {
        height: 6,
    },
    '& .simplebar-mask': {
        zIndex: 'inherit',
    },
}))

export default function SimpleBarScroll({
    children,
    sx,
    ...other
}: SimpleBarScrollInterface) {
    return (
        <>
            <RootStyle>
                <SimpleBarStyle
                    timeout={500}
                    clickOnTrack={false}
                    sx={sx}
                    {...other}
                >
                    {children}
                </SimpleBarStyle>
            </RootStyle>
            <MobileView>
                <Box sx={{ overflowX: 'auto', ...sx }} {...other}>
                    {children}
                </Box>
            </MobileView>
        </>
    )
}

interface SimpleBarScrollInterface {
    children: ReactElement
    sx: SxProps
}
