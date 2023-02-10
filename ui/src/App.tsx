import { ModalsProvider } from '@mantine/modals'
import { NotificationsProvider } from '@mantine/notifications'
import React from 'react'
import Routes from './routes'
import { ScrollTop } from './components'

function App() {
    return (
        <NotificationsProvider>
            <ModalsProvider>
                <ScrollTop>
                    <Routes />
                </ScrollTop>
            </ModalsProvider>
        </NotificationsProvider>
    )
}

export default App
