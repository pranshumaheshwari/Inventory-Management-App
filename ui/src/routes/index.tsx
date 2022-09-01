import { useRoutes } from 'react-router-dom'
import { useAuth } from '../services'

import LoginRoutes from './LoginRoutes'
import MainRoutes from './MainRoutes'

export default function ThemeRoutes() {
    const { token } = useAuth()
    if (!token) {
        return useRoutes([LoginRoutes]) // eslint-disable-line react-hooks/rules-of-hooks
    }
    return useRoutes([MainRoutes]) // eslint-disable-line react-hooks/rules-of-hooks
}
