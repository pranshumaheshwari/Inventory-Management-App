import {
    Box,
    Button,
    Container,
    FormHelperText,
    Grid,
    Skeleton,
    Step,
    StepLabel,
    Stepper,
} from '@mui/material'
import { DateRangePicker, Table } from '../../../components'
import { Fetch, useAuth } from '../../../services'
import React, { SyntheticEvent, useEffect, useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'

import { ColDef } from 'ag-grid-community'
import { Formik } from 'formik'
import { InputAutoComplete } from '../../common'
import { RawMaterialInterface } from '../RawMaterial'

interface RecordInterface {
    createdAt: string
}

function ById() {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = useState(0)
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [rawmaterial, setRawmaterial] =
        useState<Partial<RawMaterialInterface>[]>()
    const [selectedRm, setSelectedRm] = useState<{
        rm: Partial<RawMaterialInterface>
    }>({
        rm: {},
    })
    const [value, setValue] = useState<{
        startDate: Date
        endDate: Date
        key: string
    }>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'daterange',
    })

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const columnDefs: ColDef<RecordInterface>[] = [
        { field: 'id', headerName: 'ID' },
        {
            field: 'createdAt',
            headerName: 'Date',
            valueGetter: ({ data }) => {
                if (data?.createdAt) {
                    return format(parseISO(data?.createdAt), 'dd/MM/yyyy')
                }
                return ''
            },
        },
        { field: 'quantity', headerName: 'Quantity', type: 'numberColumn' },
    ]

    const getRawmaterials = async () => {
        try {
            const data = await Fetch({
                url: '/rawmaterial',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            description: true,
                            dtplCode: true,
                        }),
                    },
                },
            })
            setRawmaterial(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getRawmaterials()
    }, [])

    if (!rawmaterial) {
        return <Skeleton width="90vw" height="100%" />
    }

    const fetchRecords = async () => {
        try {
            const query = {
                where: JSON.stringify({
                    rmId: selectedRm.rm.id,
                    AND: [
                        {
                            createdAt: {
                                gte: value.startDate,
                            },
                        },
                        {
                            createdAt: {
                                lte: addDays(value.endDate, 1),
                            },
                        },
                    ],
                }),
            }

            const production = await Fetch({
                url: '/outwards/productionlog',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            })

            const inwardsVerified = await Fetch({
                url: '/inwards/verified',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            })

            const requisitionOutwards = await Fetch({
                url: '/requisition/issue',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            })

            const data = production
            setRecords(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    return (
        <Formik initialValues={{}} onSubmit={() => {}}>
            <Container>
                <Grid container spacing={3}>
                    <Grid item xs={3} />
                    <Grid item xs={6}>
                        <Stepper activeStep={activeStep}>
                            {['Inputs', 'Report'].map((label, index) => {
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
                            <InputAutoComplete<Partial<RawMaterialInterface>>
                                identifierXs={6}
                                defaultIdentifier="description"
                                identifierItems={[
                                    {
                                        value: 'description',
                                        label: 'Description',
                                    },
                                    {
                                        value: 'id',
                                        label: 'ID',
                                    },
                                    {
                                        label: 'DTPL Part Number',
                                        value: 'dtplCode',
                                    },
                                ]}
                                itemXs={6}
                                label="Raw Material"
                                name="rmId"
                                options={rawmaterial}
                                uniqueIdentifier="id"
                                placeholder="Select Raw Material"
                                onChange={(e: SyntheticEvent, value) =>
                                    setSelectedRm((selectedRm) => {
                                        if (value)
                                            return {
                                                rm: value,
                                            }
                                        return selectedRm
                                    })
                                }
                            />
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
        </Formik>
    )
}

export default ById
