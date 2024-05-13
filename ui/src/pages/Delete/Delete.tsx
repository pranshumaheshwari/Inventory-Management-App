import React from 'react'
import { Button, Grid, Text } from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

import { Fetch, useAuth } from '../../services'
import { FormInputText, FormSelect } from '../../components'

interface DeleteInterface {
    path: string
    id: string
}

export default function Delete() {
    const {
        token: { token },
    } = useAuth()
    const initialValues: DeleteInterface = {
        path: "",
        id: ""
    }
    const form = useForm({
        initialValues,
        validate: {
            path: isNotEmpty(),
            id: isNotEmpty(),
        },
    })
    const openModal = () =>
        openConfirmModal({
            title: 'Please confirm your action',
            centered: true,
            children: <Text size="sm">Are you sure you want to proceed</Text>,
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: onSubmit,
            confirmProps: {
                color: "red"
            }
        })

    const onSubmit = async () => {
        try {
            const resp = await Fetch({
                url: `/${form.values.path}/${form.values.id}`,
                options: {
                    method: 'DELETE',
                    authToken: token,
                },
            })
            form.reset()
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully created new attendance record with ID -{' '}
                        {resp.id}
                    </Text>
                ),
                color: 'red',
            })
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
            <Grid>
                <Grid.Col xs={3} />
                <FormSelect
                    xs={3}
                    name="path"
                    label="Type"
                    data={[
                        "attendance",
                        "outwards/production",
                    ]}
                    withAsterisk
                    {...form.getInputProps('path')}
                />
                <FormInputText
                    xs={3}
                    label="ID"
                    placeholder="Enter ID"
                    withAsterisk
                    {...form.getInputProps('id')}
                />
                <Grid.Col xs={3} />
                <Grid.Col xs={3} />
                <Grid.Col xs={6}>
                    <Button
                        fullWidth
                        size="md"
                        variant="filled"
                        color="red"
                        onClick={() => {
                            const result = form.validate()
                            if (!result.hasErrors) {
                                openModal()
                            }
                        }}
                    >
                        Submit
                    </Button>
                </Grid.Col>
                <Grid.Col xs={3} />
            </Grid>
        </form>
    )
}
