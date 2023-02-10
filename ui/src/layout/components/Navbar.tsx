import { Navbar } from '@mantine/core'
import Navigation from './Navigation'
import React from 'react'

interface NavbarInterface {
    opened: boolean
}

export default function MNavbar({ opened }: NavbarInterface) {
    return (
        <Navbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={!opened}
            width={{ sm: 200, lg: 300 }}
        >
            <Navigation />
        </Navbar>
    )
}
