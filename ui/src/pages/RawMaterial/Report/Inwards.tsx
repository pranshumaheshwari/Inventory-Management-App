import { Box, Button, Grid, Stepper, Text } from '@mantine/core'
import { DateRangePicker, Table } from '../../../components'
import { Fetch, useAuth } from '../../../services'
import React, { useState } from 'react'

import { ColDef } from 'ag-grid-community'
import { DatesRangeValue } from '@mantine/dates'
import dayjs from 'dayjs'
import { BaseRecordInterface } from '.'
import { RawMaterialInterface } from '../RawMaterial'

interface RecordInterface extends BaseRecordInterface {
    rm: Partial<RawMaterialInterface>
    status: string
}

function InwardsReport() {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = useState(0)
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [value, setValue] = useState<DatesRangeValue>([
        new Date(),
        new Date(),
    ])

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const columnDefs: ColDef<RecordInterface>[] = [
        { field: 'id', headerName: 'ID' },
        { field: 'rm.id', headerName: 'RM Identifier' },
        { field: 'rm.dtplCode', headerName: 'RM DTPL Code' },
        { field: 'rm.description', headerName: 'RM Description' },
        {
            field: 'createdAt',
            headerName: 'Date',
            sortable: true,
            sort: 'asc',
            valueGetter: ({ data }) => {
                if (data?.createdAt) {
                    return dayjs(data?.createdAt).format('DD/MM/YYYY HH:mm:ss')
                }
                return ''
            },
        },
        { field: 'quantity', headerName: 'Quantity', type: 'numberColumn' },
        { field: 'status', headerName: 'Status' },
        { field: 'storeStockBefore', headerName: 'Store Stock (Before)', type: 'numberColumn' },
        { field: 'lineStockBefore', headerName: 'Line Stock (Before)', type: 'numberColumn' },
    ]

    const fetchRecords = async () => {
        try {
            const query = {
                where: JSON.stringify({
                    AND: [
                        {
                            createdAt: {
                                gte: dayjs(value[0]).startOf('d').toISOString(),
                            },
                        },
                        {
                            createdAt: {
                                lte: dayjs(value[1]).endOf('d').toISOString(),
                            },
                        },
                    ],
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
                    createdAt: true,
                    quantity: true,
                    status: true,
                    storeStockBefore: true,
                    lineStockBefore: true,
                }),
            }
   
            const verified = await Fetch({
                url: '/inwards/verified',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            })
            const iqc = await Fetch({
                url: '/inwards/iqc',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            }).then(data => data.map((d: {status: string}) => {
                if (d.status === "Accepted") {
                    d.status = "Accepted IQC"
                }
                return d
            }))
            const po = await Fetch({
                url: '/inwards/po',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            }).then(data => data.map((d: {status: string}) => {
                if (d.status === "Accepted") {
                    d.status = "Accepted PO Verification"
                }
                return d
            }))

            setRecords([...verified, ...iqc, ...po])
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
                    <Grid.Col xs={3} />
                    <DateRangePicker
                        xs={6}
                        name="dateRange"
                        label="Select Date Range"
                        clearable
                        value={value}
                        onChange={setValue}
                    />
                    <Grid.Col xs={3} />
                    <Grid.Col xs={3} />

                    <Grid.Col xs={6}>
                        <Button
                            disabled={!value[1]}
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

export default InwardsReport
