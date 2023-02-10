import {
    AutocompleteItem,
    Button,
    Grid,
    SelectItem,
    Skeleton,
    Text,
} from '@mantine/core'
import {
    DatePicker,
    FormAutoComplete,
    FormInputNumber,
    FormSelect,
} from '../../../components'
import { Fetch, useAuth } from '../../../services'
import { ProductionFormProvider, useProductionForm } from './context'
import React, { useEffect, useState } from 'react'

import { isNotEmpty } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface ProductionInterface {
    createdAt: Date
    fgId: string
    quantity: number
    soId: string
    customerId: string
}

const Production = () => {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [finishedGood, setFinishedGood] = useState<AutocompleteItem[]>([])
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [salesOrder, setSalesOrder] = useState<SelectItem[]>([])

    let initialValues: ProductionInterface = {
        fgId: '',
        soId: '',
        quantity: 0,
        customerId: '',
        createdAt: new Date(),
    }

    const form = useProductionForm({
        initialValues,
        validate: {
            soId: isNotEmpty(),
            fgId: isNotEmpty(),
            customerId: isNotEmpty(),
            quantity: (value) =>
                value <= 0 ? 'Quantity should be more than 0' : null,
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
                url: '/outwards/production',
                options: {
                    method: 'POST',
                    body: {
                        ...form.values,
                        createdAt: form.values.createdAt.toISOString(),
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
                        Succesfully created new record with ID - {resp[0].id}
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
            }).then((data) => data.map((d: { id: string }) => d.id))
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
        <ProductionFormProvider form={form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <Grid>
                    <FormSelect
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
                        xs={6}
                        label="Sales Order"
                        placeholder="Select Sales Order"
                        data={salesOrder}
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
                        placeholder="Select Finished Good"
                        data={finishedGood}
                        withAsterisk
                        {...form.getInputProps('fgId')}
                    />
                    <FormInputNumber
                        name="quantity"
                        xs={4}
                        label="Quantity"
                        placeholder="Enter Quantity"
                        min={0}
                        withAsterisk
                        {...form.getInputProps('quantity')}
                    />
                    <DatePicker
                        xs={2}
                        label="Date"
                        placeholder="Enter Date"
                        withAsterisk
                        {...form.getInputProps('createdAt')}
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
                            onClick={() => {
                                const result = form.validate()
                                if (!result.hasErrors) {
                                    openModal()
                                }
                            }}
                        >
                            Create
                        </Button>
                    </Grid.Col>
                </Grid>
            </form>
        </ProductionFormProvider>
    )
}

export default Production
