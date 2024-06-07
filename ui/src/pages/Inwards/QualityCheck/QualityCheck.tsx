import { Button, Divider, Grid, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormInputText, FormSelect, Table } from '../../../components'
import React, { useEffect, useMemo, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'

import { ColDef } from 'ag-grid-community'
import { RawMaterialInterface } from '../../RawMaterial/RawMaterial'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface InwardsQualityCheck {
    supplierId: string
    invoiceId: string
    details: {
        rmId: string
        description: string
        dtplCode: string
        quantity: number
        inwardsIQCPendingId: number
        acceptedQuantity: number
        rejectedQuantity: number
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

    const form = useForm({
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
            onConfirm: onSubmit,
        })

    const onSubmit = async () => {
        await Promise.all([
            ...form.values.details
                .filter((d) => d.rejectedQuantity > 0)
                .map((d) => {
                    return rejectIqc({
                        ...d,
                        quantity: d.rejectedQuantity,
                    })
                }),
            ...form.values.details
                .filter((d) => d.acceptedQuantity > 0)
                .map((d) => {
                    return acceptIqc({
                        ...d,
                        quantity: d.acceptedQuantity,
                    })
                }),
        ])
            .then(() => {
                showNotification({
                    title: 'Success',
                    message: (
                        <Text>
                            Succesfully verified Invoice {form.values.invoiceId}{' '}
                            against PO{' '}
                        </Text>
                    ),
                    color: 'green',
                })
                form.reset()
                setInvoice([])
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

    const rejectIqc = async (
        detail: InwardsQualityCheck['details'][number]
    ) => {
        return Fetch({
            url: '/inwards/rejectIQCs',
            options: {
                authToken: token,
                method: 'PUT',
                body: {
                    supplierId: form.values.supplierId,
                    invoiceId: form.values.invoiceId,
                    details: [detail],
                },
            },
        })
    }

    const acceptIqc = async (
        detail: InwardsQualityCheck['details'][number]
    ) => {
        return Fetch({
            url: '/inwards/acceptIQCs',
            options: {
                authToken: token,
                method: 'PUT',
                body: {
                    supplierId: form.values.supplierId,
                    invoiceId: form.values.invoiceId,
                    details: [detail],
                },
            },
        })
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
                const unique_supplier = new Set()
                return data
                    .map(
                        (supplier: {
                            inwardsPoPending: {
                                supplier: {
                                    name: string
                                    id: string
                                }
                            }
                        }) => ({
                            label: supplier.inwardsPoPending.supplier.name,
                            value: supplier.inwardsPoPending.supplier.id,
                        })
                    ).filter((d: {
                        value: string
                    }) => {
                        if (unique_supplier.has(d["value"])) {
                            return false
                        }
                        unique_supplier.add(d["value"])
                        return true
                    })
            }
            )
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
                    [...new Map(data.map((item: {
                        inwardsPoPending: {
                            invoiceId: string
                        }
                    }) =>
                        [item.inwardsPoPending.invoiceId, item])).values()]
                )
            setInvoice(data as {
                value: string
            }[])
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
                            rm: {
                                select: {
                                    id: true,
                                    description: true,
                                    dtplCode: true,
                                },
                            },
                            id: true,
                            quantity: true,
                        }),
                    },
                },
            }).then(
                (
                    data: {
                        id: number
                        quantity: number
                        rm: Pick<
                            RawMaterialInterface,
                            'id' | 'description' | 'dtplCode'
                        >
                    }[]
                ) =>
                    data.map((d) => ({
                        rmId: d.rm.id,
                        description: d.rm.description,
                        dtplCode: d.rm.dtplCode,
                        inwardsIQCPendingId: d.id,
                        quantity: d.quantity,
                        acceptedQuantity: d.quantity,
                        rejectedQuantity: 0,
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

    const detailsColumnDef = useMemo<
        ColDef<InwardsQualityCheck['details'][number]>[]
    >(
        () => [
            {
                field: 'rmId',
                headerName: 'Raw Material',
            },
            {
                headerName: 'DTPL Part Number',
                valueGetter: (params) => {
                    return form.values.details.find(
                        (rm) => rm.rmId === params.data?.rmId
                    )?.dtplCode
                },
            },
            {
                headerName: 'Description',
                valueGetter: (params) => {
                    return form.values.details.find(
                        (rm) => rm.rmId === params.data?.rmId
                    )?.description
                },
            },
            {
                field: 'quantity',
                headerName: 'Invoice Quantity',
                type: 'numberColumn',
            },
            {
                field: 'inwardsIQCPendingId',
                headerName: 'PO Inwards ID',
                type: 'numberColumn',
            },
            {
                field: 'acceptedQuantity',
                headerName: 'Accept Quantity',
                editable: true,
                valueParser: ({ newValue, data }) => {
                    const val = parseFloat(newValue)
                    if (val > data.quantity) {
                        return data.quantity
                    }
                    return val
                },
                onCellValueChanged: ({ newValue, data }) => {
                    form.setFieldValue(
                        `details.${form.values.details.findIndex(
                            (rm) => rm.rmId === data?.rmId
                        )}.rejectedQuantity`,
                        data.quantity - newValue
                    )
                },
                type: 'numberColumn',
            },
            {
                field: 'rejectedQuantity',
                headerName: 'Reject Quantity',
                editable: true,
                valueParser: ({ newValue, data }) => {
                    const val = parseFloat(newValue)
                    if (val > data.quantity) {
                        return data.quantity
                    }
                    return val
                },
                onCellValueChanged: ({ newValue, data }) => {
                    form.setFieldValue(
                        `details.${form.values.details.findIndex(
                            (rm) => rm.rmId === data?.rmId
                        )}.acceptedQuantity`,
                        data.quantity - newValue
                    )
                },
                type: 'numberColumn',
            },
            {
                headerName: '#',
                onCellClicked: ({ data }) => {
                    if (data) {
                        form.removeListItem(
                            'details',
                            form.values.details.findIndex(
                                (d) => d.rmId === data.rmId
                            )
                        )
                    }
                },
                cellRenderer: () => (
                    <Button fullWidth size="xs" variant="outline" color="red">
                        DELETE
                    </Button>
                ),
            },
        ],
        [form]
    )

    return (
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
                    data={supplier ? supplier : []}
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
                <Grid.Col xs={12}>
                    <Divider />
                </Grid.Col>
                <Grid.Col
                    xs={12}
                    style={{
                        height: '50vh',
                    }}
                >
                    <Table<InwardsQualityCheck['details'][number]>
                        fileName={form.values.invoiceId}
                        rowData={form.values.details}
                        columnDefs={detailsColumnDef}
                        pagination={false}
                    />
                </Grid.Col>
                {error && (
                    <Grid.Col xs={12}>
                        <Text c="red">{error}</Text>
                    </Grid.Col>
                )}
                {
                    <>
                        <Grid.Col xs={3} />
                        <Grid.Col xs={3}>
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
