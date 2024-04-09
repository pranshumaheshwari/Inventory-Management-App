import { Button, Grid, Skeleton, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormSelect, Table } from '../../../components'
import React, { useEffect, useMemo, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'

import { ColDef } from 'ag-grid-community'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface RequisitionIssueInterface {
    requisitionId: number
    details: {
        requisitionId: number
        rmId: string
        description: string
        dtplCode: string
        quantity: number
        storeStock: number
        lineStock: number
        maxQuantity: number
        requisitionQuantity: number
        issuedQuantity: number
        excessQuantity: number
        pendingRequisitions: {
            issuedQuantity: number
            requisitionId: number
            quantity: number
            status: 'Open' | 'Closed'
        }[]
    }[]
}

const RequisitionIssue = () => {
    const {
        token: { token },
    } = useAuth()
    const [finishedGoods, setFinishedGoods] = useState<
        {
            value: string
            label: string
        }[]
    >([])
    const [error, setError] = useState('')
    let initialValues: RequisitionIssueInterface = {
        requisitionId: 0,
        details: [],
    }

    const form = useForm({
        initialValues,
        validate: {
            requisitionId: isNotEmpty(),
            details: (value) =>
                value.length === 0
                    ? 'Need atleast one raw material to issue'
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
        try {
            await Fetch({
                url: `/requisition/issueMany/${form.values.requisitionId}`,
                options: {
                    method: 'POST',
                    body: {
                        details: form.values.details
                    },
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Successfully issued against requisition -{' '}
                        {form.values.requisitionId}
                    </Text>
                ),
                color: 'green',
            })
            form.reset()
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
                url: '/requisition/details',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            requisition: {
                                select: {
                                    id: true,
                                    fgId: true,
                                    quantity: true,
                                },
                            },
                        }),
                        where: JSON.stringify({
                            status: 'Open',
                        }),
                    },
                },
            })
                .then(
                    (
                        data: {
                            requisition: {
                                fgId: string
                                id: number
                                quantity: number
                            }
                        }[]
                    ) =>
                        data.reduce(
                            (acc, curVal) => {
                                if (
                                    acc.findIndex(
                                        (d) => d.id === curVal.requisition.id
                                    ) === -1
                                ) {
                                    acc.push(curVal.requisition)
                                }
                                return acc
                            },
                            [] as {
                                fgId: string
                                id: number
                                quantity: number
                            }[]
                        )
                )
                .then((data) =>
                    data.reverse().map((requisition) => ({
                        label: `${requisition.id} - ${requisition.fgId} WITH QTY ${requisition.quantity}`,
                        value: requisition.id.toString(),
                    }))
                )
            setFinishedGoods(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getRawmaterial = async (requisitionId: number) => {
        try {
            const data = await Fetch({
                url: '/requisition/details',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            quantity: true,
                            rm: {
                                select: {
                                    id: true,
                                    category: true,
                                    description: true,
                                    dtplCode: true,
                                    storeStock: true,
                                    lineStock: true,
                                    excessOnLine: true,
                                    requisitionDetails: {
                                        select: {
                                            requisitionId: true,
                                            quantity: true,
                                            status: true,
                                        },
                                    },
                                    requisitionOutward: {
                                        select: {
                                            requisitionId: true,
                                            quantity: true,
                                        },
                                    },
                                },
                            },
                        }),
                        where: JSON.stringify({
                            requisitionId,
                        }),
                    },
                },
            }).then(
                (
                    data: {
                        quantity: number
                        rm: {
                            id: string
                            category: string
                            description: string
                            dtplCode: string
                            storeStock: number
                            lineStock: number
                            excessOnLine: number
                            requisitionDetails: {
                                requisitionId: number
                                quantity: number
                                status: 'Open' | 'Closed'
                            }[]
                            requisitionOutward: {
                                requisitionId: number
                                quantity: number
                            }[]
                        }
                    }[]
                ) =>
                    data.map((d) => ({
                        requisitionId: requisitionId,
                        rmCategory: d.rm.category,
                        rmId: d.rm.id,
                        description: d.rm.description,
                        dtplCode: d.rm.dtplCode,
                        storeStock: d.rm.storeStock,
                        lineStock: d.rm.lineStock,
                        requisitionQuantity: d.quantity,
                        excessQuantity: d.rm.excessOnLine || 0,
                        pendingRequisitions: d.rm.requisitionDetails
                            .filter((d) => d.status === 'Open')
                            .filter((d) => d.requisitionId !== requisitionId)
                            .map((req) => ({
                                ...req,
                                issuedQuantity: d.rm.requisitionOutward
                                    .filter(
                                        (r) =>
                                            r.requisitionId ===
                                            req.requisitionId
                                    )
                                    .reduce(
                                        (acc, curVal) => acc + curVal.quantity,
                                        0
                                    ),
                            })),
                        issuedQuantity: d.rm.requisitionOutward
                            .filter((r) => r.requisitionId === requisitionId)
                            .reduce((acc, curVal) => acc + curVal.quantity, 0),
                        maxQuantity:
                            (d.rm.excessOnLine || 0) +
                            d.rm.requisitionOutward.reduce(
                                (acc, curVal) => acc + curVal.quantity,
                                0
                            ) -
                            d.rm.requisitionDetails.reduce(
                                (acc, curVal) => acc + curVal.quantity,
                                0
                            ),
                        quantity: 0,
                    }))
                    .filter(d => d.issuedQuantity < d.requisitionQuantity)
            )
            form.setFieldValue('details', data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getFinishedGoods()
    }, [])

    const detailsColumnDef = useMemo<
        ColDef<RequisitionIssueInterface['details'][number]>[]
    >(
        () => [
            {
                field: 'rmId',
                headerName: 'Raw Material',
                width: 100,
            },
            {
                headerName: 'DTPL Part Number',
                valueGetter: (params) => {
                    return form.values.details.find(
                        (rm) => rm.rmId === params.data?.rmId
                    )?.dtplCode
                },
                width: 150,
            },
            {
                headerName: 'Description',
                valueGetter: (params) => {
                    return form.values.details.find(
                        (rm) => rm.rmId === params.data?.rmId
                    )?.description
                },
                width: 100,
            },
            {
                field: 'storeStock',
                headerName: 'Store Stock',
                type: 'numberColumn',
                width: 120,
            },
            {
                field: 'lineStock',
                headerName: 'Line Stock',
                type: 'numberColumn',
                width: 120,
            },
            {
                field: 'requisitionQuantity',
                headerName: 'Requisition Quantity',
                type: 'numberColumn',
                width: 120,
            },
            {
                field: 'issuedQuantity',
                headerName: 'Issued Quantity',
                type: 'numberColumn',
                width: 120,
            },
            {
                field: 'maxQuantity',
                headerName: 'Excess/Less Quantity',
                width: 120,
                type: 'numberColumn',
            },
            {
                field: 'excessQuantity',
                headerName: 'Excess Quantity',
                width: 120,
                type: 'numberColumn',
                hide: true,
            },
            {
                field: 'quantity',
                headerName: 'Quantity',
                editable: true,
                type: 'numberColumn',
                valueParser: ({ newValue, data }) => {
                    const val = parseFloat(newValue)
                    if (val < 0 || data.requisitionQuantity <= data.issuedQuantity || data.requisitionQuantity <= data.excessQuantity) {
                        return 0
                    }
                    return val
                },
                width: 120,
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
                width: 110,
            },
        ],
        [form]
    )

    if (!finishedGoods) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
            }}
        >
            <Grid justify="center" align="center" grow>
                <FormSelect
                    xs={12}
                    label="Requisition"
                    name="requisitionId"
                    placeholder="Select Requisition"
                    data={finishedGoods}
                    withAsterisk
                    {...form.getInputProps('requisitionId')}
                    value={form.values.requisitionId.toString()}
                    onChange={(value) => {
                        if (value) {
                            form.setFieldValue('requisitionId', parseInt(value))
                            getRawmaterial(parseInt(value))
                        }
                    }}
                />
                <Grid.Col xs={12}>
                    <Table<RequisitionIssueInterface['details'][number]>
                        fileName={form.values.requisitionId.toString()}
                        rowData={form.values.details}
                        columnDefs={detailsColumnDef}
                        pagination={false}
                        domLayout="print"
                    />
                </Grid.Col>
                {error && (
                    <Grid.Col xs={12}>
                        <Text c="red">{error}</Text>
                    </Grid.Col>
                )}
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
                        Issue
                    </Button>
                </Grid.Col>
            </Grid>
        </form>
    )
}

export default RequisitionIssue
