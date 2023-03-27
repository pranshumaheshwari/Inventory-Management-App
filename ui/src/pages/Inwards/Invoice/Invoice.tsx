import { ColDef } from 'ag-grid-community'
import { IconPlus } from '@tabler/icons-react'
import { Inventory } from '../../common'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export interface InvoiceInterface {
    supplierId: string
    supplier: {
        name: string
    }
    id: string
    status: string
    invoiceDetails: {
        rmId: string
        quantity: number
    }[]
    date: Date
}

const Invoice = () => {
    const navigate = useNavigate()
    const columnDefs: ColDef<InvoiceInterface>[] = [
        {
            headerName: 'Supplier',
            valueGetter: ({ data }) => data?.supplier.name,
        },
        { headerName: 'Invoice', field: 'id' },
        { headerName: 'Status', field: 'status' },
    ]
    const actions = [
        {
            name: 'New Invoice',
            icon: IconPlus,
            onClick: () => {
                navigate('new')
            },
        },
    ]

    return (
        <Inventory<InvoiceInterface>
            columnDefs={columnDefs}
            addEditButton
            affixActions={actions}
            url="/invoice"
            fileName="Invoice_inventory"
            options={{
                params: {
                    include: JSON.stringify({
                        supplier: true,
                        invoiceDetails: {
                            select: {
                                rmId: true,
                                quantity: true,
                            },
                        },
                    }),
                },
            }}
        />
    )
}

export default Invoice
