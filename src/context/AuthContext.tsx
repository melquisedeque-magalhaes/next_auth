import { createContext, ReactNode, useEffect, useState } from "react";
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { api } from "../services/api";

type AuthProviderProps = {
    children: ReactNode
}

type SignInCredentials = {
    email: string
    password: string
}

type AuthContextData = {
    signIn: (credentials: SignInCredentials) => Promise<void>
    signOut: () => void
    isAuthenticated: boolean
    user: User
}

type User = {
    email: string
    permissions: string[]
    roles: string[]
}

type UserResponse = {
    email?: string
    token: string
    refreshToken: string
    permissions: string[]
    roles: string[]
}

let authChannel: BroadcastChannel

export function signOut() {
    destroyCookie(undefined, 'NextAuth:token')
    destroyCookie(undefined, 'NextAuth:refreshToken')

    Router.push('/')

    authChannel.postMessage('signOut')
}

export const AuthContext = createContext({} as AuthContextData)



export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>(null)

    const isAuthenticated = !!user

    useEffect(() => {
        authChannel = new BroadcastChannel('auth-channel')

        authChannel.onmessage = (message) => {
            if(message.data === 'signOut')
                signOut()
        }

    },[])

    useEffect(() => {
        const { 'NextAuth:token': token } = parseCookies()

        if(token) {
            api.get<UserResponse>('/me').then(response => {
                const { email, permissions, roles} = response.data

                setUser({
                    email,
                    permissions,
                    roles
                })
            })
            .catch(() => {
                signOut()
            })
        }
    }, [])

    async function signIn({ email, password }: SignInCredentials) {  

        try {
            const response = await api.post<UserResponse>('/sessions', {
                email,
                password
            })
    
            const { permissions, refreshToken, roles, token } = response.data

            setCookie(undefined, 'NextAuth:token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            })
            setCookie(undefined, 'NextAuth:refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            })

            setUser({
                email,
                permissions,
                roles
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`

            Router.push('/dashboard')
        }catch(err) {
            console.log(err)
        }
        
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, signIn, user, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}