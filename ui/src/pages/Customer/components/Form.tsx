import { Button, Center, Grid, Text } from '@mantine/core'
import { CustomerFormProvider, useCustomerForm } from './context'
import { Fetch, useAuth } from '../../../services'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { CustomerInterface } from '../Customers'
import { FormInputText } from '../../../components'
import { isNotEmpty } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

const Form = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isEdit = location.state ? true : false
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const initialValues = isEdit
        ? (location.state as CustomerInterface)
        : {
              id: '',
              name: '',
              address1: '',
              address2: '',
              city: '',
              state: '',
              gst: '',
          }
    const form = useCustomerForm({
        initialValues,
        validate: {
            id: isNotEmpty(),
            name: isNotEmpty(),
            city: isNotEmpty(),
            state: isNotEmpty(),
            gst: (value) =>
                value.length === 15 ? null : 'GST Number length should be 15',
        },
    })
    const openModal = () =>
        openConfirmModal({
            title: 'Please confirm your action',
            centered: true,
            children: <Text size="sm">Are you sure you want to proceed</Text>,
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: () => {
                onSubmit(form.values)
            },
        })

    const openDeleteModal = () =>
        openConfirmModal({
            title: 'Delete this item',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete this item? This action is
                    destructive and irreversible. All data will be lost
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: "No don't delete it" },
            confirmProps: { color: 'red' },
            onConfirm: onDelete,
        })
    const onSubmit = async (values: CustomerInterface) => {
        try {
            const resp = await Fetch({
                url:
                    '/customers' +
                    (isEdit
                        ? '/' +
                          encodeURIComponent(
                              (location.state as CustomerInterface).id
                          )
                        : ''),
                options: {
                    method: isEdit ? 'PUT' : 'POST',
                    body: values,
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully {isEdit ? 'edited' : 'created'} customer
                        with ID - {resp.id}
                    </Text>
                ),
                color: 'green',
            })
            navigate('..')
        } catch (err) {
            setError((err as Error).message)
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }
    const onDelete = async () => {
        try {
            const resp = await Fetch({
                url: `/customers/${encodeURIComponent(
                    (location.state as CustomerInterface).id
                )}`,
                options: {
                    method: 'DELETE',
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully deleted customer with ID - {resp.id}
                    </Text>
                ),
                color: 'orange',
            })
            navigate('..')
        } catch (e) {
            setError((e as Error).message)
        }
    }

    return (
        <CustomerFormProvider form={form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <Grid justify="center" align="center" grow>
                    <FormInputText
                        name="id"
                        xs={4}
                        type="text"
                        label="ID"
                        placeholder="Enter ID"
                        withAsterisk
                        {...form.getInputProps('id')}
                    />
                    <FormInputText
                        name="name"
                        xs={8}
                        type="text"
                        label="Name"
                        placeholder="Enter name"
                        withAsterisk
                        {...form.getInputProps('name')}
                    />
                    <FormInputText
                        name="address1"
                        xs={6}
                        type="text"
                        label="Address 1"
                        placeholder="Address 1"
                        {...form.getInputProps('address1')}
                    />
                    <FormInputText
                        name="address2"
                        xs={6}
                        type="text"
                        label="Address 2"
                        placeholder="Address 2"
                        {...form.getInputProps('address2')}
                    />
                    <FormInputText
                        name="city"
                        xs={4}
                        type="text"
                        label="City"
                        placeholder="City"
                        withAsterisk
                        {...form.getInputProps('city')}
                    />
                    <FormInputText
                        name="state"
                        xs={4}
                        type="text"
                        label="State"
                        placeholder="State"
                        withAsterisk
                        {...form.getInputProps('state')}
                    />
                    <FormInputText
                        name="gst"
                        xs={4}
                        type="text"
                        label="GST"
                        placeholder="GST"
                        withAsterisk
                        {...form.getInputProps('gst')}
                    />
                    {error && (
                        <Grid.Col xs={12}>
                            <Text c="red">{error}</Text>
                        </Grid.Col>
                    )}
                    <Grid.Col xs={12}>
                        <Button
                            fullWidth
                            size="xs"
                            type="submit"
                            variant="filled"
                            color="primary"
                            onClick={() => {
                                const result = form.validate()
                                if (!result.hasErrors) {
                                    openModal()
                                }
                            }}
                        >
                            {isEdit ? 'Update' : 'Create'}
                        </Button>
                    </Grid.Col>
                    {isEdit && (
                        <Grid.Col xs={12}>
                            <Center>
                                <Button
                                    size="xs"
                                    variant="filled"
                                    color="red"
                                    onClick={openDeleteModal}
                                >
                                    DELETE
                                </Button>
                            </Center>
                        </Grid.Col>
                    )}
                </Grid>
            </form>
        </CustomerFormProvider>
    )
}

export default Form
