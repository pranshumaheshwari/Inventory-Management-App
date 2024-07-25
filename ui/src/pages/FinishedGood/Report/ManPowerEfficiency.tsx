import { Box, Button, Grid, Stepper, Text } from '@mantine/core'
import { CellClassParams, ColDef, ValueGetterParams } from 'ag-grid-community'
import React, { useMemo, useState } from 'react'
import { DateValue } from '@mantine/dates'
import dayjs from 'dayjs'

import { Fetch, useAuth } from '../../../services'
import { Table, MonthPicker } from '../../../components'

interface RecordInterface {
    id: string
    description: string
    category: string
    productionQuantity: number[]
    totalQuantity: number
    manPower: number
    [key: string]: string | number | undefined | number[]
}

interface BottomRecordInterface {
    id: string
    description: string
    category: string
    manPower: string
    totalQuantity: string | number
    [key: string]: string | number
}

function ManPower() {
    const TO_REDUCE_EFF = 12
    const {
        token: { token, user },
    } = useAuth()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = useState(0)
    const [value, setValue] = useState<DateValue>(new Date())
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [bottomPinnedData, setBottomPinnedData] = useState<
        BottomRecordInterface[]
    >([])

    const getEfficiencyCodedData = (efficiency: number): string => {
        if (efficiency >= 100 && efficiency < 110) {
            return (
                'E (' + efficiency.toFixed(2) + ')'
            )
        } else if (efficiency >= 110 && efficiency < 115) {
            return (
                'D (' + efficiency.toFixed(2) + ')'
            )
        } else if (efficiency >= 115 && efficiency < 120) {
            return (
                'C (' + efficiency.toFixed(2) + ')'
            )
        } else if (efficiency >= 120 && efficiency < 125) {
            return (
                'B (' + efficiency.toFixed(2) + ')'
            )
        } else if (efficiency >= 125) {
            return (
                'A (' + efficiency.toFixed(2) + ')'
            )
        } else if (efficiency === 0) {
            return `0`
        } else {
            return (
                'F (' + efficiency.toFixed(2) + ')'
            )
        }
    }

    const getEfficiencyCodedColour = (effieciency: string) => {
        if (effieciency.startsWith('F')) {
            return {
                'background-color': '#FF0000',
            }
        } else if (effieciency.startsWith('E')) {
            return {
                'background-color': '#FE9751',
            }
        } else if (effieciency.startsWith('D')) {
            return {
                'background-color': '#FECF00',
            }
        } else if (effieciency.startsWith('C')) {
            return {
                'background-color': '#06FFE9',
            }
        } else if (effieciency.startsWith('B')) {
            return {
                'background-color': '#0163FE',
            }
        } else if (effieciency.startsWith('A')) {
            return {
                'background-color': '#0DFF00',
            }
        }
        return null
    }

    const columnDefs = useMemo<ColDef<RecordInterface>[]>(() => {
        const def: ColDef<RecordInterface>[] = [
            { field: 'id', headerName: 'Part Number', pinned: 'left' },
            { field: 'description', headerName: 'Description' },
            { field: 'category', headerName: 'Category' },
            ...[...Array(value ? (dayjs(value).daysInMonth()) : 0).keys()].map((_d, idx) => ({
                field: (idx + 1).toString(),
                // TODO: Set column as numberType
                valueGetter: (params: ValueGetterParams<RecordInterface>) => {
                    if (params.node?.rowPinned) {
                        return params.data
                            ? params.data[(idx + 1).toString()]
                            : 0
                    }
                    return params.data?.productionQuantity[idx]
                },
                cellStyle: ({
                    data,
                    value,
                }: CellClassParams<RecordInterface>) => {
                    if (data?.id === 'Efficiency (%)') {
                        return getEfficiencyCodedColour(value)
                    }
                    return null
                },
            })),
            {
                field: 'totalQuantity',
                headerName: 'Total Production',
                pinned: 'right',
                type: 'numberColumn',
                valueFormatter: ({ data, value }) => {
                    if (data?.id === 'Efficiency (%)') {
                        return getEfficiencyCodedData(data.totalQuantity)
                    }
                    return value.toFixed(2)
                },
                cellStyle: ({ data, value }) => {
                    if (data?.id === 'Efficiency (%)') {
                        return getEfficiencyCodedColour(getEfficiencyCodedData(value))
                    }
                    return null
                },
            },
        ]
        if (user.type === 'admin') {
            def.splice(3, 0, {
                field: 'manPower',
                headerName: 'MP per Unit',
                type: 'numberColumn',
            })
            def.splice(-1, 0, {
                field: 'totalManPower',
                headerName: 'Total MP',
                type: 'numberColumn',
                valueGetter: (params: ValueGetterParams<RecordInterface>) => {
                    if (params.node?.rowPinned) {
                        return ''
                    }
                    if (params.data?.totalQuantity && params.data.manPower) {
                        return +((params.data.totalQuantity * params.data.manPower).toFixed(2))
                    }
                    return 0
                },
                pinned: 'right',
            })
        }
        return def
    }, [value])

    const fetchRecords = async () => {
        try {
            const data: RecordInterface[] = await Fetch({
                url: '/finishedgoods',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            description: true,
                            category: true,
                            manPower: true,
                            production: {
                                where: {
                                    createdAt: {
                                        gte: dayjs(value).startOf('M').startOf('d').toISOString(),
                                        lte: dayjs(value).endOf('M').endOf('d').toISOString(),
                                    },
                                },
                                select: {
                                    quantity: true,
                                    createdAt: true,
                                },
                            },
                        }),
                    },
                },
            }).then((data) =>
                data.map(
                    (d: {
                        production: {
                            quantity: number
                            createdAt: string
                        }[]
                    }) => ({
                        ...d,
                        totalQuantity: d.production.reduce(
                            (prevVal, curVal) => prevVal + curVal.quantity,
                            0
                        ),
                        productionQuantity: [
                            ...Array(dayjs(value).daysInMonth()).keys(),
                        ].map((_ini, idx) =>
                            d.production.reduce((prevVal, curVal) => {
                                if (
                                    dayjs(curVal.createdAt).date() - 1 ===
                                    idx
                                ) {
                                    return prevVal + curVal.quantity
                                }
                                return prevVal
                            }, 0)
                        ),
                    })
                )
            )

            const attendace: BottomRecordInterface = await Fetch({
                url: '/attendance',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            number: true,
                            date: true,
                        }),
                        where: JSON.stringify({
                            date: {
                                gte: dayjs(value).startOf('M').startOf('d').toISOString(),
                                lte: dayjs(value).endOf('M').endOf('d').toISOString(),
                            },
                        }),
                    },
                },
            })
                .then(
                    (
                        records: {
                            number: number
                            date: string
                        }[]
                    ) =>
                        records.map((record) => ({
                            ...record,
                            date: dayjs(record.date).date(),
                        }))
                )
                .then((records) => ({
                    id: 'Attendace',
                    category: '',
                    description: '',
                    manPower: '',
                    totalQuantity: records.reduce(
                        (prevVal, curVal) => prevVal + curVal.number,
                        0
                    ),
                    ...Object.fromEntries(
                        data[0].productionQuantity.map((_pq, idx) => [
                            (idx + 1).toString(),
                            records.reduce((prevValue, curVal) => {
                                if (curVal.date === idx + 1) {
                                    return prevValue + curVal.number
                                }
                                return prevValue
                            }, 0),
                        ])
                    ),
                }))

            const bottomData: BottomRecordInterface[] = [
                {
                    id: 'Total Production',
                    category: '',
                    description: '',
                    manPower: '',
                    ...Object.fromEntries(
                        data[0].productionQuantity.map((_pq, idx) => [
                            (idx + 1).toString(),
                            data.reduce((prevValue, curVal) => {
                                return (
                                    prevValue + curVal.productionQuantity[idx]
                                )
                            }, 0),
                        ])
                    ),
                    totalQuantity: data.reduce(
                        (prevVal, curVal) => prevVal + curVal.totalQuantity,
                        0
                    ),
                },
                attendace,
                {
                    id: 'Efficiency (%)',
                    category: '',
                    description: '',
                    manPower: '',
                    totalQuantity: 
                        parseFloat(
                            (
                                Math.max((data.reduce(
                                    (prevVal, curVal) =>
                                        prevVal +
                                        curVal.totalQuantity * curVal.manPower,
                                    0
                                ) /
                                    parseFloat(
                                        attendace.totalQuantity as string
                                    )) *
                                100 - TO_REDUCE_EFF, 0)
                            ).toFixed(2)
                    ),
                    ...Object.fromEntries(
                        data[0].productionQuantity.map((_pq, idx) => [
                            (idx + 1).toString(),
                            getEfficiencyCodedData(
                                Math.max(((data.reduce((prevValue, curVal) => {
                                    return (
                                        prevValue +
                                        curVal.productionQuantity[idx] *
                                            curVal.manPower
                                    )
                                }, 0) /
                                    (attendace[(idx + 1).toString()]
                                        ? (attendace[
                                              (idx + 1).toString()
                                          ] as number)
                                        : 1)) *
                                    100) - TO_REDUCE_EFF, 0)
                            ),
                        ])
                    ),
                },
            ]

            if (user.type === 'admin') {
                bottomData.splice(1, 0, {
                    id: 'Total MP Required',
                    category: '',
                    description: '',
                    manPower: '',
                    ...Object.fromEntries(
                        data[0].productionQuantity.map((_pq, idx) => [
                            (idx + 1).toString(),
                            data.reduce((prevValue, curVal) => {
                                return (
                                    prevValue +
                                    curVal.productionQuantity[idx] *
                                        curVal.manPower
                                )
                            }, 0).toFixed(2),
                        ])
                    ),
                    totalQuantity: data.reduce(
                        (prevVal, curVal) =>
                            prevVal + curVal.totalQuantity * curVal.manPower,
                        0
                    ),
                })
            }

            setRecords(data.filter(d => 
                d.productionQuantity.reduce((prevVal, curVal) => prevVal + curVal, 0) > 0)
            )
            setBottomPinnedData(bottomData)
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
                    <MonthPicker
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
                            disabled={!value}
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
                                pinnedBottomRowData={bottomPinnedData}
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
                            onClick={() => {
                                handleBack()
                                setError("")
                                setRecords([])
                            }}
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

export default ManPower
