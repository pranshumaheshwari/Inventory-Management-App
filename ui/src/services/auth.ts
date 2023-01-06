import { useState } from "react";

interface tokenInterface {
    token: string;
    user: {
        username: string;
        type: string;
        name: string;
    }
}

const AuthService = () => {
    const getToken = () => {
        const tokenString = localStorage.getItem('token');
        if (!tokenString) return ""
        const userToken = JSON.parse(tokenString);
        return userToken
    }
    const [token] = useState<tokenInterface>(getToken())
    const saveToken = (token: any) => {
        localStorage.setItem("token", JSON.stringify(token))
    }
    const removeToken = () => {
        localStorage.removeItem("token")
    }
    return {
        setToken: saveToken,
        token,
        removeToken
    }
}

export default AuthService
