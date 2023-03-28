import {
    Box,
    Button,
    Grid,
    SelectItem,
    Skeleton,
    Stepper,
    Text,
} from '@mantine/core'
import { DateRangePicker, FormSelect, Table } from '../../../components'
import { Fetch, useAuth } from '../../../services'
import { RawMaterialSelectFilter, RawMaterialSelectItem } from '../../common'
import React, { useEffect, useState } from 'react'

import { ColDef } from 'ag-grid-community'
import { RawMaterialInterface } from '../RawMaterial'
import dayjs from 'dayjs'

interface RecordInterface {
    createdAt: string
    type: 'Production' | 'Inwards' | 'Requisition'
}

function ById() {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = useState(0)
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [rawmaterial, setRawmaterial] = useState<SelectItem[]>()
    const [selectedRm, setSelectedRm] = useState<{
        rm: SelectItem
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
        { field: 'type', headerName: 'Stage' },
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
                            category: true,
                        }),
                    },
                },
            }).then((data) =>
                data.map((d: Partial<RawMaterialInterface>) => ({
                    ...d,
                    value: d.id,
                    label: d.description,
                    group: d.category,
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

            const production = await Fetch({
                url: '/outwards/productionlog',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            }).then((data) =>
                data.map((d: RecordInterface) => ({ ...d, type: 'Production' }))
            )

            const inwardsVerified = await Fetch({
                url: '/inwards/verified',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            }).then((data) =>
                data.map((d: RecordInterface) => ({ ...d, type: 'Inwards' }))
            )

            const requisitionOutwards = await Fetch({
                url: '/requisition/issue',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            }).then((data) =>
                data.map((d: RecordInterface) => ({
                    ...d,
                    type: 'Requisition',
                }))
            )

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
                    <FormSelect
                        xs={12}
                        label="Raw Material"
                        placeholder="Select Raw Material"
                        itemComponent={RawMaterialSelectItem}
                        filter={RawMaterialSelectFilter}
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

export default ById
