import { Box, Progress } from '@mantine/core'

const Loader = () => (
    <Box
        sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 2001,
            width: '100%',
            '& > * + *': {
                marginTop: 1,
            },
        }}
    >
        <Progress value={50} size={4} />
    </Box>
)

export default Loader
