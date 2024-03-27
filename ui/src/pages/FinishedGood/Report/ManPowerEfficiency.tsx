import { Box, Grid, Skeleton, Text } from '@mantine/core'
import { CellClassParams, ColDef, ValueGetterParams } from 'ag-grid-community'
import { Fetch, useAuth } from '../../../services'
import React, { useEffect, useMemo, useState } from 'react'

import { Table } from '../../../components'
import dayjs from 'dayjs'

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
    const {
        token: { token, user },
    } = useAuth()
    const [error, setError] = useState('')
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [bottomPinnedData, setBottomPinnedData] = useState<
        BottomRecordInterface[]
    >([])

    const getEfficiencyCodedData = (efficiency: number) => {
        if (efficiency >= 100 && efficiency < 110) {
            return (
                'E' + ' (' + efficiency.toFixed(2) + ')'
            )
        } else if (efficiency >= 110 && efficiency < 115) {
            return (
                'D' + ' (' + efficiency.toFixed(2) + ')'
            )
        } else if (efficiency >= 115 && efficiency < 120) {
            return (
                'C' + ' (' + efficiency.toFixed(2) + ')'
            )
        } else if (efficiency >= 120 && efficiency < 125) {
            return (
                'B' + ' (' + efficiency.toFixed(2) + ')'
            )
        } else if (efficiency >= 125) {
            return (
                'A' + ' (' + efficiency.toFixed(2) + ')'
            )
        } else {
            return (
                'F' + ' (' + efficiency.toFixed(2) + ')'
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
            ...[...Array(dayjs().date()).keys()].map((_d, idx) => ({
                field: (idx + 1).toString(),
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
                cellStyle: ({ data, value }) => {
                    if (data?.id === 'Efficiency (%)') {
                        return getEfficiencyCodedColour(value)
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
    }, [])

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
                                        gte: dayjs()
                                            .startOf('month')
                                            .toISOString(),
                                        lte: dayjs()
                                            .endOf('month')
                                            .toISOString(),
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
                            ...Array(dayjs().date()).keys(),
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
                                gte: dayjs().startOf('month').toISOString(),
                                lte: dayjs().endOf('month').toISOString(),
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
                    totalQuantity: getEfficiencyCodedData(
                        parseFloat(
                            (
                                (data.reduce(
                                    (prevVal, curVal) =>
                                        prevVal +
                                        curVal.totalQuantity * curVal.manPower,
                                    0
                                ) /
                                    parseFloat(
                                        attendace.totalQuantity as string
                                    )) *
                                100
                            ).toFixed(2)
                        )
                    ),
                    ...Object.fromEntries(
                        data[0].productionQuantity.map((_pq, idx) => [
                            (idx + 1).toString(),
                            getEfficiencyCodedData(
                                (data.reduce((prevValue, curVal) => {
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
                                    100
                            ),
                        ])
                    ),
                },
            ]

            // if (user.type === 'admin') {
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
                            }, 0),
                        ])
                    ),
                    totalQuantity: data.reduce(
                        (prevVal, curVal) =>
                            prevVal + curVal.totalQuantity * curVal.manPower,
                        0
                    ),
                })
            // }

            setRecords(data)
            setBottomPinnedData(bottomData)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        fetchRecords()
    }, [])

    if (!records) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <Grid>
            <Grid.Col xs={12}>
                <Box h="70vh" w="100%">
                    <Table<RecordInterface>
                        columnDefs={columnDefs}
                        rowData={records}
                        pinnedBottomRowData={bottomPinnedData}
                    />
                </Box>
            </Grid.Col>
            {error && (
                <Grid.Col xs={12}>
                    <Text c="red">{error}</Text>
                </Grid.Col>
            )}
        </Grid>
    )
}

export default ManPower
