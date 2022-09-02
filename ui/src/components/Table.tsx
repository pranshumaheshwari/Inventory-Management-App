import React, { useEffect, useMemo, useRef, useState } from 'react'

import { AgGridReact, AgGridReactProps } from 'ag-grid-react'
import { FetchInterface } from '../services/fetch'
import { Fetch, useAuth } from '../services'
import { Box, Skeleton } from '@mui/material'
import { ColDef } from 'ag-grid-community'

interface TableInterface extends FetchInterface, AgGridReactProps { }

function Table<Type>({ columnDefs, url, options, ...otherProps }: TableInterface) {
    const [rowData, setRowData] = useState<Type[]>()
    const gridRef = useRef<AgGridReact<Type>>(null);

    if (options == undefined) {
        options = {}
    }

    ({ token: { token: options.authToken } } = useAuth())

    const fetchData = async () => {
        const data = await Fetch({ url, options })
        setRowData(data)
    }

    useEffect(() => {
        fetchData()
    }, [rowData])

    const defaultColDef = useMemo((): ColDef => ({
		sortable: true,
		filter: true,
        resizable: true
	 }), [])

    const columnTypes = useMemo(() => ({
        numberColumn: {
            filter: 'agNumberColumnFilter',
            filterParams: {
                allowedCharPattern: '\\d\\-\\,',
                numberParser: (text: string) => {
                    return text == null ? null : parseFloat(text.replace(',', '.'));
                }
            },
            headerClass: 'ag-right-aligned-header',
            cellClass: 'ag-right-aligned-cell'
        }
    }), [])

    return (
        <Box width="100%" height="100%" className="ag-theme-alpine">
            {
                rowData ? (
                    <AgGridReact<Type>
                        animateRows
                        ref={gridRef}
                        columnDefs={columnDefs}
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        columnTypes={columnTypes}
                        onGridReady={() => {
                            gridRef.current?.api.sizeColumnsToFit()
                        }}
                        {...otherProps}
                    />
                ) : (
                    <>
                        <Skeleton variant='rectangular' width="100%" height="100%" />
                    </>
                )
            }
        </Box>
    )
}

export default Table