import { Box, Button, Grid, Skeleton, Stepper, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormSelect, Table } from '../../../components'
import React, { useEffect, useState } from 'react'

import { ColDef } from 'ag-grid-community'
import dayjs from 'dayjs'

interface RecordInterface {
    createdAt: string
}

function ByPo() {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = useState(0)
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [selectedPo, setSelectedPo] = useState('')
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
        { field: 'quantity', headerName: 'Quantity', type: 'numberColumn' },
        {
            field: 'invoiceId',
            headerName: 'Invoice',
        },
        {
            field: 'rmId',
            headerName: 'Raw Material Identifier',
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
                    },
                },
            })
            setRecords(data)
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
                        <Box h="70vh" w="100%">
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
