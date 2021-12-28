import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


export function useAuth() {
    const contextAuthData = useContext(AuthContext)

    return contextAuthData
}