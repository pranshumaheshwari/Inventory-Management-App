import {
    Burger,
    Header,
    MediaQuery,
    Title,
    useMantineTheme,
} from '@mantine/core'

import React from 'react'

interface HeaderInterface {
    opened: boolean
    setOpened: (fn: (o: boolean) => boolean) => void
}

const MHeader = ({ opened, setOpened }: HeaderInterface) => {
    const theme = useMantineTheme()
    return (
        <Header
            height={{ base: 50, md: 70 }}
            p="md"
            sx={{
                backgroundColor: theme.colors[theme.primaryColor][6],
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                }}
            >
                <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                    <Burger
                        opened={opened}
                        onClick={() => setOpened((o: boolean) => !o)}
                        size="sm"
                        color="white"
                        mr="xl"
                    />
                </MediaQuery>
                <Title
                    color="white"
                    fz="xl"
                    fw={700}
                    size={25}
                    ff="monospace"
                    sx={{ marginLeft: 10 }}
                >
                    IMS
                </Title>
            </div>
        </Header>
    )
}

export default MHeader
