import { Button, Typography } from '@mui/material';
import { ColDef } from 'ag-grid-community'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SpeedDial, Table } from '../../components'

export interface SupplierInterface {
    id: string;
    name: string;
    address1?: string;
    address2?: string;
    city: string;
    state: string;
    gst: string;
}

const Suppliers = () => {
    const navigate = useNavigate()
    const [columnDefs, setColumnDefs] = useState<ColDef<SupplierInterface>[]>([
        { field: 'id' },
        { field: 'name', headerName: 'Name' },
        {
            valueGetter: ({ data }) => {
                return [data?.address1, data?.address2].join(" ")
            }, headerName: 'Address'
        },
        { field: 'gst', headerName: 'GST' },
        {
            field: '#',
            cellRenderer: ({ data }: {
                data: SupplierInterface
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
        }
    ])

    return (
        <>
            <Table<SupplierInterface> columnDefs={columnDefs} url="/supplier" />
            <SpeedDial actions={[
                {
                    name: 'New Supplier',
                    icon: 'add_outlined',
                    onClick: () => {
                        navigate("new")
                    }
                }
            ]} />
        </>
    )
}

export default Suppliers