import { useState, FormEvent } from "react"
import { GetServerSideProps } from 'next'
import { useAuth } from "../hooks/useAuth"
import { Container, Form } from "./styles"
import { withSSRGuest } from "../utils/withSSRGuest"

export default function Home() {
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = {
      email,
      password
    }

    await signIn(data)
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <span>E-mail</span>
        <input 
          type="email" 
          onChange={e => setEmail(e.target.value)} 
          value={email} 
        />

        <span>Senha</span>
        <input 
          type="password" 
          onChange={e => setPassword(e.target.value)} 
          value={password} 
        />

        <button type='submit'>Entrar</button>
      </Form>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps = withSSRGuest(async (ctx) => {
    return {
      props: {}
    }
  }
)