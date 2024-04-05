import { AgGridReact, AgGridReactProps } from 'ag-grid-react'
import { Box, Skeleton } from '@mantine/core'
import React, { useCallback, useMemo, useState } from 'react'

import { ColDef, GetContextMenuItemsParams, MenuItemDef } from 'ag-grid-community'

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
    const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), [])
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), [])
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

    const getContextMenuItems = useCallback((params: GetContextMenuItemsParams): (string | MenuItemDef)[] => [
        "copy",
        "export",
        {
            name: "Print",
            action: () => {
                const eGridDiv = document.querySelector<HTMLElement>("#myGrid")! as any
                eGridDiv.style.width = ""
                eGridDiv.style.height = ""
                params.api.setGridOption("domLayout", "print")
                setTimeout(() => {
                    window.print() 
                    const eGridDiv = document.querySelector<HTMLElement>("#myGrid")! as any
                    eGridDiv.style.width = "100%"
                    eGridDiv.style.height = "100%"
                    params.api.setGridOption("domLayout", "autoHeight")
                  }, 2000)
            },
          },
    ], [window])

    return (
        <Box style={containerStyle}>
            {rowData ? (
                <div
                id="myGrid"
                style={gridStyle}
                className="ag-theme-alpine">
                    <AgGridReact<Type>
                        animateRows
                        columnDefs={columnDefs ? [
                            {
                                headerName: "#", 
                                valueGetter: "node.rowIndex + 1",
                                pinned: "left",
                            }, ...columnDefs] : null}
                        rowData={rowData}
                        defaultColDef={cDefaultColDef}
                        columnTypes={columnTypes}
                        domLayout={domLayout}
                        getContextMenuItems={getContextMenuItems}
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
                </div>
            ) : (
                <>
                    <Skeleton width="100%" height="100%" />
                </>
            )}
        </Box>
    )
}

export default Table
