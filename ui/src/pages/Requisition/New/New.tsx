import { AutocompleteItem, Button, Grid, Skeleton, Text } from '@mantine/core'
import {
    DatePicker,
    FormAutoComplete,
    FormInputNumber,
    FormSelect,
} from '../../../components'
import { Fetch, useAuth } from '../../../services'
import { NewRequisitionFormProvider, useNewRequisitionForm } from './context'
import React, { useEffect, useState } from 'react'

import { isNotEmpty } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface NewRequisitionInterface {
    date: Date
    fgId: string
    customerId: string
    soId: string
    quantity: number
}

const NewRequisition = () => {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [finishedGood, setFinishedGood] = useState<AutocompleteItem[]>([])
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [salesOrder, setSalesOrder] = useState<{ value: string }[] | null>([])
    let initialValues: NewRequisitionInterface = {
        date: new Date(),
        customerId: '',
        soId: '',
        fgId: '',
        quantity: 0,
    }

    const form = useNewRequisitionForm({
        initialValues,
        validate: {
            fgId: isNotEmpty(),
            soId: isNotEmpty(),
            customerId: isNotEmpty(),
            quantity: (value) =>
                value < 0 ? 'Quantity should be greater than 0' : null,
        },
        validateInputOnChange: true,
    })

    const openModal = () =>
        openConfirmModal({
            title: 'Please confirm your action',
            centered: true,
            children: <Text size="sm">Are you sure you want to proceed</Text>,
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: onSubmit,
        })

    const onSubmit = async () => {
        try {
            const resp = await Fetch({
                url: '/requisition',
                options: {
                    method: 'POST',
                    body: {
                        quantity: form.values.quantity,
                        fgId: form.values.fgId,
                        createAt: form.values.date.toISOString(),
                        soId: form.values.soId,
                    },
                    authToken: token,
                },
            })
            form.reset()
            setSalesOrder([])
            setFinishedGood([])
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully created new requisition record with ID -{' '}
                        {resp.id}
                    </Text>
                ),
                color: 'green',
            })
        } catch (err) {
            setError((err as Error).message)
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }

    const getCustomers = async () => {
        try {
            const data = await Fetch({
                url: '/customers',
                options: {
                    authToken: token,
                },
            }).then((data) => {
                return data.map((customer: { name: string; id: string }) => ({
                    label: customer.name,
                    value: customer.id,
                }))
            })
            setCustomer(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getFinishedGoods = async (soId: string) => {
        try {
            const data = await Fetch({
                url: `/salesorders/${soId}`,
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            fg: {
                                select: {
                                    id: true,
                                    description: true,
                                },
                            },
                        }),
                    },
                },
            }).then((data) =>
                data.map((d: { fg: { id: string; description: string } }) => ({
                    ...d.fg,
                    value: d.fg.id,
                    label: d.fg.description,
                }))
            )
            setFinishedGood(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getSalesOrders = async (customerId: string) => {
        try {
            const data = await Fetch({
                url: '/salesorders',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                        }),
                        where: JSON.stringify({
                            customerId,
                        }),
                    },
                },
            }).then((data) =>
                data.map((d: { id: string }) => ({ value: d.id, label: d.id }))
            )
            setSalesOrder(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getCustomers()
    }, [])

    if (!customer) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <NewRequisitionFormProvider form={form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <Grid justify="center" align="center" grow>
                    <FormSelect
                        name="customerId"
                        xs={6}
                        label="Customer"
                        placeholder="Select Customer"
                        data={customer}
                        withAsterisk
                        {...form.getInputProps('customerId')}
                        onChange={(value) => {
                            if (value) {
                                form.setFieldValue('customerId', value)
                                getSalesOrders(value)
                            }
                        }}
                    />
                    <FormSelect
                        name="soId"
                        xs={6}
                        label="Sales Order"
                        placeholder="Select Sales Order"
                        data={salesOrder ? salesOrder : []}
                        withAsterisk
                        {...form.getInputProps('soId')}
                        onChange={(value) => {
                            if (value) {
                                form.setFieldValue('soId', value)
                                getFinishedGoods(value)
                            }
                        }}
                    />
                    <FormAutoComplete
                        xs={6}
                        id="fgId"
                        label="Finished Good"
                        data={finishedGood}
                        placeholder="Select Finished Good"
                        withAsterisk
                        {...form.getInputProps('fgId')}
                    />
                    <FormInputNumber
                        name="quantity"
                        xs={3}
                        label="Quantity"
                        placeholder="Enter Quantity"
                        withAsterisk
                        min={0}
                        {...form.getInputProps('quantity')}
                    />
                    <DatePicker
                        xs={3}
                        name="date"
                        label="Date"
                        withAsterisk
                        {...form.getInputProps('date')}
                    />
                    {error && (
                        <Grid.Col xs={12}>
                            <Text c="red">{error}</Text>
                        </Grid.Col>
                    )}
                    <Grid.Col xs={12}>
                        <Button
                            fullWidth
                            size="md"
                            variant="filled"
                            color="primary"
                            onClick={openModal}
                        >
                            Create
                        </Button>
                    </Grid.Col>
                </Grid>
            </form>
        </NewRequisitionFormProvider>
    )
}

export default NewRequisition
