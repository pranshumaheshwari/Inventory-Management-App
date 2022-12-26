import * as Yup from 'yup'

import {
    Autocomplete,
    Button,
    CircularProgress,
    FormHelperText,
    Grid,
    InputLabel,
    Skeleton,
    TextField,
    Typography,
} from '@mui/material'
import { DatePicker, FormInput, FormSelect } from '../../../components'
import { Fetch, useAuth } from '../../../services'
import { Field, Formik, FormikHelpers } from 'formik'
import React, { SyntheticEvent, useContext, useEffect, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'

import { AlertContext } from '../../../context'
import { FinishedGoodsInterface } from '../../FinishedGood/FinishedGood'
import { InputAutoComplete } from '../../common'
import { SelectChangeEvent } from '@mui/material/Select'

interface ProductionInterface {
    date: Dayjs
    fgId: string
    quantity: number
    soId: string
    customerId: string
}

interface FormValues extends Required<ProductionInterface> {
    submit: null
}

const Production = () => {
    const {
        token: { token },
    } = useAuth()
    const { setAlert } = useContext(AlertContext)
    const [error, setError] = useState('')
    const [finishedGood, setFinishedGood] = useState<
        Partial<FinishedGoodsInterface>[]
    >([])
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [salesOrder, setSalesOrder] = useState<{ value: string }[] | null>([])

    const onSubmit = async (
        values: FormValues,
        {
            setErrors,
            setStatus,
            setSubmitting,
            resetForm,
        }: FormikHelpers<FormValues>
    ) => {
        try {
            const resp = await Fetch({
                url: '/outwards/production',
                options: {
                    method: 'POST',
                    body: {
                        quantity: values.quantity,
                        fgId: values.fgId,
                        createAt: values.date.toISOString(),
                        soId: values.soId,
                    },
                    authToken: token,
                },
            })
            resetForm()
            setSalesOrder([])
            setFinishedGood([])
            setSubmitting(false)
            setAlert({
                type: 'success',
                children: (
                    <Typography>
                        Succesfully created new record with ID - {resp[0].id}
                    </Typography>
                ),
            })
        } catch (err) {
            setStatus({ success: false })
            setErrors({ submit: (err as Error).message })
            setSubmitting(false)
        }
    }

    const getCustomers = async () => {
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

    const getFinishedGoods = async (soId: string) => {
        try {
            const data = await Fetch({
                url: `/salesorders/${soId}`,
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            fg: {
                                select: {
                                    id: true,
                                    description: true,
                                },
                            },
                        }),
                    },
                },
            }).then((data) =>
                data.map((d: { fg: { id: string; description: string } }) => ({
                    ...d.fg,
                }))
            )
            setFinishedGood(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getSalesOrders = async (customerId: string) => {
        try {
            const data = await Fetch({
                url: '/salesorders',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                        }),
                        where: JSON.stringify({
                            customerId,
                        }),
                    },
                },
            }).then((data) =>
                data.map((d: { id: string }) => ({ value: d.id }))
            )
            setSalesOrder(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getCustomers()
    }, [])

    if (!customer) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <Formik
            initialValues={{
                submit: null,
                fgId: '',
                soId: '',
                quantity: 0,
                customerId: '',
                date: dayjs(),
            }}
            validationSchema={Yup.object().shape({
                fgId: Yup.string().required('Finished Good is required'),
                quantity: Yup.number().min(1).required('Quantity is required'),
                soId: Yup.string().required('Sales Order is required'),
            })}
            onSubmit={onSubmit}
        >
            {({
                errors,
                handleSubmit,
                isSubmitting,
                setValues,
                values,
                handleChange,
            }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Field
                            name="customerId"
                            component={FormSelect}
                            xs={6}
                            label="Customer"
                            placeholder="Select Customer"
                            items={customer}
                            onChange={(e: SelectChangeEvent) => {
                                handleChange(e)
                                getSalesOrders(e.target.value)
                            }}
                        />
                        <Field
                            name="soId"
                            component={FormSelect}
                            xs={6}
                            label="Sales Order"
                            placeholder="Select Sales Order"
                            items={salesOrder}
                            onChange={(e: SelectChangeEvent) => {
                                handleChange(e)
                                getFinishedGoods(e.target.value)
                            }}
                        />
                        <InputAutoComplete<Partial<FinishedGoodsInterface>>
                            identifierXs={4}
                            defaultIdentifier="description"
                            identifierItems={[
                                {
                                    value: 'description',
                                    label: 'Description',
                                },
                                {
                                    value: 'id',
                                    label: 'Part Number',
                                },
                            ]}
                            itemXs={8}
                            label="Finished Good"
                            name="fgId"
                            options={finishedGood}
                            uniqueIdentifier="id"
                            itemKey={finishedGood[0]?.id}
                            onChange={(e: SyntheticEvent, value) =>
                                setValues((values) => ({
                                    ...values,
                                    fgId: value?.id ? value.id : '',
                                }))
                            }
                            placeholder="Select Finished Good"
                        />
                        <Field
                            name="quantity"
                            component={FormInput}
                            xs={6}
                            type="number"
                            label="Quantity"
                            placeholder="Enter Quantity"
                        />
                        <DatePicker
                            xs={6}
                            label="Date"
                            value={values.date}
                            onChange={(value: Dayjs | null) => {
                                if (value) {
                                    setValues((values) => ({
                                        ...values,
                                        date: value,
                                    }))
                                }
                            }}
                            name="date"
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
                                Create
                            </Button>
                            {isSubmitting && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: 'text.secondary',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px',
                                        marginLeft: '-12px',
                                    }}
                                />
                            )}
                        </Grid>
                    </Grid>
                </form>
            )}
        </Formik>
    )
}

export default Production
