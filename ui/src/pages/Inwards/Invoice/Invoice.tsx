import { ColDef } from 'ag-grid-community';
import { Inventory } from '../../common';
import React from 'react'
import { useNavigate } from 'react-router-dom';

export interface InvoiceInterface {
	supplierId: string;
	supplier: {
		name: string;
	}
	invoiceNumber: string;
	status: string;
	rm: {
		rmId: string;
		quantity: number;
	}[]
}

const Invoice = () => {
	const navigate = useNavigate()
	const columnDefs: ColDef<InvoiceInterface>[] = [
		{ headerName: 'Supplier', valueGetter: ({ data }) => data?.supplier.name },
		{ headerName: 'Invoice', field: 'invoiceNumber' },
		{ headerName: 'Status', field: 'status' },
	]
	const actions = [
		{
			name: 'New Invoice',
			icon: 'add_outlined',
			onClick: () => {
				navigate("new")
			}
		}
	]

	return (
		<Inventory<InvoiceInterface>
			columnDefs={columnDefs}
			addEditButton
			speedDialActions={actions}
			url='/inwards/invoice'
			fileName='Invoice_inventory'
			options={{
                params: {
                    include: JSON.stringify({
                        supplier: true
                    })
                },
				postFetch: (data) => {
					const invoice: InvoiceInterface[] = []
					for (const d of data) {
						let index = invoice.findIndex(val => {
							if((val as InvoiceInterface).invoiceNumber === d.invoiceNumber) {
								return true
							}
							return false
						})
						if(index !== -1) {
							invoice[index].rm.push({
								rmId: d.rmId,
								quantity: d.quantity
							})
						} else {
							invoice.push({
								invoiceNumber: d.invoiceNumber,
								rm: [{
									rmId: d.rmId,
									quantity: d.quantity
								}],
								status: d.status,
								supplier: {
									name: d.supplier.name
								},
								supplierId: d.supplier.id
							})
						}
					}
					return invoice
				}
            }}
		/>
	)
}

export default Invoice