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
import { FinishedGoodSelectFilter, FinishedGoodSelectItem } from '../../common'
import React, { useEffect, useState } from 'react'

import { ColDef } from 'ag-grid-community'
import { DatesRangeValue } from '@mantine/dates'
import { FinishedGoodsInterface } from '../FinishedGood'
import dayjs from 'dayjs'
import { BaseRecordInterface } from '.'

interface RecordInterface extends BaseRecordInterface {
    type: 'Production' | 'OQC' | 'Dispatch'
}

function ById() {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = useState(0)
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [finishedgood, setFinishedgood] = useState<SelectItem[]>()
    const [selectedFg, setSelectedFg] = useState<{
        fg: SelectItem
    }>({
        fg: {
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
        { field: 'storeStockBefore', headerName: 'Store Stock (Before)', type: 'numberColumn' },
    ]

    const getFinishedGoods = async () => {
        try {
            const data = await Fetch({
                url: '/finishedgoods',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            description: true,
                            category: true,
                        }),
                    },
                },
            }).then((data) =>
                data.map((d: Partial<FinishedGoodsInterface>) => ({
                    ...d,
                    value: d.id,
                    label: d.description,
                    group: d.category,
                }))
            )
            setFinishedgood(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getFinishedGoods()
    }, [])

    if (!finishedgood) {
        return <Skeleton width="90vw" height="100%" />
    }

    const fetchRecords = async () => {
        try {
            const query = {
                where: JSON.stringify({
                    fgId: selectedFg.fg.id,
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

            const outwardsQuality = await Fetch({
                url: '/outwards/oqc',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            }).then((data) =>
                data.map((d: RecordInterface) => ({ ...d, type: 'OQC' }))
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

            const data = [...production, ...outwardsQuality, ...dispatch]
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
                        label="Finished Good"
                        placeholder="Select Finished Good"
                        data={finishedgood}
                        itemComponent={FinishedGoodSelectItem}
                        filter={FinishedGoodSelectFilter}
                        onChange={(value) =>
                            setSelectedFg((selectedFg) => {
                                let fg = finishedgood.find(
                                    (d) => d.value === value
                                )
                                if (fg)
                                    return {
                                        ...selectedFg,
                                        fg,
                                    }
                                return selectedFg
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
