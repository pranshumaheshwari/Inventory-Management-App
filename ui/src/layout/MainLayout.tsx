import { AppShell, Box } from '@mantine/core'
import { Header, Navbar } from './components'

import { BreadCrumbs } from '../components'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'

const MainLayout = () => {
    const [opened, setOpened] = useState(false)
    return (
        <AppShell
            navbarOffsetBreakpoint="sm"
            header={<Header opened={opened} setOpened={setOpened} />}
            navbar={<Navbar opened={opened} />}
        >
            <BreadCrumbs />
            <Box
                sx={{
                    width: '100%',
                    height: '75vh',
                    paddingTop: 30,
                }}
            >
                <Outlet />
            </Box>
        </AppShell>
    )
}

export default MainLayout
