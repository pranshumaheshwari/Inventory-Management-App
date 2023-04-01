import { Box, Grid, Skeleton, Text } from '@mantine/core'
import { ColDef, ValueGetterParams } from 'ag-grid-community'
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
    totalQuantity: number
    [key: string]: string | number
}

function ManPower() {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [records, setRecords] = useState<RecordInterface[]>([])
    const [bottomPinnedData, setBottomPinnedData] = useState<
        BottomRecordInterface[]
    >([])

    const columnDefs = useMemo<ColDef<RecordInterface>[]>(
        () => [
            { field: 'id', headerName: 'Part Number', pinned: 'left' },
            { field: 'description', headerName: 'Description' },
            { field: 'category', headerName: 'Category' },
            {
                field: 'manPower',
                headerName: 'MP per Unit',
                type: 'numberColumn',
            },
            ...[...Array(dayjs().date()).keys()].map((d, idx) => ({
                field: (idx + 1).toString(),
                valueGetter: (params: ValueGetterParams<RecordInterface>) => {
                    if (params.node?.rowPinned) {
                        return params.data
                            ? params.data[(idx + 1).toString()]
                            : 0
                    }
                    return params.data?.productionQuantity[idx]
                },
                type: 'numberColumn',
            })),
            {
                field: 'totalQuantity',
                headerName: 'Total Production',
                type: 'numberColumn',
                pinned: 'right',
            },
            {
                field: 'totalManPower',
                headerName: 'Total MP',
                type: 'numberColumn',
                valueGetter: (params: ValueGetterParams<RecordInterface>) => {
                    if (params.node?.rowPinned) {
                        return ''
                    }
                    if (params.data?.totalQuantity && params.data.manPower) {
                        return params.data.totalQuantity * params.data.manPower
                    }
                    return 0
                },
                pinned: 'right',
            },
        ],
        []
    )

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
                        ].map((ini, idx) =>
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
                        data[0].productionQuantity.map((pq, idx) => [
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
                        data[0].productionQuantity.map((pq, idx) => [
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
                {
                    id: 'Total MP Required',
                    category: '',
                    description: '',
                    manPower: '',
                    ...Object.fromEntries(
                        data[0].productionQuantity.map((pq, idx) => [
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
                },
                attendace,
                {
                    id: 'Efficiency (%)',
                    category: '',
                    description: '',
                    manPower: '',
                    totalQuantity: parseFloat(
                        (
                            (data.reduce(
                                (prevVal, curVal) =>
                                    prevVal +
                                    curVal.totalQuantity * curVal.manPower,
                                0
                            ) /
                                attendace.totalQuantity) *
                            100
                        ).toFixed(2)
                    ),
                    ...Object.fromEntries(
                        data[0].productionQuantity.map((pq, idx) => [
                            (idx + 1).toString(),
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
                                100,
                        ])
                    ),
                },
            ]

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
