import { Button, Grid, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormInputText, FormPasswordInput } from '../../../components'
import { createFormContext, isNotEmpty, useForm } from '@mantine/form'

import React from 'react'
import { showNotification } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'

interface FormValues {
    username: string
    password: string
}

const LoginForm = () => {
    const navigate = useNavigate()
    const { setToken } = useAuth()
    const initialValues: FormValues = {
        password: '',
        username: '',
    }
    const form = useForm({
        initialValues,
        validate: {
            username: isNotEmpty(),
            password: isNotEmpty(),
        },
        validateInputOnChange: true,
    })
    const onSubmit = async () => {
        try {
            const token = await Fetch({
                url: '/login',
                options: {
                    method: 'POST',
                    body: form.values,
                },
            })
            setToken(token)
            navigate(0)
        } catch (err) {
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
            }}
        >
            <Grid grow>
                <FormInputText
                    xs={12}
                    label="Username"
                    placeholder="Enter username"
                    withAsterisk
                    {...form.getInputProps('username')}
                />
                <FormPasswordInput
                    xs={12}
                    label="Password"
                    placeholder="Enter password"
                    withAsterisk
                    {...form.getInputProps('password')}
                />
                <Grid.Col xs={12}>
                    <Button
                        fullWidth
                        variant="filled"
                        color="primary"
                        onClick={() => {
                            const result = form.validate()
                            if (!result.hasErrors) {
                                onSubmit()
                            }
                        }}
                    >
                        Login
                    </Button>
                </Grid.Col>
            </Grid>
        </form>
    )
}

export default LoginForm
