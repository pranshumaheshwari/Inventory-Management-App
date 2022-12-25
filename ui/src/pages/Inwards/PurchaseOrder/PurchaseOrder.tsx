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
import React, { useContext, useEffect, useState } from 'react'

import { AlertContext } from '../../../context'
import { FormInput } from '../../../components'
import FormSelect from '../../../components/FormSelect'
import { useConfirm } from 'material-ui-confirm'

export interface InwardsPurchaseOrderInterface {
    supplierId: string
    invoiceId: string
    poId: string
    details: {
        rmId: string
        quantity: number
        poPrice: number
        poQuantity: number
    }[]
}

interface FormValues extends Required<InwardsPurchaseOrderInterface> {
    submit: null
}

const PurchaseOrder = () => {
    const confirm = useConfirm()
    const { setAlert } = useContext(AlertContext)
    const {
        token: { token },
    } = useAuth()
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [invoice, setInvoice] = useState<{ value: string }[] | null>([])
    const [po, setPo] = useState<
        | {
              value: string
              id: string
              poDetails: {
                  rmId: string
                  quantity: number
                  price: number
              }[]
          }[]
        | null
    >([])
    const [error, setError] = useState('')
    let initialValues: FormValues = {
        supplierId: '',
        invoiceId: '',
        poId: '',
        details: [],
        submit: null,
    }

    const rejectPo = async (
        values: FormValues,
        {
            setErrors,
            setStatus,
            setSubmitting,
            resetForm,
        }: Partial<FormikHelpers<FormValues>>
    ) => {
        confirm({
            description: `This will reject PO check`,
            confirmationText: 'Reject',
        })
            .then(async () => {
                if (setSubmitting && setStatus && setErrors && resetForm) {
                    setSubmitting(true)
                    try {
                        const resp = await Fetch({
                            url: '/inwards/rejectPO',
                            options: {
                                authToken: token,
                                method: 'PUT',
                                body: values,
                            },
                        })
                        setAlert({
                            type: 'warning',
                            children: (
                                <Typography>
                                    Rejected PO check with ID - {resp[0].id}
                                </Typography>
                            ),
                        })
                        resetForm()
                        setPo([])
                        setInvoice([])
                    } catch (err) {
                        setStatus({ success: false })
                        setErrors({ submit: (err as Error).message })
                        setSubmitting(false)
                    }
                }
            })
            .catch(() => {})
    }

    const acceptPo = async (
        values: FormValues,
        {
            setErrors,
            setStatus,
            setSubmitting,
            resetForm,
        }: Partial<FormikHelpers<FormValues>>
    ) => {
        if (setSubmitting && setStatus && setErrors && resetForm) {
            setSubmitting(true)
            try {
                const resp = await Fetch({
                    url: '/inwards/acceptPO',
                    options: {
                        authToken: token,
                        method: 'PUT',
                        body: values,
                    },
                })
                setAlert({
                    type: 'success',
                    children: (
                        <Typography>
                            Accpected PO check with ID - {resp[0].id}
                        </Typography>
                    ),
                })
                resetForm()
                setPo([])
                setInvoice([])
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
                url: '/inwards/po',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            supplierId,
                            status: 'PendingPoVerification',
                        }),
                        select: JSON.stringify({
                            invoiceId: true,
                            id: true,
                        }),
                        distinct: JSON.stringify(['invoiceId']),
                    },
                },
            }).then((data) => {
                return data.map((invoice: { invoiceId: string }) => ({
                    value: invoice.invoiceId,
                    ...invoice,
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
                            poDetails: {
                                select: {
                                    rmId: true,
                                    quantity: true,
                                    price: true,
                                },
                            },
                        }),
                    },
                },
            }).then((data) => {
                return data.map((po: { id: string }) => ({
                    value: po.id,
                    ...po,
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

    const updatePoValues = async (
        poId: string,
        values: FormValues,
        setValues: FormikHelpers<FormValues>['setValues']
    ) => {
        try {
            if (values.invoiceId && values.details) {
                values.details = await values.details.map((d) => {
                    const poDetails = po
                        ?.find(({ id }) => id === poId)
                        ?.poDetails.find(({ rmId }) => rmId === d.rmId)
                    if (poDetails) {
                        return {
                            ...d,
                            poQuantity: poDetails.quantity,
                            poPrice: poDetails.price,
                        }
                    }
                    return d
                })
                setValues({
                    ...values,
                })
            }
            setValues({
                ...values,
                poId,
            })
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getRawMaterials = async (
        supplierId: string,
        id: string,
        values: FormValues,
        setValues: FormikHelpers<FormValues>['setValues']
    ) => {
        try {
            const data = await Fetch({
                url: '/invoice',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            supplierId,
                            id,
                        }),
                        select: JSON.stringify({
                            invoiceDetails: {
                                select: {
                                    rmId: true,
                                    quantity: true,
                                },
                            },
                        }),
                    },
                },
            })
                .then((data) => data[0]['invoiceDetails'])
                .then(async (data: FormValues['details']) => {
                    return await data.map((d) => {
                        if (values.poId) {
                            const poDetails = po
                                ?.find(({ id }) => id === values.poId)
                                ?.poDetails.find(({ rmId }) => rmId === d.rmId)
                            if (poDetails) {
                                return {
                                    ...d,
                                    poQuantity: poDetails.quantity,
                                    poPrice: poDetails.price,
                                }
                            }
                        }
                        return d
                    })
                })
            setValues({
                ...values,
                details: data,
                invoiceId: id,
            })
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getSupplier()
    }, [])

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
                resetForm,
            }) => (
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
                            onChange={(e: SelectChangeEvent) => {
                                handleChange(e)
                                updatePoValues(
                                    e.target.value,
                                    values,
                                    setValues
                                )
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
                                    e.target.value,
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
                                            <Grid item xs={3}>
                                                <Typography variant="h6">
                                                    Raw Material Part Number
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="h6">
                                                    Invoice Quantity
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="h6">
                                                    PO Quantity
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="h6">
                                                    PO Price
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
                                            <Grid item xs={3}>
                                                <OutlinedInput
                                                    name={`details.${index}.rmId`}
                                                    type="text"
                                                    disabled
                                                    value={item.rmId}
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <OutlinedInput
                                                    name={`details.${index}.quantity`}
                                                    type="number"
                                                    disabled
                                                    value={item.quantity}
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <OutlinedInput
                                                    name={`details.${index}.poQuantity`}
                                                    type="number"
                                                    disabled
                                                    value={item.poQuantity}
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <OutlinedInput
                                                    name={`details.${index}.poPrice`}
                                                    type="number"
                                                    disabled
                                                    value={item.poPrice}
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
                        {error && (
                            <Grid item xs={12}>
                                <FormHelperText error>{error}</FormHelperText>
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
                                            rejectPo(values, {
                                                setErrors,
                                                setStatus,
                                                setSubmitting,
                                                resetForm,
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
                                            acceptPo(values, {
                                                setErrors,
                                                setStatus,
                                                setSubmitting,
                                                resetForm,
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

export default PurchaseOrder
