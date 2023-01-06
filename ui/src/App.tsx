import './App.css'

import { AlertContext, DrawerContext } from './context'
import React, { useState } from 'react'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { AlertColor } from '@mui/material/Alert'
import CustomTheme from './themes'
import { LocalizationProvider } from '@mui/x-date-pickers'
import Routes from './routes'
import { ScrollTop } from './components'

function App() {
    const [open, setOpen] = useState(false)
    const [alert, setAlert] = useState<{
        type: AlertColor
        children: React.ReactNode
    }>({
        type: 'success',
        children: null,
    })
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CustomTheme>
                <ScrollTop>
                    <DrawerContext.Provider value={{ open, setOpen }}>
                        <AlertContext.Provider
                            value={{
                                data: alert,
                                setAlert,
                            }}
                        >
                            <Routes />
                        </AlertContext.Provider>
                    </DrawerContext.Provider>
                </ScrollTop>
            </CustomTheme>
        </LocalizationProvider>
    )
}

export default App
