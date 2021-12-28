import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { destroyCookie, parseCookies } from "nookies"
import decode from 'jwt-decode'
import { AuthTokenError } from "../services/Errors/AuthTokenError"
import { validateUserPermissions } from "./validateUserPermissions"

type withSSRAuthParams = {
    permissions?: string[]
    roles?: string[]
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: withSSRAuthParams) {

    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx)

        if(!cookies['NextAuth:token']){
            return {
                redirect: {
                    destination: '/',
                    permanent: false
                },
            }
        }

        if(options){
            const token = cookies['NextAuth:token']
        
            const user = decode<{ permissions: string[]; roles: string[]  }>(token)

            const { permissions, roles } = options

            const userHasPermissions = validateUserPermissions({ user, permissions, roles })

            if(!userHasPermissions){
                return{
                    redirect: {
                        destination: '/dashboard',
                        permanent: false
                    }
                }
            }
        }
        
        try{
            return await fn(ctx)
        }catch (error) {

            if(error instanceof AuthTokenError){
                destroyCookie(ctx, 'NextAuth:token')
                destroyCookie(ctx, 'NextAuth:refreshToken')
        
                return {
                    redirect: {
                        destination: '/',
                        permanent: false
                    }
                }
            }
         
        }
        
    }

}