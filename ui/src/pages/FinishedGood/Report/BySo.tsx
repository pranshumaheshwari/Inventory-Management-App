import { Box, Button, Grid, Skeleton, Stepper, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormSelect, Table } from '../../../components'
import React, { useEffect, useState } from 'react'

import { ColDef } from 'ag-grid-community'
import dayjs from 'dayjs'
import { BaseRecordInterface } from '.'

interface RecordInterface extends BaseRecordInterface {
    type: string
    fgId: string
}

function BySo() {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = useState(0)
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [selectedSo, setSelectedSo] = useState('')
    const [so, setSo] = useState<
        | {
              value: string
              id: string
              soDetails: {
                  fgId: string
                  quantity: number
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
                url: '/customers',
                options: {
                    authToken: token,
                },
            }).then((data) => {
                return data.map((customer: { name: string; id: string }) => ({
                    label: customer.name,
                    value: customer.id,
                }))
            })
            setCustomer(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const columnDefs: ColDef<RecordInterface>[] = [
        { field: 'id', headerName: 'ID' },
        { field: 'type', headerName: 'Stage' },
        {
            field: 'createdAt',
            sortable: true,
            sort: 'asc',
            headerName: 'Date',
            valueGetter: ({ data }) => {
                if (data?.createdAt) {
                    return dayjs(data?.createdAt).format('DD/MM/YYYY HH:mm:ss')
                }
                return ''
            },
        },
        { field: 'quantity', headerName: 'Quantity', type: 'numberColumn' },
        {
            field: 'fgId',
            headerName: 'Finished Good',
        },
    ]

    useEffect(() => {
        getSupplier()
    }, [])

    if (!customer) {
        return <Skeleton width="90vw" height="100%" />
    }

    const updateSo = async (customerId: string) => {
        try {
            const data = await Fetch({
                url: '/salesorders',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            customerId,
                        }),
                        select: JSON.stringify({
                            id: true,
                            soDetails: {
                                select: {
                                    fgId: true,
                                    quantity: true,
                                },
                            },
                        }),
                    },
                },
            }).then((data) => {
                return data.map((so: { id: string }) => ({
                    value: so.id,
                    label: so.id,
                    ...so,
                }))
            })
            setSo(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const fetchRecords = async () => {
        try {
            const query = {
                where: JSON.stringify({
                    soId: selectedSo,
                }),
            }

            const production = await Fetch({
                url: '/outwards/production',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            }).then((data) =>
                data.map((d: RecordInterface) => ({ ...d, type: 'Production' }))
            )

            const dispatch = await Fetch({
                url: '/outwards/dispatch',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            }).then((data) =>
                data.map((d: { invoiceNumber: string }) => ({
                    ...d,
                    id: d.invoiceNumber,
                    type: 'Dispatch',
                }))
            )

            const data = [...production, ...dispatch]
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
                        label="Customer"
                        placeholder="Select Customer"
                        data={customer}
                        onChange={(value) => {
                            if (value) {
                                updateSo(value)
                            }
                        }}
                    />
                    <FormSelect
                        xs={6}
                        label="Sales Order"
                        placeholder="Select Sales Order"
                        data={so ? so : []}
                        onChange={(value) => {
                            if (value) {
                                setSelectedSo(value)
                            }
                        }}
                    />

                    <Grid.Col xs={12}>
                        <Button
                            disabled={!selectedSo}
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

export default BySo
