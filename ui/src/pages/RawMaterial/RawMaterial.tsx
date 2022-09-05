import React from 'react'
import { ColDef } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import { Inventory } from '../common';

export interface RawMaterialInterface {
    id: string;
    description: string;
    dtplCode: string;
    category: string;
	supplierId: string;
    unit: string;
    price: number;
    storeStock: number;
    iqcPendingStock: number;
    lineStock: number;
}

const RawMaterial = () => {
    const navigate = useNavigate()
	const columnDefs: ColDef<RawMaterialInterface>[] = [
		{ field: 'id', headerName: 'Part Number' },
		{ field: 'description', headerName: 'Description' },
		{ field: 'dtplCode', headerName: 'DTPL Part Number' },
		{ field: 'category', headerName: 'Category' },
		{ field: 'iqcPendingStock', headerName: 'IQC Pending Stock', type: 'numberColumn' },
		{ field: 'storeStock', headerName: 'Store Stock', type: 'numberColumn' },
		{ field: 'lineStock', headerName: 'Line Stock', type: 'numberColumn' },
	]
    const actions = [
        {
            name: 'New Raw Material',
            icon: 'add_outlined',
            onClick: () => {
                navigate("new")
            }
        }
    ]

	return (
        <Inventory<RawMaterialInterface>
            columnDefs={columnDefs}
            addEditButton
            speedDialActions={actions}
            url='/rawmaterial'
            fileName='rawmaterial_inventory'
        />
	)
}

export default RawMaterial