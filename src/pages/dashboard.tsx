import { GetServerSideProps } from "next"
import { useEffect } from "react"
import { Can } from "../components/Can"
import { useAuth } from "../hooks/useAuth"
import { api } from "../services/api"
import { setupAPIClient } from "../services/setupAPICLient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard(){

    const { signOut } = useAuth()

    useEffect(() => {
        api.get('/me')
        .then(response => console.log(response))
        .catch(error => console.log(error))
    },[])
    

    return (
        <>
            <h1>Dashboard</h1>

            <button onClick={signOut}>Logout</button>

            <Can permissions={['metrics.list']}>
                    <div>Metrics</div>
            </Can>
            
        </>
    )
}

export const getServerSideProps: GetServerSideProps =  withSSRAuth(async (ctx) => {
    const apiClient =  setupAPIClient(ctx)
   
    const users = await apiClient.get('/me')

    // console.log(users.data)

    return {
        props: {}
    }
})