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
    const [finishedGood, setFinishedGood] =
        useState<Partial<FinishedGoodsInterface>[]>()
    const [finishedGoodIndentifier, setFinishedGoodIdentifier] =
        useState<keyof FinishedGoodsInterface>('description')

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

    const getFinishedGoods = async () => {
        try {
            const data = await Fetch({
                url: '/finishedgoods',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            description: true,
                        }),
                    },
                },
            })
            setFinishedGood(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getFinishedGoods()
    }, [])

    const dateToString = (date: Dayjs) => {
        return date.format('DD/MM/YYYY').toString()
    }

    if (error) {
        ;<Grid item xs={12}>
            <FormHelperText error>{error}</FormHelperText>
        </Grid>
    }

    if (!finishedGood) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <Formik
            initialValues={{
                submit: null,
                fgId: '',
                quantity: 0,
                date: dayjs(),
            }}
            validationSchema={Yup.object().shape({
                fgId: Yup.string().required('Finished Good is required'),
                quantity: Yup.number().min(1).required('Quantity is required'),
            })}
            onSubmit={onSubmit}
        >
            {({ errors, handleSubmit, isSubmitting, setValues, values }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
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
