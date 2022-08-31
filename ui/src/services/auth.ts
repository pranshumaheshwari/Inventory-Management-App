import { useState } from "react";

const AuthService = () => {
    const getToken = () => {
        const tokenString = localStorage.getItem('token');
        if (!tokenString) return ""
        const userToken = JSON.parse(tokenString);
        return userToken?.token
    }
    const [token, setToken] = useState<string>(getToken())
    const saveToken = (token: any) => {
        localStorage.setItem("token", JSON.stringify(token))
    }
    return {
        setToken: saveToken,
        token
    }
}

export default AuthService
