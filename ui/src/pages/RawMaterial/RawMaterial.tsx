import { ColDef } from 'ag-grid-community'
import { IconPlus } from '@tabler/icons-react'
import { Inventory } from '../common'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export interface RawMaterialInterface {
    id: string
    description: string
    dtplCode: string
    category: string
    supplierId: string
    unit: string
    price: number
    storeStock: number
    iqcPendingStock: number
    poPendingStock: number
    lineStock: number
}

const RawMaterial = () => {
    const navigate = useNavigate()
    const columnDefs: ColDef<RawMaterialInterface>[] = [
        { field: 'id', headerName: 'Part Number' },
        { field: 'description', headerName: 'Description' },
        { field: 'dtplCode', headerName: 'DTPL Part Number' },
        { field: 'category', headerName: 'Category' },
        {
            field: 'poPendingStock',
            headerName: 'PO Verification Pending Stock',
            type: 'numberColumn',
        },
        {
            field: 'iqcPendingStock',
            headerName: 'IQC Pending Stock',
            type: 'numberColumn',
        },
        {
            field: 'storeStock',
            headerName: 'Store Stock',
            type: 'numberColumn',
        },
        { field: 'lineStock', headerName: 'Line Stock', type: 'numberColumn' },
        {
            field: 'iqcRejectedStock',
            headerName: 'IQC Rejected Stock',
            type: 'numberColumn',
        },
        {
            field: 'poRejectedStock',
            headerName: 'PO Rejected Stock',
            type: 'numberColumn',
        },
    ]
    const actions = [
        {
            name: 'New Raw Material',
            icon: IconPlus,
            onClick: () => {
                navigate('new')
            },
        },
    ]

    return (
        <Inventory<RawMaterialInterface>
            columnDefs={columnDefs}
            addEditButton
            affixActions={actions}
            url="/rawmaterial"
            fileName="rawmaterial_inventory"
        />
    )
}

export default RawMaterial
