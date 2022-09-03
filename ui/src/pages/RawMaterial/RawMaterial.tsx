import React, { useState } from 'react'
import { ColDef } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import { SpeedDial, Table } from '../../components'
import { Button, Typography } from '@mui/material';

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
	const [columnDefs, setColumnDefs] = useState<ColDef<RawMaterialInterface>[]>([
		{ field: 'id', headerName: 'Part Number' },
		{ field: 'description', headerName: 'Description' },
		{ field: 'dtplCode', headerName: 'DTPL Part Number' },
		{ field: 'category', headerName: 'Category' },
		{ field: 'iqcPendingStock', headerName: 'IQC Pending Stock', type: 'numberColumn' },
		{ field: 'storeStock', headerName: 'Store Stock', type: 'numberColumn' },
		{ field: 'lineStock', headerName: 'Line Stock', type: 'numberColumn' },
		{
            field: '#',
            cellRenderer: ({ data }: {
                data: RawMaterialInterface
            }) => (
                <Button
                    disableElevation
                    size="medium"
                    type="submit"
                    variant="contained"
                    sx={{
                        backgroundColor: 'primary.light',
                    }}
                    onClick={() => {
                        navigate("edit", {
                            state: data
                        })
                    }}
                >
                    <Typography color='secondary.dark'>
                        Edit
                    </Typography>
                </Button>
            )
        }
	])

	return (
		<>
			<Table<RawMaterialInterface> columnDefs={columnDefs} url="/rm" />
			<SpeedDial actions={[
				{
					name: 'New Raw Material',
					icon: 'add_outlined',
					onClick: () => {
						navigate("new")
					}
				}
			]} />
		</>
	)
}

export default RawMaterial