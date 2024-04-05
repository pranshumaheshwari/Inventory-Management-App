import { Box, Button, Grid, Stepper, Text } from '@mantine/core'
import { DateRangePicker, Table } from '../../../components'
import { Fetch, useAuth } from '../../../services'
import React, { useState } from 'react'

import { ColDef } from 'ag-grid-community'
import { DatesRangeValue } from '@mantine/dates'
import dayjs from 'dayjs'
import { BaseRecordInterface } from '.'

interface RecordInterface extends BaseRecordInterface {
    requisitionId: number
    rmId: string

}

function RequisitionReport() {
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
        { field: 'requisitionId', headerName: 'Requisition' },
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
            rowGroup: true,
            hide: true,
        },
        { field: 'rmId', headerName: 'Raw Material', rowGroup: true, hide: true },
        { field: 'quantity', headerName: 'Quantity', aggFunc: ({rowNode, values}) => {
            if (rowNode.rowGroupIndex) {
                return values.reduce((partialSum, a) => partialSum + a, 0)
            }
            return null
        }},
        { field: 'storeStockBefore', headerName: 'Store Stock (Before)', aggFunc: ({rowNode, values}) => {
            if (rowNode.rowGroupIndex) {
                return values[0]
            }
            return null
        }},
        { field: 'lineStockBefore', headerName: 'Line Stock (Before)', aggFunc: ({rowNode, values}) => {
            if (rowNode.rowGroupIndex) {
                return values[0]
            }
            return null
        }},
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
            }

            const data = await Fetch({
                url: '/requisition/issue',
                options: {
                    authToken: token,
                    params: {
                        ...query,
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
                                suppressAggFuncInHeader
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

export default RequisitionReport
