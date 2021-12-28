import { GetServerSideProps } from "next"
import { setupAPIClient } from "../services/setupAPICLient"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard(){

    return (
        <h1>Metrics</h1>
    )
}

export const getServerSideProps: GetServerSideProps =  withSSRAuth(async (ctx) => {
    const apiClient =  setupAPIClient(ctx)
   
    const users = await apiClient.get('/me')

    return {
        props: {}
    }
},{ permissions: ['metrics.list'] })