import { AgGridReact, AgGridReactProps } from 'ag-grid-react'
import { Box, Skeleton } from '@mantine/core'
import React, { useMemo } from 'react'

import { ColDef } from 'ag-grid-community'

export interface TableInterface<T> extends AgGridReactProps<T> {
    fileName?: string
    ref?: React.RefObject<AgGridReact<T>>
}

function Table<Type>({
    columnDefs,
    fileName,
    rowData,
    defaultColDef,
    domLayout = 'normal',
    ...otherProps
}: TableInterface<Type>) {
    const cDefaultColDef = useMemo(
        () => ({
            sortable: true,
            filter: true,
            resizable: true,
            ...defaultColDef,
        }),
        [defaultColDef]
    )

    const columnTypes = useMemo<{ [key: string]: ColDef<Type> }>(
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
                valueFormatter: (params) => {
                    return Number(params.value).toFixed(5).toString()
                },
            },
        }),
        []
    )

    return (
        <Box w="100%" h="100%" className="ag-theme-alpine">
            {rowData ? (
                <AgGridReact<Type>
                    animateRows
                    columnDefs={columnDefs ? [{headerName: "#", valueGetter: "node.rowIndex + 1"}, ...columnDefs] : null}
                    rowData={rowData}
                    defaultColDef={cDefaultColDef}
                    columnTypes={columnTypes}
                    domLayout={domLayout}
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
                    <Skeleton width="100%" height="100%" />
                </>
            )}
        </Box>
    )
}

export default Table
