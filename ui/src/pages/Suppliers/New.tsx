import { Grid } from '@mui/material'
import React from 'react'
import Form from './components/Form'

const NewSupplier = () => {
	return (
		<Grid
			container
			direction="column"
			height="100%"
			width="100%"
			justifyContent="space-evenly"
			alignItems="center"
		>
			<Grid item xs={12}>
				<Form />
			</Grid>
		</Grid>
	)
}

export default NewSupplier