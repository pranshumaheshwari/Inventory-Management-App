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
    scheduledQuantity: number
    productionQuantity: number[]
    totalQuantity: number
}

function ProductionReport() {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [records, setRecords] = useState<RecordInterface[]>([])

    const columnDefs = useMemo<ColDef<RecordInterface>[]>(
        () => [
            { field: 'id', headerName: 'Part Number', pinned: 'left' },
            { field: 'description', headerName: 'Description' },
            { field: 'category', headerName: 'Category' },
            {
                field: 'scheduledQuantity',
                headerName: 'Schedule',
                type: 'numberColumn',
            },
            ...[...Array(dayjs().date()).keys()].map((d, idx) => ({
                field: (idx + 1).toString(),
                valueGetter: (params: ValueGetterParams<RecordInterface>) => {
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
                field: 'balance',
                headerName: 'Balance',
                type: 'numberColumn',
                valueGetter: (params: ValueGetterParams<RecordInterface>) => {
                    if (
                        params.data?.totalQuantity &&
                        params.data.scheduledQuantity
                    ) {
                        return (
                            params.data.scheduledQuantity -
                            params.data?.totalQuantity
                        )
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
            const query = {
                select: JSON.stringify({
                    id: true,
                    description: true,
                    category: true,
                    production: {
                        where: {
                            so: {
                                createdAt: {
                                    gte: dayjs().startOf('month').toISOString(),
                                    lte: dayjs().endOf('month').toISOString(),
                                },
                            },
                        },
                        select: {
                            quantity: true,
                            createdAt: true,
                        },
                    },
                    soDetails: {
                        where: {
                            so: {
                                createdAt: {
                                    gte: dayjs().startOf('month').toISOString(),
                                    lte: dayjs().endOf('month').toISOString(),
                                },
                            },
                        },
                        select: {
                            quantity: true,
                        },
                    },
                }),
            }

            const data = await Fetch({
                url: '/finishedgoods',
                options: {
                    authToken: token,
                    params: {
                        ...query,
                    },
                },
            }).then((data) =>
                data.map(
                    (d: {
                        production: {
                            quantity: number
                            createdAt: string
                        }[]
                        soDetails: {
                            quantity: number
                        }[]
                    }) => ({
                        ...d,
                        scheduledQuantity: d.soDetails.reduce(
                            (prevVal, curVal) => prevVal + curVal.quantity,
                            0
                        ),
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

            setRecords(data)
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

export default ProductionReport
