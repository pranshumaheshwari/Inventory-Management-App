import { ColDef } from 'ag-grid-community'
import { IconPlus } from '@tabler/icons-react'
import { Inventory } from '../common'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export interface SupplierInterface {
    id: string
    name: string
    address1?: string
    address2?: string
    city: string
    state: string
    gst: string
}

const Suppliers = () => {
    const navigate = useNavigate()
    const columnDefs: ColDef<SupplierInterface>[] = [
        { field: 'id' },
        { field: 'name', headerName: 'Name' },
        {
            valueGetter: ({ data }) => {
                return [data?.address1, data?.address2].join(' ')
            },
            headerName: 'Address',
        },
        { field: 'gst', headerName: 'GST' },
    ]

    const actions = [
        {
            name: 'New Supplier',
            icon: IconPlus,
            onClick: () => {
                navigate('new')
            },
        },
    ]

    return (
        <Inventory
            addEditButton
            affixActions={actions}
            url="/suppliers"
            fileName="supplier_list"
            columnDefs={columnDefs}
        />
    )
}

export default Suppliers
