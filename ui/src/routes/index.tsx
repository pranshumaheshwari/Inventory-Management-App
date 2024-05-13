import LoginRoutes from './LoginRoutes'
import MainRoutes, { AdminRoutes } from './MainRoutes'
import { useAuth } from '../services'
import { useRoutes } from 'react-router-dom'

export default function Routes() {
    const { token } = useAuth()
    if (!token) {
        return useRoutes([LoginRoutes]) // eslint-disable-line react-hooks/rules-of-hooks
    }
    return useRoutes([MainRoutes, token.user.type === "admin" ? AdminRoutes : {}]) // eslint-disable-line react-hooks/rules-of-hooks
}
