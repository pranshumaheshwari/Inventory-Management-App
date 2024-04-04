import { IconEdit, IconPlus } from '@tabler/icons-react'

import { ColDef } from 'ag-grid-community'
import { Inventory } from '../common'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export interface PurchaseOrdersInterface {
    id: string
    supplierId: string
    status: "Open" | "Closed"
    poDetails: {
        rmId: string
        quantity: number
        price: number
    }[]
    supplier: {
        name: string
    }
}

const PurchaseOrders = () => {
    const navigate = useNavigate()
    const columnDefs: ColDef<PurchaseOrdersInterface>[] = [
        { field: 'id', headerName: 'ID' },
        {
            headerName: 'Supplier',
            valueGetter: ({ data }) => data?.supplier.name,
        },
        { field: 'status', headerName: 'Status', sort: 'desc' },
    ]
    const actions = [
        {
            name: 'New Purchase Order',
            icon: IconPlus,
            onClick: () => {
                navigate('new')
            },
        },
        {
            name: 'Create Purchase Order From Sales Order',
            icon: IconEdit,
            onClick: () => {
                navigate('newFromSalesOrder')
            },
        },
    ]

    return (
        <Inventory<PurchaseOrdersInterface>
            columnDefs={columnDefs}
            addEditButton
            affixActions={actions}
            url="/purchaseorders"
            options={{
                params: {
                    include: JSON.stringify({
                        supplier: {
                            select: {
                                name: true,
                            },
                        },
                        poDetails: {
                            select: {
                                rmId: true,
                                quantity: true,
                                price: true,
                            },
                        },
                    }),
                },
            }}
            fileName="purchaseOrders_inventory"
        />
    )
}

export default PurchaseOrders
