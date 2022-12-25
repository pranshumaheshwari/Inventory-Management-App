import * as Yup from 'yup'

import {
    Autocomplete,
    Button,
    Divider,
    FormHelperText,
    Grid,
    InputLabel,
    OutlinedInput,
    SelectChangeEvent,
    Skeleton,
    Step,
    StepLabel,
    Stepper,
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
import { useLocation, useNavigate } from 'react-router-dom'

import { AlertContext } from '../../../context'
import { FinishedGoodsInterface } from '../../FinishedGood/FinishedGood'
import { FormInput } from '../../../components'
import FormSelect from '../../../components/FormSelect'
import { SalesOrdersInterface } from '../SalesOrders'
import { useConfirm } from 'material-ui-confirm'

interface FormValues extends Required<SalesOrdersInterface> {
    submit: null
}

const Form = () => {
    const { setAlert } = useContext(AlertContext)
    const navigate = useNavigate()
    const location = useLocation()
    const confirm = useConfirm()
    const isEdit = location.state ? true : false
    const {
        token: { token },
    } = useAuth()
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = React.useState(0)
    const [finishedgoods, setFinishedGoods] =
        useState<Partial<FinishedGoodsInterface>[]>()
    const [finishedgoodsIdentifier, setFinishedGoodsIdentifier] =
        useState<keyof FinishedGoodsInterface>('description')
    const [selectedFg, setSelectedFg] = useState<{
        fg: Partial<FinishedGoodsInterface>
        quantity: number
    }>({
        fg: {},
        quantity: 0,
    })
    let initialValues: FormValues = {
        id: '',
        customerId: '',
        status: 'Open',
        soDetails: [],
        customer: {
            name: '',
        },
        submit: null,
    }

    if (isEdit) {
        initialValues = {
            ...initialValues,
            ...(location.state as FormValues),
        }
    }

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const onSubmit = async (
        values: FormValues,
        { setErrors, setStatus, setSubmitting }: FormikHelpers<FormValues>
    ) => {
        try {
            const postData: Partial<FormValues> = {
                id: values.id,
                customerId: values.customerId,
                soDetails: values.soDetails,
            }
            const resp = await Fetch({
                url:
                    '/salesorders' +
                    (isEdit ? '/' + encodeURIComponent(initialValues.id) : ''),
                options: {
                    method: isEdit ? 'PUT' : 'POST',
                    body: postData,
                    authToken: token,
                },
            })
            setAlert({
                type: 'success',
                children: (
                    <Typography>
                        Succesfully {isEdit ? 'edited' : 'created'} sales order
                        with ID - {resp.id}
                    </Typography>
                ),
            })
            navigate('..')
        } catch (err) {
            setStatus({ success: false })
            setErrors({ submit: (err as Error).message })
            setSubmitting(false)
        }
    }
    const onDelete = async () => {
        confirm({
            description: `This will delete sales order ${initialValues.id}`,
        })
            .then(async () => {
                try {
                    const resp = await Fetch({
                        url: `/salesorders/${encodeURIComponent(
                            initialValues.id
                        )}`,
                        options: {
                            method: 'DELETE',
                            authToken: token,
                        },
                    })
                    setAlert({
                        type: 'warning',
                        children: (
                            <Typography>
                                Succesfully deleted sales order with ID -{' '}
                                {resp.id}
                            </Typography>
                        ),
                    })
                    navigate('..')
                } catch (e) {
                    setError((e as Error).message)
                }
            })
            .catch(() => {})
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
            setFinishedGoods(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        Promise.all([getCustomers(), getFinishedGoods()])
    }, [])

    if (!customer || !finishedgoods) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={Yup.object().shape({
                id: Yup.string().required('Unique ID is required'),
                customerId: Yup.string().required('Customer is required'),
                soDetails: Yup.array()
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
            {({ values, errors, handleSubmit, isSubmitting }) => (
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
                                    name="id"
                                    component={FormInput}
                                    xs={6}
                                    type="text"
                                    label="ID"
                                    placeholder="Enter ID"
                                />
                                <Field
                                    name="customerId"
                                    component={FormSelect}
                                    xs={6}
                                    label="Customer"
                                    placeholder="Select Customer"
                                    items={customer}
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
                        )}{' '}
                        {activeStep === 1 && (
                            <FieldArray name="soDetails">
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
                                        {values.soDetails.length !== 0 && (
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
                                        {values.soDetails.map((item, index) => (
                                            <Grid
                                                item
                                                xs={12}
                                                container
                                                key={index}
                                            >
                                                <Grid item xs={4}>
                                                    <OutlinedInput
                                                        name={`bom.${index}.rmId`}
                                                        type="text"
                                                        disabled
                                                        value={item.fgId}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <OutlinedInput
                                                        name={`bom.${index}.quantity`}
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
                                        {isEdit ? 'Update' : 'Create'}
                                    </Button>
                                </Grid>
                            </>
                        )}
                        {isEdit && (
                            <Grid item xs={12}>
                                <Grid
                                    container
                                    justifyContent="center"
                                    alignItems="center"
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
                        )}
                    </Grid>
                </form>
            )}
        </Formik>
    )
}

export default Form
