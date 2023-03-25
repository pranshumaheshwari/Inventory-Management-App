import { Box, Button, Grid, Stepper, Text } from '@mantine/core'
import { DateRangePicker, Table } from '../../../components'
import { Fetch, useAuth } from '../../../services'
import React, { useState } from 'react'

import { ColDef } from 'ag-grid-community'
import dayjs from 'dayjs'

interface RecordInterface {
    id: number
    number: number
    date: string
}

function Report() {
    const [value, setValue] = useState<[Date, Date]>([new Date(), new Date()])
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [activeStep, setActiveStep] = React.useState(0)
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const columnDefs: ColDef<RecordInterface>[] = [
        { field: 'id', headerName: 'ID' },
        {
            field: 'date',
            headerName: 'Date',
            valueGetter: ({ data }) => {
                if (data?.date) {
                    return dayjs(data?.date).format('DD/MM/YYYY')
                }
                return ''
            },
        },
        { field: 'number', headerName: 'Nos', type: 'numberColumn' },
    ]

    const fetchRecords = async () => {
        try {
            const data = await Fetch({
                url: '/attendance',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            AND: [
                                {
                                    date: {
                                        gte: value[0].toISOString(),
                                    },
                                },
                                {
                                    date: {
                                        lte: dayjs(value[1])
                                            .add(1, 'day')
                                            .toISOString(),
                                    },
                                },
                            ],
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
                    {['Date Range', 'Report'].map((label, index) => {
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
                        range={value}
                        clearable
                        value={value}
                        onChange={(value) => {
                            if (value[0] && value[1]) {
                                setValue([value[0], value[1]])
                            }
                        }}
                    />
                    <Grid.Col xs={3} />
                    <Grid.Col xs={3} />
                    <Grid.Col xs={6}>
                        <Button
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

export default Report
