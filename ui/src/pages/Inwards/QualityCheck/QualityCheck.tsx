import * as Yup from 'yup'

import {
    Button,
    FormHelperText,
    Grid,
    SelectChangeEvent,
    Skeleton,
} from '@mui/material'
import { Fetch, useAuth } from '../../../services'
import { Field, Formik, FormikHelpers } from 'formik'
import React, { useEffect, useState } from 'react'

import { FormInput } from '../../../components'
import FormSelect from '../../../components/FormSelect'
import { useNavigate } from 'react-router-dom'

export interface InwardsQualityCheck {
    supplierId: string
    rmId: string
    quantity: number
    inwardsPoPendingId: number
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
    const [rm, setRm] = useState<
        {
            rmId: string
            quantity: number
            inwardsPoPendingId: number
            supplierId: string
            value: string
        }[]
    >([])
    const [allRm, setAllRm] = useState<
        {
            rmId: string
            quantity: number
            inwardsPoPendingId: number
            supplierId: string
            value: string
        }[]
    >([])
    const [error, setError] = useState('')
    let initialValues: FormValues = {
        supplierId: '',
        rmId: '',
        quantity: 0,
        inwardsPoPendingId: 0,
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
                    url: '/inwards/rejectIQC',
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
                    url: '/inwards/acceptIQC',
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

    const getRawMaterials = async () => {
        try {
            const data = await Fetch({
                url: '/inwards/iqc',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            inwardsPoPendingId: true,
                            rmId: true,
                            quantity: true,
                            inwardsPoPending: {
                                select: {
                                    supplierId: true,
                                },
                            },
                        }),
                    },
                },
            }).then(async (data) => {
                return await data.map(
                    (d: {
                        rmId: string
                        quantity: number
                        inwardsPoPendingId: number
                        inwardsPoPending: {
                            supplierId: string
                        }
                    }) => {
                        return {
                            ...d,
                            supplierId: d.inwardsPoPending.supplierId,
                            value: d.inwardsPoPendingId + ' WITH ' + d.rmId,
                            name: d.inwardsPoPendingId,
                        }
                    }
                )
            })
            setRm(data)
            setAllRm(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        Promise.all([getSupplier(), getRawMaterials()])
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
                rmId: Yup.string().required(
                    'Raw Material Part Number is required'
                ),
                quantity: Yup.number().min(0).required('Quantity is required'),
                inwardsPoPendingId: Yup.number().required(''),
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
                            xs={10}
                            label="Supplier"
                            placeholder="Select Supplier"
                            items={supplier}
                            onChange={(e: SelectChangeEvent) => {
                                handleChange(e)
                                setRm(
                                    allRm.filter(
                                        (rm) => rm.supplierId === e.target.value
                                    )
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
                        <Field
                            name="inwardsPoPendingId"
                            component={FormSelect}
                            label="PO Verification ID"
                            xs={8}
                            placeholder="Select Raw Material"
                            items={rm}
                            onChange={(e: SelectChangeEvent) => {
                                console.log(e.target.value)
                            }}
                        />
                        <Field
                            name="rmId"
                            component={FormInput}
                            xs={2}
                            label="Raw Material"
                            placeholder="Select Raw Material"
                            defaultValue=""
                            disabled
                        />
                        <Field
                            name="quantity"
                            component={FormInput}
                            xs={2}
                            type="number"
                            label="Quantity"
                            placeholder="Enter Quantity"
                            disabled
                        />

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
