import './App.css'

import React, { useState } from 'react'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CustomTheme from './themes'
import { DrawerContext } from './context'
import { LocalizationProvider } from '@mui/x-date-pickers'
import Routes from './routes'
import { ScrollTop } from './components'

function App() {
    const [open, setOpen] = useState(false)
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <CustomTheme>
                <ScrollTop>
                    <DrawerContext.Provider value={{ open, setOpen }}>
                        <Routes />
                    </DrawerContext.Provider>
                </ScrollTop>
            </CustomTheme>
        </LocalizationProvider>
    )
}

export default App
