import {
    ActionIcon,
    Box,
    Group,
    Text,
    rem,
    useMantineTheme,
} from '@mantine/core'

import { IconLogout } from '@tabler/icons-react'
import React from 'react'
import { useAuth } from '../services'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
    const theme = useMantineTheme()
    const { token, removeToken } = useAuth()
    const navigate = useNavigate()

    return (
        <Box
            sx={{
                paddingTop: theme.spacing.sm,
                borderTop: `${rem(1)} solid ${
                    theme.colorScheme === 'dark'
                        ? theme.colors.dark[4]
                        : theme.colors.gray[2]
                }`,
            }}
        >
            <Group>
                <Box sx={{ flex: 1 }}>
                    <Text size="sm" weight={500}>
                        {token.user.name}
                    </Text>
                    <Text color="dimmed" size="xs">
                        {token.user.type}
                    </Text>
                </Box>
                <ActionIcon>
                    <IconLogout
                        onClick={() => {
                            removeToken()
                            navigate(0)
                        }}
                    />
                </ActionIcon>
            </Group>
        </Box>
    )
}
