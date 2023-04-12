import { Button, Divider, Grid, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormInputText, FormSelect, Table } from '../../../components'
import React, { useEffect, useMemo, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'

import { ColDef } from 'ag-grid-community'
import { RawMaterialInterface } from '../../RawMaterial/RawMaterial'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface InwardsPurchaseOrderInterface {
    supplierId: string
    invoiceId: string
    poId: string
    details: {
        rmId: string
        description: string
        dtplCode: string
        quantity: number
        acceptedQuantity: number
        rejectedQuantity: number
        poPrice?: number
        poQuantity?: number
        poApprovedQuantity: number
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
              InwardsPoPending: {
                  status: string
                  rmId: string
                  quantity: number
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

    const form = useForm({
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
            onConfirm: onSubmit,
        })

    const onSubmit = async () => {
        await Promise.all([
            ...form.values.details
                .filter((d) => d.rejectedQuantity > 0)
                .map((d) => {
                    return rejectPo({
                        ...d,
                        quantity: d.rejectedQuantity,
                    })
                }),
            ...form.values.details
                .filter((d) => d.acceptedQuantity > 0)
                .map((d) => {
                    return acceptPo({
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
                setPo([])
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

    const rejectPo = async (
        detail: InwardsPurchaseOrderInterface['details'][number]
    ) => {
        return Fetch({
            url: '/inwards/rejectPO',
            options: {
                authToken: token,
                method: 'PUT',
                body: {
                    supplierId: form.values.supplierId,
                    invoiceId: form.values.invoiceId,
                    poId: form.values.poId,
                    details: [detail],
                },
            },
        })
    }

    const acceptPo = async (
        detail: InwardsPurchaseOrderInterface['details'][number]
    ) => {
        return Fetch({
            url: '/inwards/acceptPO',
            options: {
                authToken: token,
                method: 'PUT',
                body: {
                    supplierId: form.values.supplierId,
                    invoiceId: form.values.invoiceId,
                    poId: form.values.poId,
                    details: [detail],
                },
            },
        })
    }

    const getSupplier = async () => {
        try {
            const data = await Fetch({
                url: '/inwards/po',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            status: 'PendingPoVerification',
                        }),
                        select: JSON.stringify({
                            supplier: {
                                select: {
                                    name: true,
                                    id: true,
                                },
                            },
                        }),
                    },
                },
            }).then(
                (
                    data: {
                        supplier: { name: string; id: string }
                    }[]
                ) => {
                    return data
                        .filter(
                            (val, idx, arr) =>
                                arr.findIndex(
                                    (a) => a.supplier.id === val.supplier.id
                                ) === idx
                        )
                        .map((supplier) => ({
                            label: supplier.supplier.name,
                            value: supplier.supplier.id,
                        }))
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
                            status: 'Open',
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
                            InwardsPoPending: {
                                select: {
                                    rmId: true,
                                    quantity: true,
                                    status: true,
                                },
                            },
                        }),
                    },
                },
            }).then((data) => {
                return data.map((po: { id: string }) => ({
                    value: po.id,
                    label: po.id,
                    ...po,
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
                const details = form.values.details.map((d) => {
                    const poDetails = po
                        ?.find(({ id }) => id === form.values.poId)
                        ?.poDetails.find(({ rmId }) => rmId === d.rmId)
                    if (poDetails) {
                        return {
                            ...d,
                            poQuantity: poDetails.quantity,
                            poPrice: poDetails.price,
                            poApprovedQuantity:
                                po
                                    ?.find(({ id }) => id === form.values.poId)
                                    ?.InwardsPoPending.filter(
                                        (inwards) =>
                                            inwards.status === 'Accepted' &&
                                            inwards.rmId === d.rmId
                                    )
                                    .reduce(
                                        (qty, inwards) =>
                                            inwards.quantity + qty,
                                        0
                                    ) || 0,
                        }
                    }
                    return {
                        ...d,
                        poQuantity: 0,
                        poApprovedQuantity: 0,
                    }
                })
                form.setFieldValue('details', details)
            }
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getRawMaterials = async (invoiceId: string) => {
        try {
            const data = await Fetch({
                url: '/invoice',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            supplierId: form.values.supplierId,
                            id: invoiceId,
                        }),
                        select: JSON.stringify({
                            invoiceDetails: {
                                select: {
                                    rm: {
                                        select: {
                                            id: true,
                                            description: true,
                                            dtplCode: true,
                                        },
                                    },
                                    quantity: true,
                                },
                            },
                        }),
                    },
                },
            })
                .then((data) => data[0]['invoiceDetails'])
                .then(
                    async (
                        data: {
                            rm: Pick<
                                RawMaterialInterface,
                                'id' | 'description' | 'dtplCode'
                            >
                            quantity: number
                        }[]
                    ) => {
                        return data.map((d) => {
                            if (form.values.poId) {
                                const poDetails = po
                                    ?.find(({ id }) => id === form.values.poId)
                                    ?.poDetails.find(
                                        ({ rmId }) => rmId === d.rm.id
                                    )
                                if (poDetails) {
                                    return {
                                        rmId: d.rm.id,
                                        description: d.rm.description,
                                        dtplCode: d.rm.dtplCode,
                                        rejectedQuantity: 0,
                                        acceptedQuantity: d.quantity,
                                        quantity: d.quantity,
                                        poQuantity: poDetails.quantity,
                                        poPrice: poDetails.price,
                                        poApprovedQuantity:
                                            po
                                                ?.find(
                                                    ({ id }) =>
                                                        id === form.values.poId
                                                )
                                                ?.InwardsPoPending.filter(
                                                    (inwards) =>
                                                        inwards.status ===
                                                            'Accepted' &&
                                                        inwards.rmId === d.rm.id
                                                )
                                                .reduce(
                                                    (qty, inwards) =>
                                                        inwards.quantity + qty,
                                                    0
                                                ) || 0,
                                    }
                                }
                            }
                            return {
                                rmId: d.rm.id,
                                description: d.rm.description,
                                dtplCode: d.rm.dtplCode,
                                rejectedQuantity: 0,
                                quantity: d.quantity,
                                acceptedQuantity: d.quantity,
                                poQuantity: 0,
                                poApprovedQuantity: 0,
                            }
                        })
                    }
                )
            console.log(data)
            form.setFieldValue('details', data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getSupplier()
    }, [])

    const detailsColumnDef = useMemo<
        ColDef<InwardsPurchaseOrderInterface['details'][number]>[]
    >(
        () => [
            {
                headerName: '#',
                valueGetter: 'node.rowIndex + 1',
            },
            {
                field: 'rmId',
                headerName: 'Raw Material',
            },
            {
                field: 'Description',
                valueGetter: (params) => {
                    return form.values.details.find(
                        (rm) => rm.rmId === params.data?.rmId
                    )?.description
                },
            },
            {
                field: 'DTPL Part Number',
                valueGetter: (params) => {
                    return form.values.details.find(
                        (rm) => rm.rmId === params.data?.rmId
                    )?.dtplCode
                },
            },
            {
                field: 'quantity',
                headerName: 'Invoice Quantity',
                type: 'numberColumn',
            },
            {
                field: 'poQuantity',
                headerName: 'PO Quantity',
                type: 'numberColumn',
            },
            {
                field: 'poApprovedQuantity',
                headerName: 'PO Pending Quantity',
                type: 'numberColumn',
                valueGetter: ({ data }) => {
                    if (data && data.poQuantity) {
                        return data.poQuantity - data.poApprovedQuantity
                    }
                    return 0
                },
            },
            {
                field: 'poPrice',
                headerName: 'PO Price',
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
                field: '#',
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
                    xs={12}
                    label="Supplier"
                    placeholder="Select Supplier"
                    data={supplier ? supplier : []}
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
                            getRawMaterials(value)
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
                <Grid.Col xs={12}>
                    <Divider />
                </Grid.Col>
                <Grid.Col
                    xs={12}
                    style={{
                        height: '50vh',
                    }}
                >
                    <Table<InwardsPurchaseOrderInterface['details'][number]>
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
                        <Grid.Col xs={6}>
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

export default PurchaseOrder
