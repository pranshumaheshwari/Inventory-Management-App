import React from 'react'
import { ColDef } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import { Inventory } from '../common';

export interface FinishedGoodsInterface {
    id: string;
    description: string;
    category: string;
	customerId: string;
    price: number;
    storeStock: number;
    manPower: number;
    overheads: number;
    bom: {
        rmId: string;
        quantity: number;
    }[]
}

const FinishedGoods = () => {
    const navigate = useNavigate()
	const columnDefs: ColDef<FinishedGoodsInterface>[] = [
		{ field: 'id', headerName: 'Part Number' },
		{ field: 'description', headerName: 'Description' },
		{ field: 'category', headerName: 'Category' },
		{ field: 'storeStock', headerName: 'Store Stock', type: 'numberColumn' },
		{ field: 'price', headerName: 'Price', type: 'numberColumn' },
	]
    const actions = [
        {
            name: 'New Finished Good',
            icon: 'add_outlined',
            onClick: () => {
                navigate("new")
            }
        }
    ]

	return (
        <Inventory<FinishedGoodsInterface>
            columnDefs={columnDefs}
            addEditButton
            speedDialActions={actions}
            url='/finishedgoods'
            options={{
                params: {
                    include: JSON.stringify({
                        bom: true
                    })
                }
            }}
            fileName='finishedgoods_inventory'
        />
	)
}

export default FinishedGoods