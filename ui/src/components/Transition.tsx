import { forwardRef, ReactElement } from 'react'

import { Fade, Box, Grow } from '@mui/material'


const Transitions = forwardRef(({ children, position, type, ...others } : TransitionsType, ref) => {
    if(!position) {
        position = 'top-left'
    }
    if(!type) {
        type = 'grow'
    }
    let positionSX = {
        transformOrigin: '0 0 0'
    }

    switch (position) {
        case 'top-right':
        case 'top':
        case 'bottom-left':
        case 'bottom-right':
        case 'bottom':
        case 'top-left':
        default:
            positionSX = {
                transformOrigin: '0 0 0'
            }
            break
    }

    return (
        <Box ref={ref}>
            {type === 'grow' && (
                <Grow {...others}>
                    <Box sx={positionSX}>{children}</Box>
                </Grow>
            )}
            {type === 'fade' && (
                <Fade
                    {...others}
                    timeout={{
                        appear: 0,
                        enter: 300,
                        exit: 150
                    }}
                >
                    <Box sx={positionSX}>{children}</Box>
                </Fade>
            )}
        </Box>
    )
})

type TransitionsType = {
    children: boolean | ReactElement,
    type?: 'grow' | 'fade' | 'collapse' | 'slide' | 'zoom',
    position?: 'top-left' | 'top-right' | 'top' | 'bottom-left' | 'bottom-right' | 'bottom'
}

export default Transitions