import { ModalsProvider } from '@mantine/modals'
import React from 'react'
import Routes from './routes'
import { ScrollTop } from './components'

function App() {
    return (
        <ModalsProvider>
            <ScrollTop>
                <Routes />
            </ScrollTop>
        </ModalsProvider>
    )
}

export default App
