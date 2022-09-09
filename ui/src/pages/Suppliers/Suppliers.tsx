import React from 'react'
import { ColDef } from 'ag-grid-community'
import { useNavigate } from 'react-router-dom'
import { Inventory } from '../common'

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
    const columnDefs: ColDef<SupplierInterface>[] = [
        { field: 'id' },
        { field: 'name', headerName: 'Name' },
        {
            valueGetter: ({ data }) => {
                return [data?.address1, data?.address2].join(" ")
            }, headerName: 'Address'
        },
        { field: 'gst', headerName: 'GST' },
    ]

    const actions = [
        {
            name: 'New Supplier',
            icon: 'add_outlined',
            onClick: () => {
                navigate("new")
            }
        }
    ]

    return (
        <Inventory
            addEditButton
            speedDialActions={actions}
            url='/suppliers'
            fileName='supplier_list'
            columnDefs={columnDefs}
        />
    )
}

export default Suppliers