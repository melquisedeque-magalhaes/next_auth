import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from 'nookies'
import { signOut } from "../context/AuthContext";
import { AuthTokenError } from "./Errors/AuthTokenError";


let isRefreshing = false
let resquestFailudQueue = []

export function setupAPIClient(ctx = undefined) {
    let cookies = parseCookies(ctx)

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: cookies && `Bearer ${cookies['NextAuth:token']}`
        }
    })
    
    api.interceptors.response.use(response => {
        return response
    }, (error: AxiosError) => {
        if(error.response.status === 401){
            if(error.response.data?.code === 'token.expired'){
    
                // renovar token
                cookies = parseCookies(ctx)
    
                const { 'NextAuth:refreshToken': refreshTokenOld } = cookies
                const originalConfig = error.config
    
                if(!isRefreshing){
                    isRefreshing = true

                    console.log('refresh')
    
                    api.post('/refresh', {
                        refreshToken: refreshTokenOld
                    }).then(response => {
                        const { token, refreshToken } = response.data
        
                        setCookie(ctx, 'NextAuth:token', token, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/'
                        })
                        setCookie(ctx, 'NextAuth:refreshToken', refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/'
                        })
        
                        api.defaults.headers['Authorization'] = `Bearer ${token}`
    
                        resquestFailudQueue.forEach(request => request.onSuccess(token))
                        resquestFailudQueue = []
                    }).catch((err) => {
                        isRefreshing = false
                        resquestFailudQueue.forEach(request => request.onFailuded(err))
                        resquestFailudQueue = []
    
                        if(process.browser)
                            signOut()
                    
                    })
                    .finally(() => {
                        isRefreshing = false
                    })
                }
    
                
    
                return new Promise((resolve, reject) => {
                    resquestFailudQueue.push({
                        onSuccess: (token: string) => {
                            originalConfig.headers['Authorization']= `Bearer ${token}`
        
                            resolve(api(originalConfig))
                        },
        
                        onFailuded: (error: AxiosError) => {
                            reject(error)
                        }
                    })
                })
    
                
            }else {
                // deslogar user
                if(process.browser)
                    signOut()
                else 
                    return Promise.reject(new AuthTokenError())
            }
        }
    
        return Promise.reject(error)
    })

    return api
}

