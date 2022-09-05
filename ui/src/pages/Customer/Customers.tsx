import React from 'react'
import { ColDef } from 'ag-grid-community'
import { useNavigate } from 'react-router-dom'
import { Inventory } from '../common'

export interface CustomerInterface {
    id: string;
    name: string;
    address1?: string;
    address2?: string;
    city: string;
    state: string;
    gst: string;
}

const Customers = () => {
    const navigate = useNavigate()
    const columnDefs: ColDef<CustomerInterface>[] = [
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
            name: 'New Customer',
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
            url='/customer'
            fileName='customer_list'
            columnDefs={columnDefs}
        />
    )
}

export default Customers