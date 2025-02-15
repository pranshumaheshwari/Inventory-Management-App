import { Button, Grid, SelectItem, Skeleton, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormInputNumber, FormSelect } from '../../../components'
import React, { useEffect, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'

import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface OutwardsQualityCheck {
    customerId: string
    soId: string
    fgId: string
    quantity: number
    acceptedquantity: number
    rejectedQuantity: number
    productionId: string
}

const QualityCheck = () => {
    const {
        token: { token },
    } = useAuth()
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [salesorder, setSalesOrder] = useState<SelectItem[]>([])
    const [finishedGoods, setFinishedGoods] = useState<SelectItem[]>([])
    const [error, setError] = useState('')
    let initialValues: OutwardsQualityCheck = {
        customerId: '',
        soId: '',
        fgId: '',
        productionId: '',
        acceptedquantity: 0,
        rejectedQuantity: 0,
        quantity: 0,
    }

    const form = useForm({
        initialValues,
        validate: {
            soId: isNotEmpty(),
            fgId: isNotEmpty(),
            customerId: isNotEmpty(),
            productionId: isNotEmpty(),
            acceptedquantity: (value) =>
                value < 0 ? 'Quantity should be more than 0' : null,
            rejectedQuantity: (value) =>
                value < 0 ? 'Quantity should be more than 0' : null,
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
        await Promise.all([
            ...(form.values.acceptedquantity ? [acceptOqc()] : []),
            ...(form.values.rejectedQuantity ? [rejectOqc()] : []),
        ])
            .then(() => {
                showNotification({
                    title: 'Success',
                    message: <Text>Succesfully submitted OQC</Text>,
                    color: 'green',
                })
                setError('')
                form.reset()
                setFinishedGoods([])
                setSalesOrder([])
            })
            .catch((err) => {
                setError((err as Error).message)
                showNotification({
                    title: 'Error',
                    message: <Text>{(err as Error).message}</Text>,
                    color: 'red',
                })
            })
    }

    const rejectOqc = async () => {
        return Fetch({
            url: '/outwards/oqc/reject',
            options: {
                authToken: token,
                method: 'POST',
                body: {
                    ...form.values,
                    productionId: parseInt(form.values.productionId),
                },
            },
        })
    }

    const acceptOqc = async () => {
        return Fetch({
            url: '/outwards/oqc/accept',
            options: {
                authToken: token,
                method: 'POST',
                body: {
                    ...form.values,
                    productionId: parseInt(form.values.productionId),
                },
            },
        })
    }

    const getCustomer = async () => {
        try {
            const data = await Fetch({
                url: '/outwards/production',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            status: 'PendingOqcVerification',
                        }),
                        select: JSON.stringify({
                            so: {
                                select: {
                                    customer: {
                                        select: {
                                            name: true,
                                            id: true,
                                        },
                                    },
                                },
                            },
                        }),
                    },
                },
            }).then((data) => {
                return data.map(
                    (customer: {
                        so: {
                            customer: { name: string; id: string }
                        }
                    }) => ({
                        label: customer.so.customer.name,
                        value: customer.so.customer.id,
                    })
                )
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
                            status: 'Open',
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
                            quantity: true,
                            createdAt: true,
                            fg: {
                                select: {
                                    id: true,
                                    category: true,
                                    description: true,
                                },
                            },
                        }),
                    },
                },
            }).then(
                (
                    data: {
                        id: number
                        quantity: number
                        createdAt: string
                        fg: {
                            id: string
                            description: string
                            category: string
                        }
                    }[]
                ) =>
                    data
                        .map((d) => ({
                            value: d.fg.id,
                            label: d.fg.description,
                            group: d.fg.category,
                            productionId: d.id,
                            quantity: d.quantity,
                            acceptedQuantity: d.quantity,
                            rejectedQuantity: 0,
                            createdAt: d.createdAt,
                            fgId: d.fg.id,
                        }))
                        .sort((a, b) => b.productionId - a.productionId)
            )
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
                <FormSelect
                    xs={4}
                    id="fgId"
                    label="Finished Good"
                    placeholder="Select Finished Good"
                    data={[...new Set(finishedGoods.map((item) => item.value))]}
                    withAsterisk
                    {...form.getInputProps('fgId')}
                />
                <FormSelect
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
                                value: item.productionId.toString(),
                                label: item.productionId.toString(),
                            })),
                    ]}
                    withAsterisk
                    {...form.getInputProps('productionId')}
                    onChange={(value) => {
                        if (value) {
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
                            form.setFieldValue(
                                'acceptedQuantity',
                                quantity[0].quantity
                            )
                            form.setFieldValue('quantity', quantity[0].quantity)
                        }
                    }}
                />
                <FormInputNumber
                    name="acceptedQuantity"
                    xs={2}
                    label="Accepted Quantity"
                    placeholder="Enter Quantity"
                    min={0}
                    max={form.values.quantity}
                    withAsterisk
                    {...form.getInputProps('acceptedQuantity')}
                    onChange={(value) => {
                        if (value !== '') {
                            form.setFieldValue('acceptedquantity', value)
                            form.setFieldValue(
                                'rejectedQuantity',
                                form.values.quantity - value
                            )
                        }
                    }}
                    value={form.values.acceptedquantity}
                />
                <FormInputNumber
                    name="rejectedQuantity"
                    xs={2}
                    label="Rejected Quantity"
                    placeholder="Enter Quantity"
                    min={0}
                    max={form.values.quantity}
                    withAsterisk
                    {...form.getInputProps('rejectedQuantity')}
                    onChange={(value) => {
                        if (value !== '') {
                            form.setFieldValue('rejectedQuantity', value)
                            form.setFieldValue(
                                'acceptedquantity',
                                form.values.quantity - value
                            )
                        }
                    }}
                    value={form.values.rejectedQuantity}
                />
                {error && (
                    <Grid.Col xs={12}>
                        <Text c="red">{error}</Text>
                    </Grid.Col>
                )}
                {
                    <>
                        <Grid.Col xs={3} />
                        <Grid.Col xs={6}>
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
                                Submit
                            </Button>
                        </Grid.Col>
                        <Grid.Col xs={3} />
                    </>
                }
            </Grid>
        </form>
    )
}

export default QualityCheck
