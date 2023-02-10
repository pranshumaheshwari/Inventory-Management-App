import { Box, Card, Container, Grid } from '@mantine/core'

import { AuthForm } from './components'
import React from 'react'

interface LoginProps {}

const Login = (props: LoginProps) => {
    return (
        <Grid
            grow
            sx={{
                minHeight: '100vh',
            }}
            justify="center"
            align="center"
        >
            <Grid.Col>
                <Container
                    sx={{
                        maxWidth: 400,
                    }}
                >
                    <Card
                        sx={{
                            margin: 2.5,
                        }}
                        shadow="sm"
                    >
                        <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>
                            <AuthForm />
                        </Box>
                    </Card>
                </Container>
            </Grid.Col>
        </Grid>
    )
}

export default Login
