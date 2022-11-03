import { ColDef } from 'ag-grid-community';
import { Inventory } from '../common';
import React from 'react'
import { useNavigate } from 'react-router-dom';

export interface PurchaseOrdersInterface {
    id: string;
    supplierId: string;
    status: string;
    poDetails: {
        rmId: string;
        quantity: number;
    }[];
    supplier: {
        name: string;
    }
}

const PurchaseOrders = () => {
    const navigate = useNavigate()
    const columnDefs: ColDef<PurchaseOrdersInterface>[] = [
        { field: 'id', headerName: 'ID' },
        { headerName: 'Supplier', valueGetter: ({ data }) => data?.supplier.name },
        { field: 'status', headerName: 'Status' },
    ]
    const actions = [
        {
            name: 'New Purchase Order',
            icon: 'add_outlined',
            onClick: () => {
                navigate("new")
            }
        },
        {
            name: 'Create Purchase Order From Sales Order',
            icon: 'create_outlined',
            onClick: () => {
                navigate("newFromSalesOrder")
            }
        }
    ]

    return (
        <Inventory<PurchaseOrdersInterface>
            columnDefs={columnDefs}
            addEditButton
            speedDialActions={actions}
            url='/purchaseorders'
            options={{
                params: {
                    include: JSON.stringify({
                        supplier: {
                            select: {
                                name: true
                            }
                        },
                        poDetails: {
                            select: {
                                rmId: true,
                                quantity: true
                            }
                        }
                    })
                }
            }}
            fileName='purchaseOrders_inventory'
        />
    )
}

export default PurchaseOrders