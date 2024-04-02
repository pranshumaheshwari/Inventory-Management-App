import { ColDef } from 'ag-grid-community'
import { IconPlus } from '@tabler/icons-react'
import { Inventory } from '../common'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export interface FinishedGoodsInterface {
    id: string
    description: string
    category: string
    customerId: string
    price: number
    storeStock: number
    manPower: number
    overheads: number
    oqcPendingStock?: number
    bom: {
        rmId: string
        quantity: number
    }[]
}

const FinishedGoods = () => {
    const navigate = useNavigate()
    const columnDefs: ColDef<FinishedGoodsInterface>[] = [
        { field: 'id', headerName: 'Part Number', pinned: 'left' },
        { field: 'description', headerName: 'Description' },
        {
            field: 'category',
            headerName: 'Category',
            valueGetter: (value) => {
                return value.data?.category.replaceAll('_', ' ')
            },
        },
        {
            field: 'storeStock',
            headerName: 'Store Stock',
            type: 'numberColumn',
        },
        {
            field: 'oqcPendingStock',
            headerName: 'OQC Pending Stock',
            type: 'numberColumn',
        },
        { field: 'price', headerName: 'Price', type: 'numberColumn' },
        {
            headerName: 'Value',
            type: 'numberColumn',
            valueGetter: (data) => {
                if (data.data) {
                    return Math.floor(
                        data.data.price *
                            (data.data.storeStock + (data.data.oqcPendingStock ? data.data.oqcPendingStock : 0))
                    )
                }
            },
        },
    ]
    const actions = [
        {
            name: 'New Finished Good',
            icon: IconPlus,
            onClick: () => {
                navigate('new')
            },
        },
    ]

    return (
        <Inventory<FinishedGoodsInterface>
            columnDefs={columnDefs}
            addEditButton
            affixActions={actions}
            url="/finishedgoods"
            options={{
                params: {
                    include: JSON.stringify({
                        bom: true,
                    }),
                },
            }}
            fileName="finishedgoods_inventory"
        />
    )
}

export default FinishedGoods
