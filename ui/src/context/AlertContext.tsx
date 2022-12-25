import { AlertColor } from '@mui/material/Alert'
import { createContext } from 'react'

export interface alertType {
    type: AlertColor
    children: React.ReactNode
}

interface alertContextInterface {
    data: alertType
    setAlert: (data: alertType | ((prevState: alertType) => alertType)) => void
}

const alertContext = createContext<alertContextInterface>({
    data: {
        type: 'success',
        children: null,
    },
    setAlert: (data: alertType | ((prevState: alertType) => alertType)) => {},
})
export default alertContext
