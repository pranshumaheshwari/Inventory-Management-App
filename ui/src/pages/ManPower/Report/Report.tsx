import {
    Box,
    Button,
    Container,
    FormHelperText,
    Grid,
    Step,
    StepLabel,
    Stepper,
} from '@mui/material'
import { DateRangePicker, Table } from '../../../components'
import { Fetch, useAuth } from '../../../services'
import React, { useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'

import { ColDef } from 'ag-grid-community'

interface RecordInterface {
    id: number
    number: number
    date: string
}

function Report() {
    const [value, setValue] = useState<{
        startDate: Date
        endDate: Date
        key: string
    }>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'daterange',
    })
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
                    return format(parseISO(data?.date), 'dd/MM/yyyy')
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
                                        gte: value.startDate,
                                    },
                                },
                                {
                                    date: {
                                        lte: addDays(value.endDate, 1),
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
        <Container>
            <Grid container spacing={3}>
                <Grid item xs={3} />
                <Grid item xs={6}>
                    <Stepper activeStep={activeStep}>
                        {['Date Range', 'Report'].map((label, index) => {
                            const stepProps: {
                                completed?: boolean
                            } = {}
                            const labelProps: {
                                optional?: React.ReactNode
                            } = {}
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepLabel {...labelProps}>
                                        {label}
                                    </StepLabel>
                                </Step>
                            )
                        })}
                    </Stepper>
                </Grid>
                <Grid item xs={3} />
                {activeStep === 0 && (
                    <>
                        <Grid item xs={3} />
                        <DateRangePicker
                            xs={6}
                            range={value}
                            onChange={(value) => {
                                let val = value['daterange']
                                if (
                                    val &&
                                    val.startDate &&
                                    val.endDate &&
                                    val.key
                                ) {
                                    setValue({
                                        startDate: val.startDate,
                                        endDate: val.endDate,
                                        key: val.key,
                                    })
                                }
                            }}
                        />
                        <Grid item xs={3} />
                        <Grid item xs={3} />

                        <Grid item xs={6}>
                            <Button
                                disableElevation
                                disabled={!value.endDate}
                                fullWidth
                                size="large"
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    fetchRecords()
                                    handleNext()
                                }}
                            >
                                Next
                            </Button>
                        </Grid>
                        <Grid item xs={3} />
                    </>
                )}
                {activeStep === 1 && (
                    <>
                        <Grid item xs={12}>
                            <Box height="70vh" width="100%">
                                <Table<RecordInterface>
                                    columnDefs={columnDefs}
                                    rowData={records}
                                />
                            </Box>
                        </Grid>
                    </>
                )}
                {error && (
                    <Grid item xs={12}>
                        <FormHelperText error>{error}</FormHelperText>
                    </Grid>
                )}
                {activeStep === 1 && (
                    <>
                        <Grid item xs={3} />
                        <Grid item xs={6}>
                            <Button
                                disableElevation
                                fullWidth
                                size="large"
                                variant="contained"
                                color="primary"
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                        </Grid>
                        <Grid item xs={3} />
                    </>
                )}
            </Grid>
        </Container>
    )
}

export default Report
