import { Button, Divider, Grid, Skeleton, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormInputText, FormSelect } from '../../../components'
import {
    InwardsPurchaseOrderFormProvider,
    useInwardsPurchaseOrderForm,
} from './context'
import React, { useEffect, useState } from 'react'

import { isNotEmpty } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface InwardsPurchaseOrderInterface {
    supplierId: string
    invoiceId: string
    poId: string
    details: {
        rmId: string
        quantity: number
        poPrice: number
        poQuantity: number
    }[]
}

const PurchaseOrder = () => {
    const {
        token: { token },
    } = useAuth()
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [invoice, setInvoice] = useState<{ value: string }[] | null>([])
    const [po, setPo] = useState<
        | {
              value: string
              id: string
              poDetails: {
                  rmId: string
                  quantity: number
                  price: number
              }[]
          }[]
        | null
    >([])
    const [error, setError] = useState('')
    let initialValues: InwardsPurchaseOrderInterface = {
        supplierId: '',
        invoiceId: '',
        poId: '',
        details: [],
    }

    const form = useInwardsPurchaseOrderForm({
        initialValues,
        validate: {
            invoiceId: isNotEmpty(),
            supplierId: isNotEmpty(),
            poId: isNotEmpty(),
            details: (value) =>
                value.length === 0
                    ? 'Need atleast one raw material in purchase order verification'
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
            onConfirm: acceptPo,
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
            onConfirm: rejectPo,
        })

    const rejectPo = async () => {
        if (form.isValid()) {
            try {
                const resp = await Fetch({
                    url: '/inwards/rejectPO',
                    options: {
                        authToken: token,
                        method: 'PUT',
                        body: form.values,
                    },
                })
                showNotification({
                    title: 'Success',
                    message: (
                        <Text>Rejected PO check with ID - {resp[0].id}</Text>
                    ),
                    color: 'orange',
                })
                form.reset()
                setPo([])
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
    }

    const acceptPo = async () => {
        if (form.isValid()) {
            try {
                const resp = await Fetch({
                    url: '/inwards/acceptPO',
                    options: {
                        authToken: token,
                        method: 'PUT',
                        body: form.values,
                    },
                })
                showNotification({
                    title: 'Success',
                    message: (
                        <Text>Accpected PO check with ID - {resp[0].id}</Text>
                    ),
                    color: 'green',
                })
                form.reset()
                setPo([])
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
    }

    const getSupplier = async () => {
        try {
            const data = await Fetch({
                url: '/suppliers',
                options: {
                    authToken: token,
                },
            }).then((data) => {
                return data.map((supplier: { name: string; id: string }) => ({
                    label: supplier.name,
                    value: supplier.id,
                }))
            })
            setSupplier(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const updateInvoice = async (supplierId: string) => {
        try {
            const data = await Fetch({
                url: '/inwards/po',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            supplierId,
                            status: 'PendingPoVerification',
                        }),
                        select: JSON.stringify({
                            invoiceId: true,
                            id: true,
                        }),
                        distinct: JSON.stringify(['invoiceId']),
                    },
                },
            }).then((data) => {
                return data.map((invoice: { invoiceId: string }) => ({
                    value: invoice.invoiceId,
                    label: invoice.invoiceId,
                    // ...invoice,
                }))
            })
            setInvoice(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const updatePo = async (supplierId: string) => {
        try {
            const data = await Fetch({
                url: '/purchaseorders',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            supplierId,
                        }),
                        select: JSON.stringify({
                            id: true,
                            poDetails: {
                                select: {
                                    rmId: true,
                                    quantity: true,
                                    price: true,
                                },
                            },
                        }),
                    },
                },
            }).then((data) => {
                return data.map((po: { id: string }) => ({
                    value: po.id,
                    label: po.id,
                    // ...po,
                }))
            })
            setPo(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const updateSupplier = async (supplierId: string) => {
        updateInvoice(supplierId)
        updatePo(supplierId)
    }

    const updatePoValues = async () => {
        try {
            if (form.values.invoiceId && form.values.details) {
                const details = await form.values.details.map((d) => {
                    const poDetails = po
                        ?.find(({ id }) => id === form.values.poId)
                        ?.poDetails.find(({ rmId }) => rmId === d.rmId)
                    if (poDetails) {
                        return {
                            ...d,
                            poQuantity: poDetails.quantity,
                            poPrice: poDetails.price,
                        }
                    }
                    return d
                })
                form.setFieldValue('details', details)
            }
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getRawMaterials = async () => {
        try {
            const data = await Fetch({
                url: '/invoice',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            supplierId: form.values.supplierId,
                            id: form.values.invoiceId,
                        }),
                        select: JSON.stringify({
                            invoiceDetails: {
                                select: {
                                    rmId: true,
                                    quantity: true,
                                },
                            },
                        }),
                    },
                },
            })
                .then((data) => {
                    console.log(data)
                    return data
                })
                .then((data) => data[0]['invoiceDetails'])
                .then(
                    async (data: InwardsPurchaseOrderInterface['details']) => {
                        return await data.map((d) => {
                            if (form.values.poId) {
                                const poDetails = po
                                    ?.find(({ id }) => id === form.values.poId)
                                    ?.poDetails.find(
                                        ({ rmId }) => rmId === d.rmId
                                    )
                                if (poDetails) {
                                    return {
                                        ...d,
                                        poQuantity: poDetails.quantity,
                                        poPrice: poDetails.price,
                                    }
                                }
                            }
                            return d
                        })
                    }
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
        <InwardsPurchaseOrderFormProvider form={form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <Grid justify="center" align="center" grow>
                    <FormSelect
                        name="supplierId"
                        xs={12}
                        label="Supplier"
                        placeholder="Select Supplier"
                        data={supplier}
                        withAsterisk
                        {...form.getInputProps('supplierId')}
                        onChange={(value) => {
                            if (value) {
                                form.setFieldValue('supplierId', value)
                                updateSupplier(value)
                            }
                        }}
                    />
                    <FormSelect
                        name="poId"
                        xs={5}
                        label="Purchase Order"
                        placeholder="Select Purchase Order"
                        data={po ? po : []}
                        withAsterisk
                        {...form.getInputProps('poId')}
                        onChange={(value) => {
                            if (value) {
                                form.setFieldValue('poId', value)
                                updatePoValues()
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
                                getRawMaterials()
                            }
                        }}
                    />
                    <FormInputText
                        name="status"
                        xs={2}
                        label="Status"
                        placeholder="Select Status"
                        defaultValue="IQC"
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
                                    <Grid.Col xs={3}>
                                        <Text fz="lg">
                                            Raw Material Part Number
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col xs={3}>
                                        <Text fz="lg">Invoice Quantity</Text>
                                    </Grid.Col>
                                    <Grid.Col xs={3}>
                                        <Text fz="lg">PO Quantity</Text>
                                    </Grid.Col>
                                    <Grid.Col xs={3}>
                                        <Text fz="lg">PO Price</Text>
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                        )}
                        {form.values.details.map((item, index) => (
                            <Grid.Col xs={12} key={index}>
                                <Grid justify="center" align="center" grow>
                                    <FormInputText
                                        xs={3}
                                        {...form.getInputProps(
                                            `details.${index}.rmId`
                                        )}
                                        disabled
                                    />
                                    <FormInputText
                                        xs={3}
                                        {...form.getInputProps(
                                            `details.${index}.quantity`
                                        )}
                                        disabled
                                    />
                                    <FormInputText
                                        xs={3}
                                        {...form.getInputProps(
                                            `details.${index}.poQuantity`
                                        )}
                                        disabled
                                    />
                                    <FormInputText
                                        xs={3}
                                        {...form.getInputProps(
                                            `details.${index}.poPrice`
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
        </InwardsPurchaseOrderFormProvider>
    )
}

export default PurchaseOrder
