import LoginRoutes from './LoginRoutes'
import MainRoutes from './MainRoutes'
import { useAuth } from '../services'
import { useRoutes } from 'react-router-dom'

export default function Routes() {
    const { token } = useAuth()
    if (!token) {
        return useRoutes([LoginRoutes]) // eslint-disable-line react-hooks/rules-of-hooks
    }
    return useRoutes([MainRoutes]) // eslint-disable-line react-hooks/rules-of-hooks
}
