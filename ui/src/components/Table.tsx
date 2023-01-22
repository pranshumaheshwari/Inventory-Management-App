import { AgGridReact, AgGridReactProps } from 'ag-grid-react'
import { Box, Skeleton } from '@mui/material'
import React, { useMemo, useRef } from 'react'

import { ColDef } from 'ag-grid-community'

export interface TableInterface<T> extends AgGridReactProps<T> {
    fileName?: string
}

function Table<Type>({
    columnDefs,
    fileName,
    rowData,
    defaultColDef,
    ...otherProps
}: TableInterface<Type>) {
    const gridRef = useRef<AgGridReact<Type>>(null)

    const cDefaultColDef = useMemo(
        () => ({
            sortable: true,
            filter: true,
            resizable: true,
            ...defaultColDef,
        }),
        [defaultColDef]
    )

    const columnTypes = useMemo(
        () => ({
            numberColumn: {
                filter: 'agNumberColumnFilter',
                filterParams: {
                    allowedCharPattern: '\\d\\-\\,',
                    numberParser: (text: string) => {
                        return text == null
                            ? null
                            : parseFloat(text.replace(',', '.'))
                    },
                },
                headerClass: 'ag-right-aligned-header',
                cellClass: 'ag-right-aligned-cell',
            },
        }),
        []
    )

    return (
        <Box width="100%" height="100%" className="ag-theme-alpine">
            {rowData ? (
                <AgGridReact<Type>
                    animateRows
                    ref={gridRef}
                    columnDefs={columnDefs}
                    rowData={rowData}
                    defaultColDef={cDefaultColDef}
                    paginationAutoPageSize
                    pagination
                    columnTypes={columnTypes}
                    onGridReady={() => {
                        gridRef.current?.api.sizeColumnsToFit()
                    }}
                    defaultExcelExportParams={{
                        fileName: fileName ? fileName + '.xlsx' : 'export.xlsx',
                        columnKeys: columnDefs
                            ?.filter(
                                (column: ColDef<Type>) => column.field !== '#'
                            )
                            .map((column: ColDef<Type>) =>
                                column.field ? column.field : ''
                            ),
                    }}
                    {...otherProps}
                />
            ) : (
                <>
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100%"
                    />
                </>
            )}
        </Box>
    )
}

export default Table
