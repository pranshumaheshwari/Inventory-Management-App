import { ColDef } from 'ag-grid-community';
import { Inventory } from '../common';
import React from 'react'
import { useNavigate } from 'react-router-dom';

export interface SalesOrdersInterface {
    id: string;
    customerId: string;
    status: string;
    soDetails: {
        fgId: string;
        quantity: number;
    }[];
    customer: {
        name: string;
    }
}

const SalesOrders = () => {
    const navigate = useNavigate()
    const columnDefs: ColDef<SalesOrdersInterface>[] = [
        { field: 'id', headerName: 'ID' },
        { headerName: 'Customer', valueGetter: ({ data }) => data?.customer.name },
        { field: 'status', headerName: 'Status' },
    ]
    const actions = [
        {
            name: 'New Sales Order',
            icon: 'add_outlined',
            onClick: () => {
                navigate("new")
            }
        }
    ]

    return (
        <Inventory<SalesOrdersInterface>
            columnDefs={columnDefs}
            addEditButton
            speedDialActions={actions}
            url='/salesorders'
            options={{
                params: {
                    include: JSON.stringify({
                        customer: {
                            select: {
                                name: true
                            }
                        },
                        soDetails: true
                    })
                }
            }}
            fileName='salesOrders_inventory'
        />
    )
}

export default SalesOrders