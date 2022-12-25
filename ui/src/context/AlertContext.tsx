import { AlertColor } from '@mui/material/Alert'
import { createContext } from 'react'

interface alertContextInterface {
    data: {
        type: AlertColor
        children: React.ReactNode
    }
    setAlert: (data: { type: AlertColor; children: React.ReactNode }) => void
}

const alertContext = createContext<alertContextInterface>({
    data: {
        type: 'success',
        children: null,
    },
    setAlert: (data) => {},
})
export default alertContext
