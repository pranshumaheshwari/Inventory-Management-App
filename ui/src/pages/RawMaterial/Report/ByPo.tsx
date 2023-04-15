import { Box, Button, Grid, Skeleton, Stepper, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormSelect, Table } from '../../../components'
import React, { useEffect, useState } from 'react'

import { ColDef } from 'ag-grid-community'
import dayjs from 'dayjs'

interface RecordInterface {
    rm: {
        id: string
    }
    status: 'Accepted' | 'RejectedPoVerification'
    quantity: number
    createdAt: string
}

function ByPo() {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = useState(0)
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [poDetailsRecords, setPoDetailsRecords] = useState<RecordInterface[]>(
        []
    )
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [selectedPo, setSelectedPo] = useState('')
    const [po, setPo] = useState<
        | {
              value: string
              id: string
              poDetails: {
                  rmId: string
                  description: string
                  dtplCode: string
                  quantity: number
                  price: number
              }[]
          }[]
        | null
    >([])

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
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

    const columnDefs: ColDef<RecordInterface>[] = [
        { field: 'id', headerName: 'ID' },
        {
            field: 'createdAt',
            headerName: 'Date',
            valueGetter: ({ data }) => {
                if (data?.createdAt) {
                    return dayjs(data?.createdAt).format('DD/MM/YYYY')
                }
                return ''
            },
        },
        {
            field: 'rmId',
            headerName: 'Raw Material Identifier',
        },
        {
            field: 'rm.dtplCode',
            headerName: 'DTPL Part Number',
        },
        {
            field: 'rm.description',
            headerName: 'Description',
        },
        { field: 'quantity', headerName: 'Quantity', type: 'numberColumn' },
        {
            field: 'invoiceId',
            headerName: 'Invoice',
        },
    ]

    const poTablecolumnDefs: ColDef<RecordInterface>[] = [
        {
            field: 'rm.id',
            headerName: 'Raw Material Identifier',
        },
        {
            field: 'rm.dtplCode',
            headerName: 'DTPL Part Number',
        },
        {
            field: 'rm.description',
            headerName: 'Description',
        },
        { field: 'quantity', headerName: 'PO Quantity', type: 'numberColumn' },
        {
            headerName: 'Accepted Quantity',
            type: 'numberColumn',
            valueGetter: ({ data }) => {
                return records.reduce((val, curVal) => {
                    if (
                        curVal.status === 'Accepted' &&
                        curVal.rm.id === data?.rm.id
                    ) {
                        return val + curVal.quantity
                    }
                    return val
                }, 0)
            },
        },
        {
            field: 'rejectedQuantity',
            headerName: 'Rejected Quantity',
            type: 'numberColumn',
            valueGetter: ({ data }) => {
                return records.reduce((val, curVal) => {
                    if (
                        curVal.status === 'RejectedPoVerification' &&
                        curVal.rm.id === data?.rm.id
                    ) {
                        return val + curVal.quantity
                    }
                    return val
                }, 0)
            },
        },
        {
            field: 'pendingQuantity',
            headerName: 'Pending Quantity',
            type: 'numberColumn',
            valueGetter: ({ data }) => {
                return (
                    (data?.quantity || 0) -
                    records.reduce((val, curVal) => {
                        if (curVal.rm.id === data?.rm.id) {
                            return val + curVal.quantity
                        }
                        return val
                    }, 0)
                )
            },
        },
    ]

    useEffect(() => {
        getSupplier()
    }, [])

    if (!supplier) {
        return <Skeleton width="90vw" height="100%" />
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
                    ...po,
                }))
            })
            setPo(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const fetchRecords = async () => {
        try {
            const data = await Fetch({
                url: '/inwards/po',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            poId: selectedPo,
                            status: {
                                in: ['Accepted', 'RejectedPoVerification'],
                            },
                        }),
                        include: JSON.stringify({
                            rm: {
                                select: {
                                    id: true,
                                    description: true,
                                    dtplCode: true,
                                },
                            },
                        }),
                    },
                },
            })
            setRecords(data)
            const poDetails = await Fetch({
                url: '/purchaseorders',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            id: selectedPo,
                        }),
                        select: JSON.stringify({
                            poDetails: {
                                select: {
                                    quantity: true,
                                    price: true,
                                    rm: {
                                        select: {
                                            id: true,
                                            description: true,
                                            dtplCode: true,
                                        },
                                    },
                                },
                            },
                        }),
                    },
                },
            }).then((records) => records[0])
            setPoDetailsRecords(poDetails.poDetails)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    return (
        <Grid>
            <Grid.Col xs={3} />
            <Grid.Col xs={6}>
                <Stepper active={activeStep} onStepClick={setActiveStep}>
                    {['Inputs', 'Report'].map((label, index) => {
                        return <Stepper.Step key={label} label={label} />
                    })}
                </Stepper>
            </Grid.Col>
            <Grid.Col xs={3} />
            {activeStep === 0 && (
                <>
                    <FormSelect
                        xs={6}
                        name="supplierId"
                        label="Supplier"
                        placeholder="Select Supplier"
                        data={supplier}
                        onChange={(value) => {
                            if (value) {
                                updatePo(value)
                            }
                        }}
                    />
                    <FormSelect
                        name="poId"
                        xs={6}
                        label="Purchase Order"
                        placeholder="Select Purchase Order"
                        data={po ? po : []}
                        onChange={(value) => {
                            if (value) {
                                setSelectedPo(value)
                            }
                        }}
                    />

                    <Grid.Col xs={12}>
                        <Button
                            disabled={!selectedPo}
                            fullWidth
                            size="md"
                            variant="filled"
                            color="primary"
                            onClick={() => {
                                fetchRecords()
                                handleNext()
                            }}
                        >
                            Next
                        </Button>
                    </Grid.Col>
                    <Grid.Col xs={3} />
                </>
            )}
            {activeStep === 1 && (
                <>
                    <Grid.Col xs={12}>
                        <Box h="40vh" w="100%">
                            <Table<RecordInterface>
                                columnDefs={poTablecolumnDefs}
                                rowData={poDetailsRecords}
                                defaultColDef={{
                                    sortable: false,
                                    filter: false,
                                }}
                            />
                        </Box>
                    </Grid.Col>
                    <Grid.Col xs={12}>
                        <Box h="40vh" w="100%">
                            <Table<RecordInterface>
                                columnDefs={columnDefs}
                                rowData={records}
                                defaultColDef={{
                                    sortable: false,
                                    filter: false,
                                }}
                            />
                        </Box>
                    </Grid.Col>
                </>
            )}
            {error && (
                <Grid.Col xs={12}>
                    <Text c="red">{error}</Text>
                </Grid.Col>
            )}
            {activeStep === 1 && (
                <>
                    <Grid.Col xs={3} />
                    <Grid.Col xs={6}>
                        <Button
                            fullWidth
                            size="md"
                            variant="default"
                            onClick={handleBack}
                        >
                            Back
                        </Button>
                    </Grid.Col>
                    <Grid.Col xs={3} />
                </>
            )}
        </Grid>
    )
}

export default ByPo
