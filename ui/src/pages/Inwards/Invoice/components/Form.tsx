import * as Yup from 'yup'

import {Button, FormHelperText, Grid, Skeleton} from '@mui/material'
import { Fetch, useAuth } from '../../../../services'
import { Field, Formik, FormikHelpers } from 'formik'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { FormInput } from '../../../../components'
import FormSelect from '../../../../components/FormSelect'
import { InvoiceInterface } from '../Invoice'

interface FormValues extends Required<InvoiceInterface> {
    submit: null;
}

const Form = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isEdit = location.state ? true : false
    const { token: { token } } = useAuth()
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [error, setError] = useState('')
    let initialValues: FormValues = {
        invoiceNumber: '',
        supplierId: '',
        supplier: {
            name: ''
        },
        status: 'PO',
        submit: null
    }

    if (isEdit) {
        initialValues = {
            ...initialValues,
            ...location.state as FormValues
        }
    }

    const onSubmit = async (values: FormValues, { setErrors, setStatus, setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            await Fetch({
                url: '/inwards/invoice' + (isEdit ? '/' + encodeURIComponent(initialValues.supplierId) + '/' + encodeURIComponent(initialValues.invoiceNumber) : ''),
                options: {
                    method: isEdit ? "PUT" : "POST",
                    body: values,
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
    const onDelete = async () => {
        try {
            await Fetch({
                url: `/inwards/invoice/${encodeURIComponent(initialValues.supplierId)}/${encodeURIComponent(initialValues.invoiceNumber)}`,
                options: {
                    method: "DELETE",
                    authToken: token
                }
            })
            navigate('..')
        } catch (e) {
            setError((e as Error).message)
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
                    status: Yup.string().required('Status is required')
                })
            }
            onSubmit={onSubmit}
        >
            {({ values, errors, handleSubmit, isSubmitting }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Field
                            name="supplierId"
                            component={FormSelect}
                            xs={6}
                            label="Supplier"
                            placeholder="Select Supplier"
                            items={supplier}
                        />
                        <Field
                            name="invoiceNumber"
                            component={FormInput}
                            xs={4}
                            type="text"
                            label="Invoice Number"
                            placeholder="Enter Invoice Number"
                        />
                        <Field
                            name="status"
                            component={FormSelect}
                            xs={2}
                            label="Status"
                            placeholder="Select Status"
                            defaultValue='PO'
                            items={[
                                {
                                    value: 'PO',
                                },
                                {
                                    value: 'IQC',
                                },
                                {
                                    value: 'IN',
                                }
                            ]}
                        />
                        {errors.submit && (
                            <Grid item xs={12}>
                                <FormHelperText error>{errors.submit}</FormHelperText>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Button
                                disableElevation
                                disabled={isSubmitting}
                                fullWidth
                                size="large"
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                {isEdit ? "Update" : "Create"}
                            </Button>
                        </Grid>
                        {
                            isEdit && (
                                <Grid item xs={12}>
                                    <Grid
                                        container
                                        justifyContent='center'
                                        alignItems='center'
                                    >
                                        <Button
                                            disableElevation
                                            disabled={isSubmitting}
                                            size="large"
                                            variant="contained"
                                            color="error"
                                            onClick={() => {
                                                onDelete()
                                            }}
                                        >
                                            DELETE
                                        </Button>
                                    </Grid>
                                </Grid>
                            )
                        }
                    </Grid>
                </form>
            )}
        </Formik>
    )
}

export default Form