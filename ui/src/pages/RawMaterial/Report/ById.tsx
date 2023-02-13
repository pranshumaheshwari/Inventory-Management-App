import {
    AutocompleteItem,
    Box,
    Button,
    Grid,
    Skeleton,
    Stepper,
    Text,
} from '@mantine/core'
import { DateRangePicker, FormAutoComplete, Table } from '../../../components'
import { Fetch, useAuth } from '../../../services'
import React, { useEffect, useState } from 'react'

import { ColDef } from 'ag-grid-community'
import { RawMaterialInterface } from '../RawMaterial'
import dayjs from 'dayjs'

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
    const [rawmaterial, setRawmaterial] = useState<AutocompleteItem[]>()
    const [selectedRm, setSelectedRm] = useState<{
        rm: AutocompleteItem
    }>({
        rm: {
            value: '',
        },
    })
    const [value, setValue] = useState<[Date, Date]>([new Date(), new Date()])

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
                    return dayjs(data?.createdAt).format('DD/MM/YYYY')
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
            }).then((data) =>
                data.map((d: Partial<RawMaterialInterface>) => ({
                    ...d,
                    value: d.id,
                }))
            )
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
                                gte: value[0].toISOString(),
                            },
                        },
                        {
                            createdAt: {
                                lte: dayjs(value[1])
                                    .add(1, 'day')
                                    .toDate()
                                    .toISOString(),
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

            const data = [
                ...production,
                ...inwardsVerified,
                ...requisitionOutwards,
            ]
            data.sort((a, b) => b.createdAt - a.createdAt)
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
                    <FormAutoComplete
                        xs={12}
                        label="Raw Material"
                        placeholder="Select Raw Material"
                        data={rawmaterial}
                        onChange={(value) =>
                            setSelectedRm((selectedRm) => {
                                let rm = rawmaterial.find(
                                    (d) => d.value === value
                                )
                                if (rm)
                                    return {
                                        ...selectedRm,
                                        rm,
                                    }
                                return selectedRm
                            })
                        }
                        withAsterisk
                    />
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
                            variant="outline"
                            color="primary"
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

export default ById
