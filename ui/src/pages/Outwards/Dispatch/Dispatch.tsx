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
import { Field, FieldArray, Formik, FormikHelpers } from 'formik'
import React, {
    ChangeEvent,
    SyntheticEvent,
    useContext,
    useEffect,
    useState,
} from 'react'

import { AlertContext } from '../../../context'
import DatePicker from '../../../components/DatePicker'
import { Divider } from '@mui/material'
import { FinishedGoodsInterface } from '../../FinishedGood/FinishedGood'
import { FormInput } from '../../../components'
import FormSelect from '../../../components/FormSelect'
import { OutlinedInput } from '@mui/material'
import { Step } from '@mui/material'
import { StepLabel } from '@mui/material'
import { Stepper } from '@mui/material'

export interface OutwardsDispatch {
    customerId: string
    invoiceNumber: string
    soId: string
    createdAt: Date
    details: {
        fgId: string
        quantity: number
    }[]
}

interface FormValues extends Required<OutwardsDispatch> {
    submit: null
}

const Dispatch = () => {
    const { setAlert } = useContext(AlertContext)
    const {
        token: { token },
    } = useAuth()
    const [activeStep, setActiveStep] = React.useState(0)
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [salesorder, setSalesOrder] = useState<{ value: string }[] | null>([])
    const [finishedgoods, setFinishedGoods] = useState<
        Partial<FinishedGoodsInterface>[]
    >([])
    const [finishedgoodsIdentifier, setFinishedGoodsIdentifier] =
        useState<keyof FinishedGoodsInterface>('description')
    const [selectedFg, setSelectedFg] = useState<{
        fg: Partial<FinishedGoodsInterface>
        quantity: number
    }>({
        fg: {},
        quantity: 0,
    })
    const [error, setError] = useState('')
    let initialValues: FormValues = {
        customerId: '',
        soId: '',
        invoiceNumber: '',
        details: [],
        createdAt: new Date(),
        submit: null,
    }

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

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
                url: '/outwards/dispatch',
                options: {
                    method: 'POST',
                    body: {
                        ...values,
                        createdAt: values.createdAt.toISOString(),
                    },
                    authToken: token,
                },
            })
            setAlert({
                type: 'success',
                children: (
                    <Typography>
                        Succesfully created dispatch with ID - {resp.id}
                    </Typography>
                ),
            })
            resetForm()
            setFinishedGoods([])
            setActiveStep(0)
        } catch (err) {
            setStatus({ success: false })
            setErrors({ submit: (err as Error).message })
            setSubmitting(false)
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
                url: `/salesorders/${encodeURIComponent(soId)}`,
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
            }).then(
                (
                    data: {
                        fg: {
                            id: string
                            description: string
                        }
                    }[]
                ) =>
                    data.map((d) => ({
                        id: d.fg.id,
                        description: d.fg.description,
                    }))
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
                soId: Yup.string().required('Sales Order is required'),
                invoiceNumber: Yup.string().required(
                    'Invoice Number is required'
                ),
                details: Yup.array()
                    .min(1)
                    .of(
                        Yup.object().shape({
                            fgId: Yup.string().required(
                                'Finished Goods Identifier is required'
                            ),
                            quantity: Yup.number()
                                .min(0)
                                .required('Quantity is required'),
                        })
                    ),
            })}
            onSubmit={onSubmit}
        >
            {({
                values,
                errors,
                handleSubmit,
                isSubmitting,
                handleChange,
                setValues,
            }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={3} />
                        <Grid item xs={6}>
                            <Stepper activeStep={activeStep}>
                                {[
                                    'Basic Details',
                                    'List of Finished Goods',
                                ].map((label, index) => {
                                    const stepProps: { completed?: boolean } =
                                        {}
                                    const labelProps: {
                                        optional?: React.ReactNode
                                    } = {}
                                    return (
                                        <Step key={label} {...stepProps}>
                                            <StepLabel {...labelProps}>
                                                {label}
                                            </StepLabel>
                                        </Step>
                                    )
                                })}
                            </Stepper>
                        </Grid>
                        <Grid item xs={3} />
                        {activeStep === 0 && (
                            <>
                                <Field
                                    name="invoiceNumber"
                                    component={FormInput}
                                    xs={6}
                                    type="text"
                                    label="Invoice"
                                    placeholder="Enter Invoice"
                                />
                                <DatePicker
                                    xs={6}
                                    label="Date"
                                    value={values.createdAt}
                                    onChange={(value: Date | null) => {
                                        if (value) {
                                            setValues((values) => ({
                                                ...values,
                                                createdAt: value,
                                            }))
                                        }
                                    }}
                                    name="createdAt"
                                />
                                <Field
                                    name="customerId"
                                    component={FormSelect}
                                    xs={6}
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
                                    xs={6}
                                    label="Sales Order"
                                    placeholder="Select Sales Order"
                                    items={salesorder}
                                    onChange={(e: SelectChangeEvent) => {
                                        handleChange(e)
                                        getFinishedGoods(e.target?.value)
                                    }}
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
                        )}

                        {activeStep === 1 && (
                            <FieldArray name="details">
                                {({ remove, push }) => (
                                    <>
                                        <Grid item xs={1} />
                                        <Field
                                            name="FgSelect"
                                            component={FormSelect}
                                            xs={4}
                                            label="Finished Goods Field"
                                            placeholder="Select Finished Goods Field"
                                            defaultValue="description"
                                            items={[
                                                {
                                                    value: 'description',
                                                    label: 'Description',
                                                },
                                                {
                                                    value: 'id',
                                                    label: 'ID',
                                                },
                                            ]}
                                            onChange={(e: SelectChangeEvent) =>
                                                setFinishedGoodsIdentifier(
                                                    e.target
                                                        ?.value as keyof FinishedGoodsInterface
                                                )
                                            }
                                        />
                                        <Grid item xs={4}>
                                            <InputLabel htmlFor="rmId">
                                                Finished Good
                                            </InputLabel>
                                            <Autocomplete
                                                id="fgId"
                                                options={finishedgoods}
                                                getOptionLabel={(option) =>
                                                    option[
                                                        finishedgoodsIdentifier
                                                    ] as string
                                                }
                                                isOptionEqualToValue={(
                                                    option,
                                                    value
                                                ) => option.id === value.id}
                                                disablePortal
                                                onChange={(
                                                    e: SyntheticEvent,
                                                    value
                                                ) =>
                                                    setSelectedFg(
                                                        (selectedFg) => {
                                                            if (value)
                                                                return {
                                                                    ...selectedFg,
                                                                    fg: value,
                                                                }
                                                            return selectedFg
                                                        }
                                                    )
                                                }
                                                renderInput={(params) => (
                                                    <TextField {...params} />
                                                )}
                                            />
                                        </Grid>
                                        <Field
                                            name="quantity"
                                            component={FormInput}
                                            xs={2}
                                            type="number"
                                            label="Quantity"
                                            placeholder="Enter Quantity"
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                setSelectedFg((selectedFg) => ({
                                                    ...selectedFg,
                                                    quantity: parseFloat(
                                                        e.target?.value
                                                    ),
                                                }))
                                            }
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
                                                    if (
                                                        selectedFg.quantity &&
                                                        selectedFg.fg &&
                                                        selectedFg.fg.id
                                                    ) {
                                                        push({
                                                            fgId: selectedFg.fg
                                                                .id,
                                                            quantity:
                                                                selectedFg.quantity,
                                                        })
                                                    }
                                                }}
                                            >
                                                Add to Sales Order
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>
                                        {values.details.length !== 0 && (
                                            <Grid item xs={12} container>
                                                <Grid item xs={4}>
                                                    <Typography variant="h6">
                                                        Finished Goods
                                                        Identifier
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
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
                                                <Grid item xs={4}>
                                                    <OutlinedInput
                                                        name={`details.${index}.fgId`}
                                                        type="text"
                                                        disabled
                                                        value={item.fgId}
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
                                                    <Button
                                                        disableElevation
                                                        disabled={isSubmitting}
                                                        fullWidth
                                                        size="small"
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() =>
                                                            remove(index)
                                                        }
                                                    >
                                                        DELETE
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        ))}
                                    </>
                                )}
                            </FieldArray>
                        )}

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
                        {activeStep === 1 && (
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
                        )}
                    </Grid>
                </form>
            )}
        </Formik>
    )
}

export default Dispatch
