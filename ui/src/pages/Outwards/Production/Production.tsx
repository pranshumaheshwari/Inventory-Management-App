import { Button, Grid, SelectItem, Skeleton, Text } from '@mantine/core'
import { DatePicker, FormInputNumber, FormSelect } from '../../../components'
import { Fetch, useAuth } from '../../../services'
import { FinishedGoodSelectFilter, FinishedGoodSelectItem } from '../../common'
import React, { useEffect, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'

import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface ProductionInterface {
    fgId: string
    quantity: number
    soId: string
}

const Production = () => {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [finishedGood, setFinishedGood] = useState<SelectItem[]>([])
    const [salesOrder, setSalesOrder] = useState<SelectItem[]>([])

    let initialValues: ProductionInterface = {
        fgId: '',
        soId: '',
        quantity: 0,
    }

    const form = useForm({
        initialValues,
        validate: {
            soId: isNotEmpty(),
            fgId: isNotEmpty(),
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

    const getFinishedGoods = async () => {
        try {
            const data = await Fetch({
                url: `/finishedgoods`,
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            description: true,
                            category: true,
                        }),
                    },
                },
            }).then((data) =>
                data.map(
                    (d: {
                        id: string
                        description: string
                        category: string
                    }) => ({
                        ...d,
                        value: d.id,
                        label: d.description,
                        group: d.category,
                    })
                )
            )
            setFinishedGood(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getSalesOrders = async (finishedGood: string) => {
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
                            soDetails: {
                                some: {
                                    fgId: finishedGood,
                                },
                            },
                            status: 'Open',
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
        getFinishedGoods()
    }, [])

    if (!finishedGood) {
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
                    xs={12}
                    id="fgId"
                    label="Finished Good"
                    placeholder="Select Finished Good"
                    data={finishedGood}
                    itemComponent={FinishedGoodSelectItem}
                    filter={FinishedGoodSelectFilter}
                    withAsterisk
                    {...form.getInputProps('fgId')}
                    onChange={(finishedGood) => {
                        if (finishedGood) {
                            form.setFieldValue('fgId', finishedGood)
                            getSalesOrders(finishedGood)
                        }
                    }}
                />
                <FormSelect
                    xs={7}
                    label="Sales Order"
                    placeholder="Select Sales Order"
                    data={salesOrder}
                    withAsterisk
                    {...form.getInputProps('soId')}
                />
                <FormInputNumber
                    name="quantity"
                    xs={5}
                    label="Quantity"
                    placeholder="Enter Quantity"
                    min={0}
                    withAsterisk
                    {...form.getInputProps('quantity')}
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
    )
}

export default Production
