import * as Yup from 'yup'

import { Button, CircularProgress, FormHelperText, Grid } from '@mui/material'
import { Fetch, useAuth } from '../../services'
import { Field, Formik, FormikHelpers } from 'formik'
import React, { SyntheticEvent, useEffect, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'

import Autocomplete from '@mui/material/Autocomplete'
import DatePicker from '../../components/DatePicker'
import { FinishedGoodsInterface } from '../FinishedGood/FinishedGood'
import { FormInput } from '../../components'
import FormSelect from '../../components/FormSelect'
import InputLabel from '@mui/material/InputLabel'
import { SelectChangeEvent } from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import { useNavigate } from 'react-router-dom'

interface ProductionInterface {
    date: Dayjs
    fgId: string
    quantity: number
    soId: string
}

interface FormValues extends Required<ProductionInterface> {
    submit: null
}

const Production = () => {
    const navigate = useNavigate()
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [finishedGood, setFinishedGood] = useState<
        Partial<FinishedGoodsInterface>[]
    >([])
    const [finishedGoodIndentifier, setFinishedGoodIdentifier] =
        useState<keyof FinishedGoodsInterface>('description')
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [salesOrder, setSalesOrder] = useState<{ value: string }[] | null>([])

    const onSubmit = async (
        values: FormValues,
        { setErrors, setStatus, setSubmitting }: FormikHelpers<FormValues>
    ) => {
        try {
            await Fetch({
                url: '/production',
                options: {
                    method: 'POST',
                    body: {
                        quantity: values.quantity,
                        fgId: values.fgId,
                        createAt: dateToString(values.date),
                        soId: values.soId,
                    },
                    authToken: token,
                },
            })
            navigate(0)
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

    const dateToString = (date: Dayjs) => {
        return date.format('DD/MM/YYYY').toString()
    }

    if (error) {
        ;<Grid item xs={12}>
            <FormHelperText error>{error}</FormHelperText>
        </Grid>
    }

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
                        <Field
                            name="FgSelect"
                            component={FormSelect}
                            xs={4}
                            label="Finished Good Field"
                            placeholder="Select Finished Good Field"
                            defaultValue="description"
                            items={[
                                {
                                    value: 'description',
                                    label: 'Description',
                                },
                                {
                                    value: 'id',
                                    label: 'Part Number',
                                },
                            ]}
                            onChange={(e: SelectChangeEvent) =>
                                setFinishedGoodIdentifier(
                                    e.target
                                        ?.value as keyof FinishedGoodsInterface
                                )
                            }
                        />
                        <Grid item xs={8}>
                            <InputLabel htmlFor="fgId">
                                Finished Good
                            </InputLabel>
                            <Autocomplete
                                id="fgId"
                                options={finishedGood}
                                getOptionLabel={(option) =>
                                    option[finishedGoodIndentifier] as string
                                }
                                disablePortal
                                onChange={(e: SyntheticEvent, value) =>
                                    setValues((values) => ({
                                        ...values,
                                        fgId: value?.id ? value?.id : '',
                                    }))
                                }
                                renderInput={(params) => (
                                    <TextField {...params} />
                                )}
                            />
                        </Grid>
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
                                setValues((values) => ({
                                    ...values,
                                    date: value ? value : dayjs(),
                                }))
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
