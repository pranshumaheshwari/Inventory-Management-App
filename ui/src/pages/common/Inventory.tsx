import { Button, Typography } from '@mui/material'
import { Fetch, useAuth } from '../../services'
import React, { useEffect, useMemo, useState } from 'react'
import { SpeedDial, Table } from '../../components'

import { ColDef } from 'ag-grid-community'
import { FetchInterface } from '../../services/fetch'
import { SpeedDialInterface } from '../../components/SpeedDial'
import { TableInterface } from '../../components/Table'
import { useNavigate } from 'react-router-dom'

interface InventoryInterface<T> extends TableInterface<T>, FetchInterface {
    columnDefs: ColDef<any>[]
    addEditButton?: boolean
    speedDialActions: SpeedDialInterface['actions']
}

function Inventory<Type>({
    columnDefs,
    addEditButton,
    speedDialActions,
    url,
    fileName,
    options,
}: InventoryInterface<Type>) {
    const {
        token: { token },
    } = useAuth()

    if (options === undefined) {
        options = {}
    }

    if (!options['authToken']) {
        options.authToken = token
    }
    const [rowData, setRowData] = useState<Type[]>()
    const fetchData = async () => {
        const data = await Fetch({ url, options })
        setRowData(data)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const navigate = useNavigate()
    const columns = useMemo(() => {
        if (addEditButton) {
            return [
                ...columnDefs,
                {
                    field: '#',
                    cellRenderer: ({ data }: { data: Type }) => (
                        <Button
                            disableElevation
                            size="medium"
                            type="submit"
                            variant="contained"
                            sx={{
                                backgroundColor: 'primary.light',
                            }}
                            onClick={() => {
                                navigate('edit', {
                                    state: data,
                                })
                            }}
                        >
                            <Typography color="secondary.dark">Edit</Typography>
                        </Button>
                    ),
                },
            ]
        }

        return columnDefs
    }, [columnDefs, addEditButton, navigate])

    return (
        <>
            <Table<Type>
                columnDefs={columns}
                fileName={fileName}
                rowData={rowData}
            />
            <SpeedDial actions={speedDialActions} />
        </>
    )
}

export default Inventory
