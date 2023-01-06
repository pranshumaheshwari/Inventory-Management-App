import * as Yup from 'yup'

import {
    Autocomplete,
    Button,
    FormHelperText,
    Grid,
    InputLabel,
    SelectChangeEvent,
    Skeleton,
    TextField,
    Typography,
} from '@mui/material'
import { Fetch, useAuth } from '../../../services'
import { Field, Formik, FormikHelpers } from 'formik'
import React, { SyntheticEvent, useContext, useEffect, useState } from 'react'

import { AlertContext } from '../../../context'
import { FormInput } from '../../../components'
import FormSelect from '../../../components/FormSelect'
import { useConfirm } from 'material-ui-confirm'

export interface OutwardsQualityCheck {
    customerId: string
    soId: string
    fgId: string
    quantity: number
    productionId: number
}

interface FormValues extends Required<OutwardsQualityCheck> {
    submit: null
}

const QualityCheck = () => {
    const confirm = useConfirm()
    const { setAlert } = useContext(AlertContext)
    const {
        token: { token },
    } = useAuth()
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [salesorder, setSalesOrder] = useState<{ value: string }[] | null>([])
    const [finishedGoods, setFinishedGoods] = useState<
        {
            fgId: string
            quantity: number
            createdAt: string
            productionId: number
        }[]
    >([])
    const [error, setError] = useState('')
    let initialValues: FormValues = {
        customerId: '',
        soId: '',
        fgId: '',
        productionId: 0,
        quantity: 0,
        submit: null,
    }

    const rejectOqc = async (
        values: FormValues,
        {
            setErrors,
            setStatus,
            setSubmitting,
            resetForm,
        }: Partial<FormikHelpers<FormValues>>
    ) => {
        confirm({
            description: 'This will reject based on Outwards Quality Check',
            confirmationText: 'Reject',
        })
            .then(async () => {
                if (setSubmitting && setStatus && setErrors && resetForm) {
                    setSubmitting(true)
                    try {
                        const resp = await Fetch({
                            url: '/outwards/oqc/reject',
                            options: {
                                authToken: token,
                                method: 'POST',
                                body: values,
                            },
                        })
                        setAlert({
                            type: 'warning',
                            children: (
                                <Typography>
                                    Rejected OQC check with ID - {resp[0].id}
                                </Typography>
                            ),
                        })
                        resetForm()
                        setSalesOrder([])
                        setFinishedGoods([])
                    } catch (err) {
                        setStatus({ success: false })
                        setErrors({ submit: (err as Error).message })
                        setSubmitting(false)
                    }
                }
            })
            .catch(() => {})
    }

    const acceptOqc = async (
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
                    url: '/outwards/oqc/accept',
                    options: {
                        authToken: token,
                        method: 'POST',
                        body: values,
                    },
                })
                setAlert({
                    type: 'success',
                    children: (
                        <Typography>
                            Accepted OQC check with ID - {resp[0].id}
                        </Typography>
                    ),
                })
                resetForm()
                setFinishedGoods([])
                setSalesOrder([])
            } catch (err) {
                setStatus({ success: false })
                setErrors({ submit: (err as Error).message })
                setSubmitting(false)
            }
        }
    }

    const getCustomer = async () => {
        try {
            const data = await Fetch({
                url: '/customers',
                options: {
                    authToken: token,
                },
            }).then((data) => {
                return data.map((customer: { name: string; id: string }) => ({
                    label: customer.name,
                    value: customer.id,
                }))
            })
            setCustomer(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const updateSalesOrder = async (customerId: string) => {
        try {
            const data = await Fetch({
                url: '/salesorders',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            customerId,
                        }),
                        select: JSON.stringify({
                            id: true,
                        }),
                    },
                },
            }).then((data) =>
                data.map((salesOrder: { id: string }) => ({
                    value: salesOrder.id,
                    ...salesOrder,
                }))
            )
            setSalesOrder(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getFinishedGoods = async (soId: string) => {
        try {
            const data = await Fetch({
                url: '/outwards/production',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            status: 'PendingOqcVerification',
                            soId,
                        }),
                        select: JSON.stringify({
                            id: true,
                            fgId: true,
                            quantity: true,
                            createdAt: true,
                        }),
                    },
                },
            }).then(
                (
                    data: {
                        id: number
                        fgId: string
                        quantity: number
                        createdAt: string
                    }[]
                ) =>
                    data
                        .map((d) => ({
                            productionId: d.id,
                            fgId: d.fgId,
                            quantity: d.quantity,
                            createdAt: d.createdAt,
                        }))
                        .sort((a, b) => b.productionId - a.productionId)
            )
            setFinishedGoods(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getCustomer()
    }, [])

    if (!customer) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={Yup.object().shape({
                status: Yup.string().required('Status is required'),
                fgId: Yup.string().required('Finished Good is required'),
                productionId: Yup.number()
                    .min(1)
                    .required('Production Id is required'),
                quantity: Yup.number().min(1).required('Quantity is required'),
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
                            name="customerId"
                            component={FormSelect}
                            xs={5}
                            label="Customer"
                            placeholder="Select Customer"
                            items={customer}
                            onChange={(e: SelectChangeEvent) => {
                                handleChange(e)
                                updateSalesOrder(e.target?.value)
                            }}
                        />
                        <Field
                            name="soId"
                            component={FormSelect}
                            xs={5}
                            label="Sales Order"
                            placeholder="Select Sales Order"
                            items={salesorder}
                            onChange={(e: SelectChangeEvent) => {
                                handleChange(e)
                                getFinishedGoods(e.target?.value)
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

                        <Grid item xs={4}>
                            <InputLabel htmlFor="fgId">
                                Finished Good
                            </InputLabel>
                            <Autocomplete
                                id="fgId"
                                key={finishedGoods[0]?.fgId}
                                options={[
                                    ...new Set(
                                        finishedGoods.map((fg) => fg.fgId)
                                    ),
                                ]}
                                onChange={(e: SyntheticEvent, value) => {
                                    if (value) {
                                        setValues({
                                            ...values,
                                            fgId: value,
                                        })
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} name="fgId" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <InputLabel htmlFor="productionId">
                                Production Id
                            </InputLabel>
                            <Autocomplete
                                id="productionId"
                                key={finishedGoods[0]?.productionId}
                                options={[
                                    ...finishedGoods.filter((item) => {
                                        if (values.fgId) {
                                            return item.fgId === values.fgId
                                        }
                                        return true
                                    }),
                                ]}
                                isOptionEqualToValue={(option, value) =>
                                    option.productionId === value.productionId
                                }
                                getOptionLabel={(option) =>
                                    option.productionId.toString()
                                }
                                onChange={(e: SyntheticEvent, value) => {
                                    if (value) {
                                        setValues({
                                            ...values,
                                            productionId: value.productionId,
                                            quantity: value.quantity,
                                        })
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        name="productionId"
                                    />
                                )}
                            />
                        </Grid>
                        <Field
                            name="quantity"
                            component={FormInput}
                            xs={4}
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
                                            rejectOqc(values, {
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
                                            acceptOqc(values, {
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

export default QualityCheck
