import { Button, Grid, SelectItem, Skeleton, Text } from '@mantine/core'
import { DatePicker, FormInputNumber, FormSelect } from '../../../components'
import { Fetch, useAuth } from '../../../services'
import { FinishedGoodSelectFilter, FinishedGoodSelectItem } from '../../common'
import { NewRequisitionFormProvider, useNewRequisitionForm } from './context'
import React, { useEffect, useState } from 'react'

import { isNotEmpty } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface NewRequisitionInterface {
    date: Date
    fgId: string
    soId: string
    quantity: number
}

const NewRequisition = () => {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [finishedGood, setFinishedGood] = useState<SelectItem[]>([])
    const [salesOrder, setSalesOrder] = useState<{ value: string }[] | null>([])
    let initialValues: NewRequisitionInterface = {
        date: new Date(),
        soId: '',
        fgId: '',
        quantity: 0,
    }

    const form = useNewRequisitionForm({
        initialValues,
        validate: {
            fgId: isNotEmpty(),
            soId: isNotEmpty(),
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
            }).then((data) =>
                data.map((d: { id: string }) => ({ value: d.id, label: d.id }))
            )
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
        <NewRequisitionFormProvider form={form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <Grid justify="center" align="center" grow>
                    <FormSelect
                        xs={12}
                        id="fgId"
                        label="Finished Good"
                        data={finishedGood}
                        itemComponent={FinishedGoodSelectItem}
                        filter={FinishedGoodSelectFilter}
                        placeholder="Select Finished Good"
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
                        name="soId"
                        xs={6}
                        label="Sales Order"
                        placeholder="Select Sales Order"
                        data={salesOrder ? salesOrder : []}
                        withAsterisk
                        {...form.getInputProps('soId')}
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
        </NewRequisitionFormProvider>
    )
}

export default NewRequisition
