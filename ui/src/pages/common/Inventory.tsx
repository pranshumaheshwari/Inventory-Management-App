import React, { useMemo } from 'react'
import { Button, Typography } from '@mui/material';
import { ColDef } from 'ag-grid-community'
import { useNavigate } from 'react-router-dom'
import { SpeedDial, Table } from '../../components'
import { SpeedDialInterface } from '../../components/SpeedDial';
import { TableInterface } from '../../components/Table';
import { FetchInterface } from '../../services/fetch';

interface InventoryInterface extends TableInterface {
    columnDefs: ColDef<any>[];
    addEditButton?: boolean;
    speedDialActions: SpeedDialInterface["actions"];
    options?: FetchInterface["options"]
}

function Inventory<Type>({ columnDefs, addEditButton, speedDialActions, url, fileName, options }: InventoryInterface) {
    const navigate = useNavigate()
    const columns = useMemo(() => {
        if (addEditButton) {
            return [...columnDefs, {
                field: '#',
                cellRenderer: ({ data }: {
                    data: Type
                }) => (
                    <Button
                        disableElevation
                        size="medium"
                        type="submit"
                        variant="contained"
                        sx={{
                            backgroundColor: 'primary.light',
                        }}
                        onClick={() => {
                            navigate("edit", {
                                state: data
                            })
                        }}
                    >
                        <Typography color='secondary.dark'>
                            Edit
                        </Typography>
                    </Button>
                )
            }]
        }

        return columnDefs
    }, [])

    return (
        <>
            <Table<Type> columnDefs={columns} url={url} fileName={fileName} options={options} />
            <SpeedDial actions={speedDialActions} />
        </>
    )
}

export default Inventory