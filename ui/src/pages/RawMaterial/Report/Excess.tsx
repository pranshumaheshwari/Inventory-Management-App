import { Box, Grid, Skeleton, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import React, { useEffect, useState } from 'react'

import { ColDef } from 'ag-grid-community'
import { Table } from '../../../components'

interface RecordInterface {}

function ExcessReport() {
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [records, setRecords] = useState<RecordInterface[]>([])

    const columnDefs: ColDef<RecordInterface>[] = [
        { field: 'id', headerName: 'Identifier' },
        { field: 'dtplCode', headerName: 'DTPL Part Number' },
        { field: 'description', headerName: 'Description' },
        {
            field: 'storeStock',
            headerName: 'Store Stock',
            type: 'numberColumn',
        },
        {
            field: 'lineStock',
            headerName: 'Line Stock',
            type: 'numberColumn',
        },
        {
            field: 'poPendingStock',
            headerName: 'PO Pending Stock',
            type: 'numberColumn',
        },
        {
            field: 'iqcPendingStock',
            headerName: 'IQC Pending Stock',
            type: 'numberColumn',
        },
        {
            field: 'requiredQuantity',
            headerName: 'Required Stock',
            type: 'numberColumn',
        },
    ]

    const fetchRecords = async () => {
        try {
            const requiredQuantity: { [key: string]: number } = {}
            const data: {
                production: {
                    quantity: number
                    fg: {
                        bom: {
                            rmId: string
                            quantity: number
                        }[]
                    }
                }[]
                soDetails: {
                    quantity: number
                    fg: {
                        bom: {
                            rmId: string
                            quantity: number
                        }[]
                    }
                }[]
            }[] = await Fetch({
                url: '/salesorders',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            status: 'Open',
                        }),
                        select: JSON.stringify({
                            soDetails: {
                                select: {
                                    fg: {
                                        select: {
                                            bom: {
                                                select: {
                                                    rmId: true,
                                                    quantity: true,
                                                },
                                            },
                                        },
                                    },
                                    quantity: true,
                                },
                            },
                        }),
                    },
                },
            })

            data.forEach((d) => {
                d.soDetails.forEach((s) => {
                    s.fg.bom.forEach((b) => {
                        requiredQuantity[b.rmId] = requiredQuantity[b.rmId]
                            ? requiredQuantity[b.rmId] + b.quantity * s.quantity
                            : b.quantity * s.quantity
                    })
                })
            })

            const rawmaterials = await Fetch({
                url: '/rawmaterial',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            description: true,
                            dtplCode: true,
                            storeStock: true,
                            lineStock: true,
                            poPendingStock: true,
                            iqcPendingStock: true,
                        }),
                    },
                },
            }).then(
                (
                    rms: {
                        id: string
                        description: string
                        dtplCode: string
                        storeStock: number
                        lineStock: number
                        poPendingStock: number
                        iqcPendingStock: number
                    }[]
                ) =>
                    rms
                        .map((rm) => ({
                            ...rm,
                            totalQuantity:
                                rm.iqcPendingStock +
                                rm.lineStock +
                                rm.poPendingStock +
                                rm.storeStock,
                        }))
                        .map((rm) => {
                            const requiredQty = requiredQuantity[rm.id]
                                ? requiredQuantity[rm.id]
                                : 0
                            return {
                                ...rm,
                                requiredQuantity: requiredQty,
                                excessQuantity: rm.totalQuantity - requiredQty,
                            }
                        })
                        .filter((rm) => {
                            if (rm.excessQuantity > 0) {
                                return true
                            }
                            return false
                        })
            )

            setRecords(rawmaterials)
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

export default ExcessReport
