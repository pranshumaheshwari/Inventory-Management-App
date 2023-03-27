import { Button, Divider, Grid, Skeleton, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormInputText, FormSelect } from '../../../components'
import {
    InwardsQualityCheckFormProvider,
    useInwardsQualityCheckForm,
} from './context'
import React, { useEffect, useState } from 'react'

import { isNotEmpty } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface InwardsQualityCheck {
    supplierId: string
    invoiceId: string
    details: {
        rmId: string
        quantity: number
        inwardsIQCPendingId: number
    }[]
}

const QualityCheck = () => {
    const {
        token: { token },
    } = useAuth()
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [invoice, setInvoice] = useState<{ value: string }[] | null>([])
    const [error, setError] = useState('')
    let initialValues: InwardsQualityCheck = {
        supplierId: '',
        invoiceId: '',
        details: [],
    }

    const form = useInwardsQualityCheckForm({
        initialValues,
        validate: {
            invoiceId: isNotEmpty(),
            supplierId: isNotEmpty(),
            details: (value) =>
                value.length === 0
                    ? 'Need atleast one raw material in inwards quality check'
                    : null,
        },
        validateInputOnChange: true,
    })

    const openModal = () =>
        openConfirmModal({
            title: 'Please confirm your action',
            centered: true,
            children: <Text size="sm">Are you sure you want to proceed</Text>,
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: acceptIqc,
        })

    const openRejectModal = () =>
        openConfirmModal({
            title: 'Delete this item',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to reject this item? This action is
                    destructive and irreversible. All data will be lost
                </Text>
            ),
            labels: { confirm: 'Reject', cancel: "No don't reject it" },
            confirmProps: { color: 'orange' },
            onConfirm: rejectIqc,
        })

    const rejectIqc = async () => {
        try {
            const resp = await Fetch({
                url: '/inwards/rejectIQCs',
                options: {
                    authToken: token,
                    method: 'PUT',
                    body: form.values,
                },
            })
            showNotification({
                title: 'Success',
                message: <Text>Rejected IQC check with ID - {resp[0].id}</Text>,
                color: 'orange',
            })
            form.reset()
            setInvoice([])
        } catch (err) {
            setError((err as Error).message)
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }

    const acceptIqc = async () => {
        try {
            const resp = await Fetch({
                url: '/inwards/acceptIQCs',
                options: {
                    authToken: token,
                    method: 'PUT',
                    body: form.values,
                },
            })
            showNotification({
                title: 'Success',
                message: <Text>Accepted IQC check with ID - {resp[0].id}</Text>,
                color: 'green',
            })
            form.reset()
            setInvoice([])
        } catch (err) {
            setError((err as Error).message)
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }

    const getSupplier = async () => {
        try {
            const data = await Fetch({
                url: '/inwards/iqc',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            status: 'PendingIqcVerification',
                        }),
                        select: JSON.stringify({
                            inwardsPoPending: {
                                select: {
                                    supplier: {
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
                    (supplier: {
                        inwardsPoPending: {
                            suplier: {
                                name: string
                                id: string
                            }
                        }
                    }) => ({
                        label: supplier.inwardsPoPending.suplier.name,
                        value: supplier.inwardsPoPending.suplier.id,
                    })
                )
            })
            setSupplier(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const updateInvoice = async (supplierId: string) => {
        try {
            const data = await Fetch({
                url: '/inwards/iqc',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            inwardsPoPending: {
                                supplierId,
                            },
                            status: 'PendingIqcVerification',
                        }),
                        select: JSON.stringify({
                            inwardsPoPending: {
                                select: {
                                    invoiceId: true,
                                },
                            },
                            id: true,
                        }),
                    },
                },
            })
                .then((data) => {
                    return data.map(
                        (invoice: {
                            inwardsPoPending: { invoiceId: string }
                        }) => ({
                            value: invoice.inwardsPoPending.invoiceId,
                            label: invoice.inwardsPoPending.invoiceId,
                            ...invoice,
                        })
                    )
                })
                .then((data) =>
                    data.filter(
                        (value: object, index: number, self: Array<object>) => {
                            return self.indexOf(value) === index
                        }
                    )
                )
            setInvoice(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getRawMaterials = async (invoiceId: string) => {
        try {
            const data = await Fetch({
                url: '/inwards/iqc',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            inwardsPoPending: {
                                supplierId: form.values.supplierId,
                                invoiceId: invoiceId,
                            },
                            status: 'PendingIqcVerification',
                        }),
                        select: JSON.stringify({
                            rmId: true,
                            id: true,
                            quantity: true,
                        }),
                    },
                },
            }).then((data: { id: number; rmId: string; quantity: number }[]) =>
                data.map((d) => ({
                    inwardsIQCPendingId: d.id,
                    rmId: d.rmId,
                    quantity: d.quantity,
                }))
            )
            form.setFieldValue('details', data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getSupplier()
    }, [])

    if (!supplier) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <InwardsQualityCheckFormProvider form={form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <Grid justify="center" align="center" grow>
                    <FormSelect
                        name="supplierId"
                        xs={5}
                        label="Supplier"
                        placeholder="Select Supplier"
                        data={supplier}
                        withAsterisk
                        {...form.getInputProps('supplierId')}
                        onChange={(value) => {
                            if (value) {
                                form.setFieldValue('supplierId', value)
                                updateInvoice(value)
                            }
                        }}
                    />
                    <FormSelect
                        name="invoiceId"
                        xs={5}
                        label="Invoice"
                        placeholder="Select Invoice"
                        data={invoice ? invoice : []}
                        withAsterisk
                        {...form.getInputProps('invoiceId')}
                        onChange={(value) => {
                            if (value) {
                                form.setFieldValue('invoiceId', value)
                                getRawMaterials(value)
                            }
                        }}
                    />
                    <FormInputText
                        name="status"
                        xs={2}
                        label="Status"
                        placeholder="Select Status"
                        defaultValue="Accepted"
                        disabled
                        withAsterisk
                        {...form.getInputProps('status')}
                    />
                    <>
                        <Grid.Col xs={12}>
                            <Divider />
                        </Grid.Col>
                        {form.values.details.length !== 0 && (
                            <Grid.Col xs={12}>
                                <Grid justify="center" align="center" grow>
                                    <Grid.Col xs={4}>
                                        <Text fz="lg">
                                            Raw Material Part Number
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col xs={4}>
                                        <Text fz="lg">Invoice Quantity</Text>
                                    </Grid.Col>
                                    <Grid.Col xs={4}>
                                        <Text fz="lg">PO Inwards ID</Text>
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                        )}
                        {form.values.details.map((item, index) => (
                            <Grid.Col xs={12} key={index}>
                                <Grid justify="center" align="center" grow>
                                    <FormInputText
                                        xs={4}
                                        {...form.getInputProps(
                                            `details.${index}.rmId`
                                        )}
                                        disabled
                                    />
                                    <FormInputText
                                        xs={4}
                                        {...form.getInputProps(
                                            `details.${index}.quantity`
                                        )}
                                        disabled
                                    />
                                    <FormInputText
                                        xs={4}
                                        {...form.getInputProps(
                                            `details.${index}.inwardsIQCPendingId`
                                        )}
                                        disabled
                                    />
                                </Grid>
                            </Grid.Col>
                        ))}
                    </>

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
                                    variant="filled"
                                    color="orange"
                                    onClick={() => {
                                        const result = form.validate()
                                        if (!result.hasErrors) {
                                            openRejectModal()
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
        </InwardsQualityCheckFormProvider>
    )
}

export default QualityCheck
