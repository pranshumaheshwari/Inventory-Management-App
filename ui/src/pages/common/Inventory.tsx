import { Affix, Table } from '../../components'
import { Fetch, useAuth } from '../../services'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { AffixInterface } from '../../components/Affix'
import { AgGridReact } from 'ag-grid-react'
import { Button } from '@mantine/core'
import { ColDef } from 'ag-grid-community'
import { FetchInterface } from '../../services/fetch'
import { IconEdit } from '@tabler/icons-react'
import { TableInterface } from '../../components/Table'
import { useNavigate } from 'react-router-dom'

interface InventoryInterface<T> extends TableInterface<T>, FetchInterface {
    columnDefs: ColDef<any>[]
    addEditButton?: boolean
    affixActions: AffixInterface['actions']
}

function Inventory<Type>({
    columnDefs,
    addEditButton,
    affixActions,
    url,
    fileName,
    options,
}: InventoryInterface<Type>) {
    const gridRef = useRef<AgGridReact<Type>>(null)

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
        gridRef.current?.api.sizeColumnsToFit()
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
                            size="md"
                            type="submit"
                            variant="subtle"
                            sx={{
                                backgroundColor: 'primary.light',
                            }}
                            onClick={() => {
                                navigate('edit', {
                                    state: data,
                                })
                            }}
                        >
                            <IconEdit />
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
                ref={gridRef}
                columnDefs={columns}
                fileName={fileName}
                rowData={rowData}
            />
            <Affix actions={affixActions} />
        </>
    )
}

export default Inventory
