import {
    AutocompleteItem,
    Button,
    Grid,
    SelectItem,
    Skeleton,
    Text,
} from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import {
    FormAutoComplete,
    FormInputNumber,
    FormSelect,
} from '../../../components'
import { OutwardsQualtiyFormProvider, useOutwardsQualtiyForm } from './context'
import React, { useEffect, useState } from 'react'

import { isNotEmpty } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface OutwardsQualityCheck {
    customerId: string
    soId: string
    fgId: string
    quantity: number
    productionId: string
}

const QualityCheck = () => {
    const {
        token: { token },
    } = useAuth()
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [salesorder, setSalesOrder] = useState<SelectItem[]>([])
    const [finishedGoods, setFinishedGoods] = useState<AutocompleteItem[]>([])
    const [error, setError] = useState('')
    let initialValues: OutwardsQualityCheck = {
        customerId: '',
        soId: '',
        fgId: '',
        productionId: '',
        quantity: 0,
    }

    const form = useOutwardsQualtiyForm({
        initialValues,
        validate: {
            soId: isNotEmpty(),
            fgId: isNotEmpty(),
            customerId: isNotEmpty(),
            productionId: isNotEmpty(),
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
            onConfirm: acceptOqc,
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
            onConfirm: rejectOqc,
        })

    const rejectOqc = async () => {
        try {
            const resp = await Fetch({
                url: '/outwards/oqc/reject',
                options: {
                    authToken: token,
                    method: 'POST',
                    body: form.values,
                },
            })
            showNotification({
                title: 'Success',
                message: <Text>Rejected OQC check with ID - {resp[0].id}</Text>,
                color: 'orange',
            })
            form.reset()
            setSalesOrder([])
            setFinishedGoods([])
        } catch (err) {
            setError((err as Error).message)
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }

    const acceptOqc = async () => {
        try {
            const resp = await Fetch({
                url: '/outwards/oqc/accept',
                options: {
                    authToken: token,
                    method: 'POST',
                    body: form.values,
                },
            })
            showNotification({
                title: 'Success',
                message: <Text>Accepted OQC check with ID - {resp[0].id}</Text>,
                color: 'green',
            })
            form.reset()
            setFinishedGoods([])
            setSalesOrder([])
        } catch (err) {
            setError((err as Error).message)
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }

    const getCustomer = async () => {
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

    const updateSalesOrder = async (customerId: string) => {
        try {
            const data = await Fetch({
                url: '/salesorders',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            customerId,
                        }),
                        select: JSON.stringify({
                            id: true,
                        }),
                    },
                },
            }).then((data) =>
                data.map((salesOrder: { id: string }) => ({
                    value: salesOrder.id,
                    label: salesOrder.id,
                    ...salesOrder,
                }))
            )
            setSalesOrder(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getFinishedGoods = async (soId: string) => {
        try {
            const data = await Fetch({
                url: '/outwards/production',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            status: 'PendingOqcVerification',
                            soId,
                        }),
                        select: JSON.stringify({
                            id: true,
                            fgId: true,
                            quantity: true,
                            createdAt: true,
                        }),
                    },
                },
            }).then(
                (
                    data: {
                        id: number
                        fgId: string
                        quantity: number
                        createdAt: string
                    }[]
                ) =>
                    data
                        .map((d) => ({
                            value: d.fgId,
                            productionId: d.id,
                            fgId: d.fgId,
                            quantity: d.quantity,
                            createdAt: d.createdAt,
                        }))
                        .sort((a, b) => b.productionId - a.productionId)
            )
            console.log(data)
            setFinishedGoods(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getCustomer()
    }, [])

    if (!customer) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <OutwardsQualtiyFormProvider form={form}>
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
                                updateSalesOrder(value)
                            }
                        }}
                    />
                    <FormSelect
                        xs={6}
                        label="Sales Order"
                        placeholder="Select Sales Order"
                        data={salesorder}
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
                        xs={4}
                        id="fgId"
                        label="Finished Good"
                        placeholder="Select Finished Good"
                        data={finishedGoods}
                        withAsterisk
                        {...form.getInputProps('fgId')}
                    />
                    <FormAutoComplete
                        xs={4}
                        id="productionId"
                        label="Production ID"
                        placeholder="Select Production ID"
                        data={[
                            ...finishedGoods
                                .filter((item) => {
                                    if (form.values.fgId) {
                                        return item.fgId === form.values.fgId
                                    }
                                    return false
                                })
                                .map((item) => ({
                                    ...item,
                                    value: item.productionId.toString(),
                                })),
                        ]}
                        withAsterisk
                        {...form.getInputProps('productionId')}
                        onChange={(value) => {
                            form.setFieldValue('productionId', value)
                            const productionId = parseInt(value)
                            const quantity = finishedGoods.filter((item) => {
                                if (
                                    item.fgId === form.values.fgId &&
                                    item.productionId === productionId
                                ) {
                                    return true
                                }
                                return false
                            })
                            form.setFieldValue('quantity', quantity[0].quantity)
                        }}
                    />
                    <FormInputNumber
                        name="quantity"
                        xs={4}
                        label="Quantity"
                        placeholder="Enter Quantity"
                        min={0}
                        withAsterisk
                        {...form.getInputProps('quantity')}
                        disabled
                    />
                    {error && (
                        <Grid.Col xs={12}>
                            <Text c="red">{error}</Text>
                        </Grid.Col>
                    )}
                    {
                        <>
                            <Grid.Col xs={2}>
                                <Button
                                    fullWidth
                                    size="md"
                                    variant="outline"
                                    color="red"
                                    onClick={() => {
                                        const result = form.validate()
                                        if (!result.hasErrors) {
                                            openDeleteModal()
                                        }
                                    }}
                                >
                                    Reject
                                </Button>
                            </Grid.Col>
                            <Grid.Col xs={8} />
                            <Grid.Col xs={2}>
                                <Button
                                    fullWidth
                                    size="md"
                                    type="button"
                                    variant="filled"
                                    color="primary"
                                    onClick={() => {
                                        const result = form.validate()
                                        if (!result.hasErrors) {
                                            openModal()
                                        }
                                    }}
                                >
                                    Approve
                                </Button>
                            </Grid.Col>
                        </>
                    }
                </Grid>
            </form>
        </OutwardsQualtiyFormProvider>
    )
}

export default QualityCheck
