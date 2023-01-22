import {
    Box,
    Button,
    Container,
    FormHelperText,
    Grid,
    SelectChangeEvent,
    Skeleton,
    Step,
    StepLabel,
    Stepper,
} from '@mui/material'
import { Fetch, useAuth } from '../../../services'
import { Field, Formik } from 'formik'
import { FormSelect, Table } from '../../../components'
import React, { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'

import { ColDef } from 'ag-grid-community'

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
    const [selectedPo, setSelectedPo] = useState<string>()
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
                    return format(parseISO(data?.createdAt), 'dd/MM/yyyy')
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
                            <Field
                                name="supplierId"
                                component={FormSelect}
                                xs={6}
                                label="Supplier"
                                placeholder="Select Supplier"
                                items={supplier}
                                onChange={(e: SelectChangeEvent) => {
                                    updatePo(e.target?.value)
                                }}
                            />
                            <Field
                                name="poId"
                                component={FormSelect}
                                xs={6}
                                label="Purchase Order"
                                placeholder="Select Purchase Order"
                                items={po}
                                onChange={(e: SelectChangeEvent) => {
                                    setSelectedPo(e.target.value)
                                }}
                            />

                            <Grid item xs={12}>
                                <Button
                                    disableElevation
                                    disabled={!selectedPo}
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
                                        defaultColDef={{
                                            sortable: false,
                                            filter: false,
                                        }}
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

export default ByPo
