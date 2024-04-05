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
import { DatesRangeValue } from '@mantine/dates'
import { RawMaterialInterface } from '../RawMaterial'
import dayjs from 'dayjs'

interface RecordInterface {
    id: string | number
    fgId: string
    requisitionId: string
    productionId?: number
    storeStockBefore: number
    lineStockBefore: number
    quantity: number
    createdAt: string
    type: string
    requisition: {
        fgId: string
    }
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
        {
            field: 'createdAt',
            headerName: 'Date',
            sort: 'asc',
            sortable: true,
            valueGetter: ({ data }) => {
                if (data?.createdAt) {
                    return dayjs(data?.createdAt).format('DD/MM/YYYY HH:mm:ss')
                }
                return ''
            },
            rowGroup: true,
            hide: true,
        },
        { field: 'type', headerName: 'Stage', aggFunc: ({ values }) => values[0].split(" ")[0]},
        { field: 'quantity', headerName: 'Quantity', type: 'numberColumn', aggFunc: 'sum' },
        { field: 'storeStockBefore', headerName: 'Store Stock (Before)', type: 'numberColumn', aggFunc: 'first' },
        { field: 'lineStockBefore', headerName: 'Line Stock (Before)', type: 'numberColumn', aggFunc: 'first' },
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
                data.map((d: RecordInterface) => ({ ...d, id: d.productionId, type: `Production (${d.fgId})` }))
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
                        include: JSON.stringify({
                            requisition: {
                                select: {
                                    fgId: true
                                }
                            }
                        })
                    },
                },
            }).then((data) =>
                data.map((d: RecordInterface) => ({
                    ...d,
                    type: `Requisition (${d.requisition.fgId} [${d.requisitionId}])`,
                }))
            )

            const manualUpdate = await Fetch({
                url: '/rawmaterial/manualUpdate',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            }).then((data) =>
                data.map((d: RecordInterface) => ({
                    ...d,
                    type: 'Manual Update',
                }))
            )

            const data = [
                ...production,
                ...inwardsVerified,
                ...requisitionOutwards,
                ...manualUpdate,
            ]
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
                                autoGroupColumnDef={{
                                    headerName: 'Date'
                                }}
                                suppressAggFuncInHeader
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

export default ById
