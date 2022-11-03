import * as Yup from 'yup'

import {
    Button,
    Divider,
    FormHelperText,
    Grid,
    OutlinedInput,
    SelectChangeEvent,
    Skeleton,
    Typography,
} from '@mui/material'
import { Fetch, useAuth } from '../../../services'
import { Field, FieldArray, Formik, FormikHelpers } from 'formik'
import React, { useEffect, useState } from 'react'

import { FormInput } from '../../../components'
import FormSelect from '../../../components/FormSelect'
import { useNavigate } from 'react-router-dom'

export interface InwardsPurchaseOrderInterface {
    supplierId: string
    invoiceId: string
    poId: string
    details: {
        rmId: string
        quantity: number
    }[]
}

interface FormValues extends Required<InwardsPurchaseOrderInterface> {
    submit: null
}

const PurchaseOrder = () => {
    const navigate = useNavigate()
    const {
        token: { token },
    } = useAuth()
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [invoice, setInvoice] = useState<{ value: string }[] | null>([])
    const [po, setPo] = useState<{ value: string }[] | null>([])
    const [error, setError] = useState('')
    let initialValues: FormValues = {
        supplierId: '',
        invoiceId: '',
        poId: '',
        details: [],
        submit: null,
    }

    const rejectRm = async () => {}

    const onSubmit = async (
        values: FormValues,
        { setErrors, setStatus, setSubmitting }: FormikHelpers<FormValues>
    ) => {
        try {
            const data = Array.from(values.details).map((val) => ({
                ...val,
                poId: values.poId,
                supplierId: values.supplierId,
                invoiceId: values.invoiceId,
                status: 'PendingIqcVerification',
            }))
            await Fetch({
                url: '/inwards',
                options: {
                    method: 'POST',
                    body: {
                        data,
                    },
                    authToken: token,
                },
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
                    authToken: token,
                },
            }).then((data) => {
                return data.map((customer: { name: string; id: string }) => ({
                    label: customer.name,
                    value: customer.id,
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
                url: '/invoice',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            supplierId,
                        }),
                        select: JSON.stringify({
                            id: true,
                        })
                    },
                },
            }).then((data) => {
                return data.map((invoice: { id: string }) => ({
                    value: invoice.id,
                    ...invoice
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
                            supplierId,
                        }),
                        select: JSON.stringify({
                            id: true,
                        }),
                    },
                },
            }).then((data) => {
                return data.map((po: { id: string }) => ({
                    value: po.id,
                }))
            })
            setPo(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const updateSupplier = async (supplierId: string) => {
        updateInvoice(supplierId)
        updatePo(supplierId)
    }

	const getRawMaterials = async (supplierId: string, id: string, values: FormValues, setValues: FormikHelpers<FormValues>["setValues"]) => {
		try {
            const data = await Fetch({
                url: '/invoice',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            supplierId,
                            id
                        }),
                        select: JSON.stringify({
                            invoiceDetails: {
                                select: {
                                    rmId: true,
                                    quantity: true
                                }
                            }
                        })
                    },
                },
            }).then(data => data[0]['invoiceDetails'])
			setValues({
				...values,
				details: data,
				invoiceId: id
			})
        } catch (e) {
            setError((e as Error).message)
        }
	}

    useEffect(() => {
        Promise.all([getSupplier()])
    }, [])

    if (error) {
        ;<Grid item xs={12}>
            <FormHelperText error>{error}</FormHelperText>
        </Grid>
    }

    if (!supplier) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={Yup.object().shape({
                invoiceId: Yup.string().required('Invoice ID is required'),
                supplierId: Yup.string().required('Supplier is required'),
                poId: Yup.string().required('Purchase Order is required'),
                status: Yup.string().required('Status is required'),
                details: Yup.array().of(
                    Yup.object().shape({
                        rmId: Yup.string().required(
                            'Raw Material Part Number is required'
                        ),
                        quantity: Yup.number()
                            .min(0)
                            .required('Quantity is required'),
                    })
                ),
            })}
            onSubmit={onSubmit}
        >
            {({ values, errors, handleSubmit, isSubmitting, handleChange, setValues }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
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
                            items={po}
                        />
                        <Field
                            name="invoiceId"
                            component={FormSelect}
                            xs={5}
                            label="Invoice"
                            placeholder="Select Invoice"
                            items={invoice}
							onChange={(e: SelectChangeEvent) => {
								handleChange(e)
								getRawMaterials(values.supplierId, e.target.value, values, setValues)
							}}
                        />
                        <Field
                            name="status"
                            component={FormInput}
                            xs={2}
                            label="Status"
                            placeholder="Select Status"
                            defaultValue="IQC"
                            disabled
                        />
                        <FieldArray name="details">
                            {() => (
                                <>
                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>
                                    {values.details.length !== 0 && (
                                        <Grid item xs={12} container>
                                            <Grid item xs={6}>
                                                <Typography variant="h6">
                                                    Raw Material Part Number
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="h6">
                                                    Quantity
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4} />
                                        </Grid>
                                    )}
                                    {values.details.map((item, index) => (
                                        <Grid
                                            item
                                            xs={12}
                                            container
                                            key={index}
                                        >
                                            <Grid item xs={6}>
                                                <OutlinedInput
                                                    name={`details.${index}.rmId`}
                                                    type="text"
                                                    disabled
                                                    value={item.rmId}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <OutlinedInput
                                                    name={`details.${index}.quantity`}
                                                    type="number"
                                                    disabled
                                                    value={item.quantity}
                                                />
                                            </Grid>
                                        </Grid>
                                    ))}
                                </>
                            )}
                        </FieldArray>

                        {errors.submit && (
                            <Grid item xs={12}>
                                <FormHelperText error>
                                    {errors.submit}
                                </FormHelperText>
                            </Grid>
                        )}
                        {
                            <>
                                <Grid item xs={2}>
                                    <Button
                                        disableElevation
                                        disabled={isSubmitting}
                                        fullWidth
                                        size="large"
                                        type="button"
                                        variant="contained"
                                        color="error"
                                        onClick={() => {
                                            rejectRm()
                                        }}
                                    >
                                        Reject
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
                                        Approve
                                    </Button>
                                </Grid>
                            </>
                        }
                    </Grid>
                </form>
            )}
        </Formik>
    )
}

export default PurchaseOrder
