import { AgGridReact, AgGridReactProps } from 'ag-grid-react'
import { Box, Skeleton } from '@mui/material'
import { Fetch, useAuth } from '../services'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { ColDef } from 'ag-grid-community'
import { FetchInterface } from '../services/fetch'

export interface TableInterface extends FetchInterface, AgGridReactProps {
    fileName?: string;
}

function Table<Type>({ columnDefs, url, options, fileName, ...otherProps }: TableInterface) {
    const [rowData, setRowData] = useState<Type[]>()
    const gridRef = useRef<AgGridReact<Type>>(null);

    if (options === undefined) {
        options = {}
    }

    ({ token: { token: options.authToken } } = useAuth())

    const fetchData = async () => {
        const data = await Fetch({ url, options })
        setRowData(data)
    }

    useEffect(() => {
        fetchData()
    }, [])

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
                        defaultExcelExportParams={{
                            fileName: fileName ? fileName + '.xlsx' : 'export.xlsx',
                            columnKeys: columnDefs?.filter((column: ColDef<Type>) => column.field !== '#')
                                        .map((column: ColDef<Type>) => (column.field ? column.field : ''))
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