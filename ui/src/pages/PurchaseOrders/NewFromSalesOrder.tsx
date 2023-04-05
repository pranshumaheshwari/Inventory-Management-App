import {
    Button,
    Center,
    Grid,
    SelectItem,
    Skeleton,
    Stepper,
    Text,
} from '@mantine/core'
import { Fetch, useAuth } from '../../services'
import {
    FormInputNumber,
    FormInputText,
    FormMultiSelect,
    MonthPicker,
    Table,
} from '../../components'
import React, { useEffect, useMemo, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'

import { ColDef } from 'ag-grid-community'
import dayjs from 'dayjs'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'

interface PurchaseOrderFromSalesOrderInterface {
    salesOrders: string[]
    finishedGoods: {
        fgId: string
        quantity: number
    }[]
    month: Date
    rawMaterials: {
        description: string
        dtplCode: string
        supplierId: string
        rmId: string
        quantity: number
        poId: string
        price: number
        requirement: number
        stock: number
        mpq: number
        moq: number
        satisfiedRequirement: number
        poQuantity: number
    }[]
}

const EXTRA_QUANTITY = 1.25

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

const NewFromSalesOrder = () => {
    const {
        token: { token },
    } = useAuth()
    const navigate = useNavigate()
    const [activeStep, setActiveStep] = React.useState(0)
    const [error, setError] = useState('')
    const [salesOrder, setSalesOrder] = useState<SelectItem[]>()
    const form = useForm<PurchaseOrderFromSalesOrderInterface>({
        initialValues: {
            salesOrders: [],
            finishedGoods: [],
            rawMaterials: [],
            month: new Date(),
        },
        validate: {
            salesOrders: isNotEmpty(),
            finishedGoods: isNotEmpty(),
            rawMaterials: isNotEmpty(),
        },
        validateInputOnChange: true,
    })

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const getSalesOrders = async () => {
        try {
            const data = await Fetch({
                url: '/salesorders',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            customerId: true,
                        }),
                        where: JSON.stringify({
                            status: 'Open',
                        }),
                    },
                },
            }).then((data) => {
                return data.map((so: { id: string; customerId: string }) => ({
                    label: so.id,
                    value: so.id,
                    group: so.customerId,
                }))
            })
            setSalesOrder(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getFinsihedGoods = async (salesOrders: string[]) => {
        try {
            let data: PurchaseOrderFromSalesOrderInterface['finishedGoods'] = []
            Promise.all(
                salesOrders.map(async (salesOrder) => {
                    await Fetch({
                        url: `/salesorders/${encodeURIComponent(salesOrder)}`,
                        options: {
                            authToken: token,
                            params: {
                                select: JSON.stringify({
                                    fgId: true,
                                    quantity: true,
                                }),
                            },
                        },
                    }).then(
                        (
                            fgs: PurchaseOrderFromSalesOrderInterface['finishedGoods']
                        ) => {
                            for (let fg of fgs) {
                                const idx = data.findIndex(
                                    (d) => d.fgId === fg.fgId
                                )
                                if (idx !== -1) {
                                    data[idx].quantity += fg.quantity
                                } else {
                                    data.push(fg)
                                }
                            }
                        }
                    )
                })
            ).then(() => {
                form.setFieldValue('finishedGoods', data)
            })
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getRawMaterials = async (
        finishedGoods: PurchaseOrderFromSalesOrderInterface['finishedGoods']
    ) => {
        const intMonth = dayjs(form.values.month).month()
        const month = months[intMonth % 12]
        let data: PurchaseOrderFromSalesOrderInterface['rawMaterials'] = []
        Promise.all(
            finishedGoods.map(async (fg) => {
                await Fetch({
                    url: `/finishedgoods/${encodeURIComponent(fg.fgId)}`,
                    options: {
                        authToken: token,
                        params: {
                            select: JSON.stringify({
                                storeStock: true,
                                oqcPendingStock: true,
                                bom: {
                                    select: {
                                        rm: {
                                            select: {
                                                id: true,
                                                description: true,
                                                dtplCode: true,
                                                supplierId: true,
                                                storeStock: true,
                                                lineStock: true,
                                                iqcPendingStock: true,
                                                poPendingStock: true,
                                                price: true,
                                                mpq: true,
                                                moq: true,
                                                poDetails: true,
                                            },
                                        },
                                        quantity: true,
                                    },
                                },
                            }),
                        },
                    },
                })
                    .then(
                        (f: {
                            storeStock: number
                            oqcPendingStock: number
                            bom: {
                                quantity: number
                                rm: {
                                    id: string
                                    description: string
                                    dtplCode: string
                                    supplierId: string
                                    price: number
                                    storeStock: number
                                    lineStock: number
                                    iqcPendingStock: number
                                    poPendingStock: number
                                    mpq: number
                                    moq: number
                                    poDetails: {
                                        poId: string
                                        createdAt: string
                                    }[]
                                }
                            }[]
                        }) => {
                            for (let rm of f.bom) {
                                const idx = data.findIndex(
                                    (d) => d.rmId === rm.rm.id
                                )
                                if (idx !== -1) {
                                    data[idx].requirement +=
                                        rm.quantity * fg.quantity
                                    data[idx].satisfiedRequirement +=
                                        rm.quantity *
                                        (f.oqcPendingStock + f.storeStock)
                                } else {
                                    data.push({
                                        rmId: rm.rm.id,
                                        description: rm.rm.description,
                                        dtplCode: rm.rm.dtplCode,
                                        quantity: 0,
                                        poQuantity: 0,
                                        supplierId: rm.rm.supplierId,
                                        poId: `${rm.rm.supplierId}-${month}-${(
                                            '000' +
                                            (rm.rm.poDetails.filter(
                                                (po) =>
                                                    dayjs(
                                                        po.createdAt
                                                    ).month() === intMonth
                                            ).length +
                                                1)
                                        ).slice(-3)}`,
                                        price: rm.rm.price,
                                        requirement: rm.quantity * fg.quantity,
                                        stock:
                                            rm.rm.storeStock +
                                            rm.rm.lineStock +
                                            rm.rm.iqcPendingStock +
                                            rm.rm.poPendingStock,
                                        mpq: rm.rm.mpq,
                                        moq: rm.rm.moq,
                                        satisfiedRequirement:
                                            rm.quantity *
                                            (f.oqcPendingStock + f.storeStock),
                                    })
                                }
                            }
                        }
                    )
                    .then(() => {
                        for (let rm of data) {
                            rm.poQuantity =
                                Math.ceil(
                                    (rm.requirement * EXTRA_QUANTITY -
                                        rm.stock -
                                        rm.satisfiedRequirement) /
                                        rm.mpq
                                ) * rm.mpq
                        }
                    })
                    .then(() => {
                        data = data.filter((d) => d.poQuantity > 0)
                    })
                    .then(() => {
                        data = data.map((d) => ({
                            ...d,
                            poQuantity: Math.max(d.poQuantity, d.moq),
                        }))
                    })
            })
        ).then(() => {
            form.setFieldValue('rawMaterials', data)
        })
    }

    const onSubmit = async () => {
        await Promise.all(
            form.values.rawMaterials
                .filter((rm) => rm.quantity > 0)
                .map((v) => ({
                    poId: v.poId,
                    supplierId: v.supplierId,
                }))
                .filter(
                    (val, idx, arr) =>
                        arr.findIndex((item) => item.poId === val.poId) === idx
                )
                .map((po) =>
                    Fetch({
                        url: '/purchaseorders',
                        options: {
                            method: 'POST',
                            body: {
                                id: po.poId,
                                supplierId: po.supplierId,
                                poDetails: [],
                            },
                            authToken: token,
                        },
                    })
                )
        )
            .then(() => {
                Promise.all(
                    form.values.rawMaterials
                        .filter((rm) => rm.quantity > 0)
                        .map(async (rm) =>
                            Fetch({
                                url: '/purchaseorders/details',
                                options: {
                                    method: 'POST',
                                    body: rm,
                                    authToken: token,
                                },
                            })
                        )
                )
                    .then(() => {
                        showNotification({
                            title: 'Success',
                            message: <Text>Succesfully Purchase Orders</Text>,
                            color: 'green',
                        })

                        navigate('..')
                    })
                    .catch((err) => {})
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

    const openModal = () =>
        openConfirmModal({
            title: 'Please confirm your action',
            centered: true,
            children: <Text size="sm">Are you sure you want to proceed</Text>,
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: () => {
                onSubmit()
            },
        })

    useEffect(() => {
        Promise.all([getSalesOrders()])
    }, [])

    const detailsColumnDef = useMemo<
        ColDef<PurchaseOrderFromSalesOrderInterface['rawMaterials'][number]>[]
    >(
        () => [
            {
                field: 'rmId',
                headerName: 'Raw Material',
                pinned: 'left',
            },
            {
                field: 'description',
                headerName: 'Description',
            },
            {
                field: 'dtplCode',
                headerName: 'DTPL Part Number',
            },
            {
                field: 'supplierId',
                headerName: 'Supplier',
            },
            {
                field: 'poId',
                headerName: 'Purchase Order',
            },
            {
                field: 'requirement',
                headerName: 'Requirement',
                type: 'numberColumn',
            },
            {
                field: 'stock',
                headerName: 'Stock',
                type: 'numberColumn',
            },
            {
                field: 'poQuantity',
                headerName: 'PO Quantity',
                type: 'numberColumn',
            },
            {
                headerName: 'Final Quantity',
                field: 'quantity',
                editable: true,
                valueParser: ({ newValue }) => parseFloat(newValue),
                type: 'numberColumn',
            },
            {
                headerName: 'Price',
                field: 'price',
                editable: true,
                valueParser: ({ newValue }) => parseFloat(newValue),
                type: 'numberColumn',
            },
        ],
        [form]
    )

    if (!salesOrder) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
            }}
        >
            <Grid justify="center" align="center" grow>
                <Grid.Col xs={3} />
                <Grid.Col xs={6}>
                    <Stepper active={activeStep} onStepClick={setActiveStep}>
                        {[
                            'Select Sales Orders',
                            'Select Finished Goods',
                            'Select Raw Materials',
                        ].map((label, index) => {
                            return <Stepper.Step key={label} label={label} />
                        })}
                    </Stepper>
                </Grid.Col>
                <Grid.Col xs={3} />
                {activeStep === 0 && (
                    <>
                        <FormMultiSelect
                            xs={6}
                            data={salesOrder}
                            name="salesOrders"
                            label="Sales Orders"
                            placeholder="Select Sales Orders"
                            withAsterisk
                            {...form.getInputProps('salesOrders')}
                            onChange={(salesOrders) => {
                                form.setFieldValue('salesOrders', salesOrders)
                                getFinsihedGoods(salesOrders)
                            }}
                        />
                        <MonthPicker
                            label="Month"
                            xs={6}
                            {...form.getInputProps('month')}
                        />
                        <Grid.Col xs={12}>
                            <Button
                                fullWidth
                                size="md"
                                variant="filled"
                                color="primary"
                                disabled={form.values.salesOrders.length === 0}
                                onClick={handleNext}
                            >
                                Next
                            </Button>
                        </Grid.Col>
                    </>
                )}
                {activeStep === 1 && (
                    <>
                        {form.values.finishedGoods.length !== 0 && (
                            <Grid.Col xs={12}>
                                <Grid justify="center" align="center" grow>
                                    <Grid.Col xs={5}>
                                        <Center>
                                            <Text fz="lg">
                                                Finished Good Part Number
                                            </Text>
                                        </Center>
                                    </Grid.Col>
                                    <Grid.Col xs={5}>
                                        <Center>
                                            <Text fz="lg">Quantity</Text>
                                        </Center>
                                    </Grid.Col>
                                    <Grid.Col xs={2} />
                                </Grid>
                            </Grid.Col>
                        )}
                        {form.values.finishedGoods.map((item, index) => (
                            <Grid.Col xs={12} key={index}>
                                <Grid justify="center" align="center" grow>
                                    <FormInputText
                                        {...form.getInputProps(
                                            `finishedGoods.${index}.fgId`
                                        )}
                                        xs={5}
                                        disabled
                                    />
                                    <FormInputNumber
                                        {...form.getInputProps(
                                            `finishedGoods.${index}.quantity`
                                        )}
                                        disabled
                                        xs={5}
                                    />
                                    <Grid.Col xs={2}>
                                        <Button
                                            fullWidth
                                            size="xs"
                                            variant="outline"
                                            color="red"
                                            onClick={() => {
                                                form.removeListItem(
                                                    'finishedGoods',
                                                    index
                                                )
                                            }}
                                        >
                                            REMOVE
                                        </Button>
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                        ))}
                        <Grid.Col xs={2}>
                            <Button
                                fullWidth
                                size="md"
                                variant="default"
                                onClick={handleBack}
                            >
                                Back
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
                                    getRawMaterials(form.values.finishedGoods)
                                    handleNext()
                                }}
                            >
                                Next
                            </Button>
                        </Grid.Col>
                    </>
                )}
                {activeStep === 2 && (
                    <>
                        <Grid.Col
                            xs={12}
                            style={{
                                height: '60vh',
                            }}
                        >
                            <Table<
                                PurchaseOrderFromSalesOrderInterface['rawMaterials'][number]
                            >
                                rowData={form.values.rawMaterials}
                                columnDefs={detailsColumnDef}
                                pagination={false}
                            />
                        </Grid.Col>
                        <Grid.Col xs={2}>
                            <Button
                                fullWidth
                                size="md"
                                variant="default"
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                        </Grid.Col>
                        <Grid.Col xs={6} />
                        <Grid.Col xs={4}>
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
                    </>
                )}
                {error && (
                    <Grid.Col xs={12}>
                        <Text c="red">{error}</Text>
                    </Grid.Col>
                )}
            </Grid>
        </form>
    )
}

export default NewFromSalesOrder
