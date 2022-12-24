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

export interface InwardsQualityCheck {
    supplierId: string
    invoiceId: string
    details: {
        rmId: string
        quantity: number
        inwardsIQCPendingId: number
    }[]
}

interface FormValues extends Required<InwardsQualityCheck> {
    submit: null
}

const QualityCheck = () => {
    const navigate = useNavigate()
    const {
        token: { token },
    } = useAuth()
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [invoice, setInvoice] = useState<{ value: string }[] | null>([])
    const [error, setError] = useState('')
    let initialValues: FormValues = {
        supplierId: '',
        invoiceId: '',
        details: [],
        submit: null,
    }

    const rejectIqc = async (
        values: FormValues,
        {
            setErrors,
            setStatus,
            setSubmitting,
        }: Partial<FormikHelpers<FormValues>>
    ) => {
        if (setSubmitting && setStatus && setErrors) {
            setSubmitting(true)
            try {
                await Fetch({
                    url: '/inwards/rejectIQCs',
                    options: {
                        authToken: token,
                        method: 'PUT',
                        body: values,
                    },
                })
                setStatus({ success: true })
                navigate(0)
            } catch (err) {
                setStatus({ success: false })
                setErrors({ submit: (err as Error).message })
                setSubmitting(false)
            }
        }
    }

    const acceptIqc = async (
        values: FormValues,
        {
            setErrors,
            setStatus,
            setSubmitting,
        }: Partial<FormikHelpers<FormValues>>
    ) => {
        if (setSubmitting && setStatus && setErrors) {
            setSubmitting(true)
            try {
                await Fetch({
                    url: '/inwards/acceptIQCs',
                    options: {
                        authToken: token,
                        method: 'PUT',
                        body: values,
                    },
                })
                setStatus({ success: true })
                navigate(0)
            } catch (err) {
                setStatus({ success: false })
                setErrors({ submit: (err as Error).message })
                setSubmitting(false)
            }
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
                return data.map((supplier: { name: string; id: string }) => ({
                    label: supplier.name,
                    value: supplier.id,
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
                url: '/inwards/iqc',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            inwardsPoPending: {
                                supplierId,
                            },
                            status: 'PendingIqcVerification',
                        }),
                        select: JSON.stringify({
                            inwardsPoPending: {
                                select: {
                                    invoiceId: true,
                                },
                            },
                            id: true,
                        }),
                    },
                },
            })
                .then((data) => {
                    return data.map(
                        (invoice: {
                            inwardsPoPending: { invoiceId: string }
                        }) => ({
                            value: invoice.inwardsPoPending.invoiceId,
                            ...invoice,
                        })
                    )
                })
                .then((data) =>
                    data.filter(
                        (value: object, index: number, self: Array<object>) => {
                            return self.indexOf(value) === index
                        }
                    )
                )
            setInvoice(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getRawMaterials = async (
        supplierId: string,
        invoiceId: string,
        values: FormValues,
        setValues: FormikHelpers<FormValues>['setValues']
    ) => {
        try {
            const data = await Fetch({
                url: '/inwards/iqc',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            inwardsPoPending: {
                                supplierId,
                                invoiceId,
                            },
                            status: 'PendingIqcVerification',
                        }),
                        select: JSON.stringify({
                            rmId: true,
                            id: true,
                            quantity: true,
                        }),
                    },
                },
            }).then((data: { id: number; rmId: string; quantity: number }[]) =>
                data.map((d) => ({
                    inwardsIQCPendingId: d.id,
                    rmId: d.rmId,
                    quantity: d.quantity,
                }))
            )
            setValues({
                ...values,
                invoiceId,
                details: data,
            })
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getSupplier()
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
                status: Yup.string().required('Status is required'),
                details: Yup.array().of(
                    Yup.object().shape({
                        rmId: Yup.string().required(
                            'Raw Material Part Number is required'
                        ),
                        quantity: Yup.number()
                            .min(0)
                            .required('Quantity is required'),
                        inwardsIQCPendingId: Yup.number().required(''),
                    })
                ),
            })}
            onSubmit={() => {}}
        >
            {({
                values,
                errors,
                handleSubmit,
                isSubmitting,
                handleChange,
                setValues,
                setErrors,
                setStatus,
                setSubmitting,
            }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Field
                            name="supplierId"
                            component={FormSelect}
                            xs={5}
                            label="Supplier"
                            placeholder="Select Supplier"
                            items={supplier}
                            onChange={(e: SelectChangeEvent) => {
                                handleChange(e)
                                updateInvoice(e.target?.value)
                            }}
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
                                getRawMaterials(
                                    values.supplierId,
                                    e.target?.value,
                                    values,
                                    setValues
                                )
                            }}
                        />
                        <Field
                            name="status"
                            component={FormInput}
                            xs={2}
                            label="Status"
                            placeholder="Select Status"
                            defaultValue="Accepted"
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
                                            <Grid item xs={4}>
                                                <Typography variant="h6">
                                                    Raw Material Part Number
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="h6">
                                                    Invoice Quantity
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="h6">
                                                    PO Inwards ID
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    )}
                                    {values.details.map((item, index) => (
                                        <Grid
                                            item
                                            xs={12}
                                            container
                                            key={index}
                                        >
                                            <Grid item xs={4}>
                                                <OutlinedInput
                                                    name={`details.${index}.rmId`}
                                                    type="text"
                                                    disabled
                                                    value={item.rmId}
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <OutlinedInput
                                                    name={`details.${index}.quantity`}
                                                    type="number"
                                                    disabled
                                                    value={item.quantity}
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <OutlinedInput
                                                    name={`details.${index}.inwardsIQCPendingId`}
                                                    type="number"
                                                    disabled
                                                    value={
                                                        item.inwardsIQCPendingId
                                                    }
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
                                            rejectIqc(values, {
                                                setErrors,
                                                setStatus,
                                                setSubmitting,
                                            })
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
                                        type="button"
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            acceptIqc(values, {
                                                setErrors,
                                                setStatus,
                                                setSubmitting,
                                            })
                                        }}
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

export default QualityCheck
