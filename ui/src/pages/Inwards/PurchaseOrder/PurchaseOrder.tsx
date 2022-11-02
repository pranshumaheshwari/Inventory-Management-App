import * as Yup from 'yup'

import { Autocomplete, Button, Divider, FormHelperText, Grid, InputLabel, OutlinedInput, SelectChangeEvent, Skeleton, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material'
import { Fetch, useAuth } from '../../../services'
import { Field, FieldArray, Formik, FormikHelpers } from 'formik'
import React, { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react'

import { FormInput } from '../../../components'
import FormSelect from '../../../components/FormSelect'
import { RawMaterialInterface } from '../../RawMaterial/RawMaterial'
import { useNavigate } from 'react-router-dom'

export interface InwardsPurchaseOrderInterface {
	supplierId: string;
	invoiceNumber: string;
	poId: string;
	rm: {
		rmId: string;
		quantity: number;
	}[]
	status: string;
}

interface FormValues extends Required<InwardsPurchaseOrderInterface> {
	submit: null;
}

const PurchaseOrder = () => {
	const navigate = useNavigate()
	const { token: { token } } = useAuth()
	const [supplier, setSupplier] = useState<{ value: string }[] | null>()
	const [invoice, setInvoice] = useState<{ value: string }[] | null>([])
	const [po, setPo] = useState<{ value: string }[] | null>([])
	const [error, setError] = useState('')
	const [activeStep, setActiveStep] = React.useState(0)
	const [rawmaterial, setRawmaterial] = useState<Partial<RawMaterialInterface>[]>([])
	const [rawmaterialIdentifier, setRawmaterialIdentifier] = useState<keyof RawMaterialInterface>('description')
	const [selectedRm, setSelectedRm] = useState<{ rm: Partial<RawMaterialInterface>, quantity: number }>({
		rm: {},
		quantity: 0
	})
	let initialValues: FormValues = {
		supplierId: '',
		invoiceNumber: '',
		poId: '',
		rm: [],
		status: 'IQC',
		submit: null
	}

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1)
	}

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1)
	}

	const onSubmit = async (values: FormValues, { setErrors, setStatus, setSubmitting }: FormikHelpers<FormValues>) => {
		try {
			const data = Array.from(values.rm).map(val => ({
				...val,
				poId: values.poId,
				supplierId: values.supplierId,
				invoiceNumber: values.invoiceNumber,
				status: values.status
			}))
			await Fetch({
				url: '/inwards/purchaseOrders',
				options: {
					method: "POST",
					body: {
						data
					},
					authToken: token
				}
			})
			navigate('..')
		} catch (err) {
			setStatus({ success: false })
			setErrors({ submit: (err as Error).message })
			setSubmitting(false)
		}
	}

	const getSupplier = async () => {
		try {
			const data = await Fetch({
				url: '/suppliers',
				options: {
					authToken: token
				}
			}).then(data => {
				return data.map((customer: {
					name: string;
					id: string;
				}) => ({
					label: customer.name,
					value: customer.id
				}))
			})
			setSupplier(data)
		} catch (e) {
			setError((e as Error).message)
		}
	}

	const updateInvoice = async (supplierId: string) => {
		try {
			const data = await Fetch({
				url: '/inwards/invoice',
				options: {
					authToken: token,
					params: {
						where: JSON.stringify({
							supplierId
						}),
						select: JSON.stringify({
							invoiceNumber: true
						})
					}
				}
			}).then(data => {
				return data.map((invoice: {
					invoiceNumber: string;
				}) => ({
					value: invoice.invoiceNumber
				}))
			})
			setInvoice(data)
		} catch (e) {
			setError((e as Error).message)
		}
	}

	const updatePo = async (supplierId: string) => {
		try {
			const data = await Fetch({
				url: '/purchaseorders',
				options: {
					authToken: token,
					params: {
						where: JSON.stringify({
							supplierId
						}),
						select: JSON.stringify({
							id: true
						})
					}
				}
			}).then(data => {
				return data.map((po: {
					id: string;
				}) => ({
					value: po.id
				}))
			})
			setPo(data)
		} catch (e) {
			setError((e as Error).message)
		}
	}

	const updateRawMaterials = async (poId: string) => {
		try {
			const data = await Fetch({
				url: '/purchaseorders',
				options: {
					authToken: token,
					params: {
						where: JSON.stringify({
							id: poId
						}),
						select: JSON.stringify({
							poDetails: {
								select: {
									rm: {
										select: {
											id: true,
											description: true,
											dtplCode: true,
										}
									}
								}
							}
						})
					}
				}
			}).then(data => data[0]).then(data => data.poDetails).then(data => data.map((d: {
				rm: object
			}) => d.rm))
			setRawmaterial(data)
		} catch (e) {
			setError((e as Error).message)
		}
	}

	const updateSupplier = async (supplierId: string) => {
		updateInvoice(supplierId)
		updatePo(supplierId)
	}

	useEffect(() => {
		Promise.all([
			getSupplier(),
		])
	}, [])

	if (error) {
		<Grid item xs={12}>
			<FormHelperText error>{error}</FormHelperText>
		</Grid>
	}

	if (!supplier) {
		return (
			<Skeleton width="90vw" height="100%" />
		)
	}

	return (
		<Formik
			initialValues={initialValues}
			validationSchema={
				Yup.object().shape({
					invoiceNumber: Yup.string().required('Invoice No is required'),
					supplierId: Yup.string().required('Supplier is required'),
					poId: Yup.string().required('Purchase Order is required'),
					status: Yup.string().required('Status is required'),
					rm: Yup.array().of(Yup.object().shape({
						rmId: Yup.string().required('Raw Material Identifier is required'),
						quantity: Yup.number().min(0).required('Quantity is required')
					})).min(1),
				})
			}
			onSubmit={onSubmit}
		>
			{({ values, errors, handleSubmit, isSubmitting, handleChange }) => (
				<form noValidate onSubmit={handleSubmit}>
					<Grid container spacing={3}>
						<Grid item xs={3} />
						<Grid item xs={6}>
							<Stepper activeStep={activeStep}>
								{
									["Basic Details", "Raw Material"].map((label, index) => {
										const stepProps: { completed?: boolean } = {}
										const labelProps: {
											optional?: React.ReactNode
										} = {}
										return (
											<Step key={label} {...stepProps}>
												<StepLabel {...labelProps}>{label}</StepLabel>
											</Step>
										)
									})
								}
							</Stepper>
						</Grid>
						<Grid item xs={3} />
						{
							activeStep === 0 && (
								<>
									<Field
										name="supplierId"
										component={FormSelect}
										xs={12}
										label="Supplier"
										placeholder="Select Supplier"
										items={supplier}
										onChange={(e: SelectChangeEvent) => {
											handleChange(e)
											updateSupplier(e.target?.value)
										}}
									/>
									<Field
										name="poId"
										component={FormSelect}
										xs={5}
										label="Purchase Order"
										placeholder="Select Purchase Order"
										onChange={(e: SelectChangeEvent) => {
											handleChange(e)
											updateRawMaterials(e.target?.value)
										}}
										items={po}
									/>
									<Field
										name="invoiceNumber"
										component={FormSelect}
										xs={5}
										label="Invoice"
										placeholder="Select Invoice"
										items={invoice}
									/>
									<Field
										name="status"
										component={FormSelect}
										xs={2}
										label="Status"
										placeholder="Select Status"
										defaultValue='IQC'
										items={[
											{
												value: 'IQC',
											},
											{
												value: 'IN',
											}
										]}
									/>
									<Grid item xs={12}>
										<Button
											disableElevation
											disabled={isSubmitting}
											fullWidth
											size="large"
											variant="contained"
											color="primary"
											onClick={handleNext}
										>
											Next
										</Button>
									</Grid>
								</>
							)
						} {
							activeStep === 1 && (
								<FieldArray name="rm">
									{({ remove, push }) => (
										<>
											<Grid item xs={1} />
											<Field
												name="RmSelect"
												component={FormSelect}
												xs={4}
												label="Raw Material Field"
												placeholder="Select Raw Material Field"
												defaultValue="description"
												items={[
													{
														value: "description",
														label: "Description"
													}, {
														value: "id",
														label: "ID"
													}, {
														label: "DTPL Part Number",
														value: "dtplCode"
													}
												]}
												onChange={(e: SelectChangeEvent) => setRawmaterialIdentifier(e.target?.value as keyof RawMaterialInterface)}
											/>
											<Grid item xs={4}>
												<InputLabel htmlFor='rmId'>Raw Material</InputLabel>
												<Autocomplete
													id='rmId'
													options={rawmaterial}
													getOptionLabel={(option) => option[rawmaterialIdentifier] as string}
													disablePortal
													onChange={(e: SyntheticEvent, value) => setSelectedRm((selectedRm) => {
														if (value) return {
															...selectedRm,
															rm: value
														}
														return selectedRm
													})}
													renderInput={(params) => <TextField {...params} />}
												/>
											</Grid>
											<Field
												name="quantity"
												component={FormInput}
												xs={2}
												type="number"
												label="Quantity"
												placeholder="Enter Quantity"
												onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedRm((selectedRm) => ({
													...selectedRm,
													quantity: parseFloat(e.target?.value)
												}))}
											/>
											<Grid item xs={1} />
											<Grid item xs={12}>
												<Button
													disableElevation
													disabled={isSubmitting}
													fullWidth
													size="large"
													variant="contained"
													color="primary"
													onClick={() => {
														if (selectedRm.quantity && selectedRm.rm && selectedRm.rm.id) {
															push({
																rmId: selectedRm.rm.id,
																quantity: selectedRm.quantity
															})
														}
													}}
												>
													Add
												</Button>
											</Grid>
											{
												errors.rm && (
													<Grid item xs={12}>
														<FormHelperText error>{errors.rm as string}</FormHelperText>
													</Grid>
												)
											}
											<Grid item xs={12}>
												<Divider />
											</Grid>
											{
												values.rm.length !== 0 && (
													<Grid item xs={12} container>
														<Grid item xs={4}>
															<Typography variant='h6'>
																Raw Material Identifier
															</Typography>
														</Grid>
														<Grid item xs={4}>
															<Typography variant='h6'>
																Quantity
															</Typography>
														</Grid>
														<Grid item xs={4} />
													</Grid>
												)
											}
											{
												values.rm.map((item, index) => (
													<Grid item xs={12} container key={index}>
														<Grid item xs={4}>
															<OutlinedInput
																name={`bom.${index}.rmId`}
																type='text'
																disabled
																value={item.rmId}
															/>
														</Grid>
														<Grid item xs={4}>
															<OutlinedInput
																name={`bom.${index}.quantity`}
																type='number'
																disabled
																value={item.quantity}
															/>
														</Grid>
														<Grid item xs={4}>
															<Button
																disableElevation
																disabled={isSubmitting}
																fullWidth
																size="small"
																variant="contained"
																color="error"
																onClick={() => remove(index)}
															>
																DELETE
															</Button>
														</Grid>
													</Grid>
												))
											}
										</>
									)}
								</FieldArray>
							)
						}

						{
							activeStep === 1 && (
								errors.submit && (
									<Grid item xs={12}>
										<FormHelperText error>{errors.submit}</FormHelperText>
									</Grid>
								)
							)
						}
						{
							activeStep === 1 && (
								<>
									<Grid item xs={2}>
										<Button
											disableElevation
											disabled={isSubmitting}
											fullWidth
											size="large"
											variant="contained"
											color="secondary"
											onClick={handleBack}
										>
											Back
										</Button>
									</Grid>
									<Grid item xs={8} />
									<Grid item xs={2}>
										<Button
											disableElevation
											disabled={isSubmitting}
											fullWidth
											size="large"
											type="submit"
											variant="contained"
											color="primary"
										>
											Create
										</Button>
									</Grid>
								</>
							)
						}
					</Grid>
				</form>
			)}

		</Formik>
	)
}

export default PurchaseOrder