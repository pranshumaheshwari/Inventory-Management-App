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
import { FinishedGoodsInterface } from '../FinishedGood'
import { FormInput } from '../../../components'
import FormSelect from '../../../components/FormSelect'
import { InputAutoComplete } from '../../common'
import { RawMaterialInterface } from '../../RawMaterial/RawMaterial'
import { useConfirm } from 'material-ui-confirm'

interface FormValues extends Required<FinishedGoodsInterface> {
    submit: null
}

const Form = () => {
    const { setAlert } = useContext(AlertContext)
    const navigate = useNavigate()
    const confirm = useConfirm()
    const location = useLocation()
    const isEdit = location.state ? true : false
    const {
        token: { token },
    } = useAuth()
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = React.useState(0)
    const [rawmaterial, setRawmaterial] =
        useState<Partial<RawMaterialInterface>[]>()
    const [selectedRm, setSelectedRm] = useState<{
        rm: Partial<RawMaterialInterface>
        quantity: number
    }>({
        rm: {},
        quantity: 0,
    })
    let initialValues: FormValues = {
        id: '',
        description: '',
        category: '',
        price: 0,
        manPower: 0,
        overheads: 0,
        storeStock: 0,
        customerId: '',
        bom: [],
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
            const resp = await Fetch({
                url:
                    '/finishedgoods' +
                    (isEdit ? '/' + encodeURIComponent(initialValues.id) : ''),
                options: {
                    method: isEdit ? 'PUT' : 'POST',
                    body: values,
                    authToken: token,
                },
            })
            setAlert({
                type: 'success',
                children: (
                    <Typography>
                        Succesfully {isEdit ? 'edited' : 'created'} finished
                        good with ID - {resp.id}
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
            description: `This will delete finished good ${initialValues.id}`,
        })
            .then(async () => {
                try {
                    const resp = await Fetch({
                        url: `/finishedgoods/${encodeURIComponent(
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
                                Succesfully deleted finished good with ID -{' '}
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

    const getRawmaterials = async () => {
        try {
            const data = await Fetch({
                url: '/rawmaterial',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            description: true,
                            dtplCode: true,
                        }),
                    },
                },
            })
            setRawmaterial(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        Promise.all([getCustomers(), getRawmaterials()])
    }, [])

    if (!customer || !rawmaterial) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={Yup.object().shape({
                id: Yup.string().required('Unique ID is required'),
                description: Yup.string().required('Description is required'),
                category: Yup.string().required('Category is required'),
                customerId: Yup.string().required('Customer is required'),
                price: Yup.number().moreThan(0).required('Price is required'),
                storeStock: Yup.number().min(0),
                manPower: Yup.number().min(0),
                overheads: Yup.number().min(0),
                bom: Yup.array().of(
                    Yup.object().shape({
                        rmId: Yup.string().required(
                            'Raw Material Identifier is required'
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
                                {['Basic Details', 'Bill of Material'].map(
                                    (label, index) => {
                                        const stepProps: {
                                            completed?: boolean
                                        } = {}
                                        const labelProps: {
                                            optional?: React.ReactNode
                                        } = {}
                                        if (index === 1) {
                                            labelProps.optional = (
                                                <Typography variant="caption">
                                                    Optional
                                                </Typography>
                                            )
                                        }
                                        return (
                                            <Step key={label} {...stepProps}>
                                                <StepLabel {...labelProps}>
                                                    {label}
                                                </StepLabel>
                                            </Step>
                                        )
                                    }
                                )}
                            </Stepper>
                        </Grid>
                        <Grid item xs={3} />
                        {activeStep === 0 && (
                            <>
                                <Field
                                    name="id"
                                    component={FormInput}
                                    xs={4}
                                    type="text"
                                    label="ID"
                                    placeholder="Enter ID"
                                />
                                <Field
                                    name="description"
                                    component={FormInput}
                                    xs={8}
                                    type="text"
                                    label="Description"
                                    placeholder="Enter Description"
                                />
                                <Field
                                    name="customerId"
                                    component={FormSelect}
                                    xs={6}
                                    label="Customer"
                                    placeholder="Select Customer"
                                    items={customer}
                                />
                                <Field
                                    name="category"
                                    component={FormSelect}
                                    xs={6}
                                    label="Category"
                                    placeholder="Select Category"
                                    items={[
                                        {
                                            value: 'Fuse_Box',
                                            label: 'Fuse Box',
                                        },
                                        {
                                            value: 'Indicator',
                                        },
                                        {
                                            value: 'Magneto',
                                        },
                                        {
                                            value: 'Battery_Cable',
                                            label: 'Battery Cable',
                                        },
                                        {
                                            value: 'Lead_Wire',
                                            label: 'Lead Wire',
                                        },
                                        {
                                            value: 'Piaggio',
                                        },
                                        {
                                            value: 'Pigtail',
                                        },
                                        {
                                            value: 'SPD',
                                        },
                                    ]}
                                />
                                <Field
                                    name="price"
                                    component={FormInput}
                                    xs={3}
                                    type="number"
                                    label="Price"
                                    placeholder="Enter Price"
                                />
                                <Field
                                    name="storeStock"
                                    component={FormInput}
                                    xs={3}
                                    type="number"
                                    label="Store Stock"
                                    placeholder="Enter Store Stock"
                                />
                                <Field
                                    name="manPower"
                                    component={FormInput}
                                    xs={3}
                                    type="number"
                                    label="Man Power"
                                    placeholder="Enter Man Power"
                                />
                                <Field
                                    name="overheads"
                                    component={FormInput}
                                    xs={3}
                                    type="number"
                                    label="Overheads"
                                    placeholder="Enter Overheads"
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
                            <FieldArray name="bom">
                                {({ remove, push }) => (
                                    <>
                                        <InputAutoComplete<
                                            Partial<RawMaterialInterface>
                                        >
                                            identifierXs={4}
                                            defaultIdentifier="description"
                                            identifierItems={[
                                                {
                                                    value: 'description',
                                                    label: 'Description',
                                                },
                                                {
                                                    value: 'id',
                                                    label: 'ID',
                                                },
                                                {
                                                    label: 'DTPL Part Number',
                                                    value: 'dtplCode',
                                                },
                                            ]}
                                            itemXs={6}
                                            label="Raw Material"
                                            name="rmId"
                                            options={rawmaterial}
                                            uniqueIdentifier="id"
                                            placeholder="Select Raw Material"
                                            onChange={(
                                                e: SyntheticEvent,
                                                value
                                            ) =>
                                                setSelectedRm((selectedRm) => {
                                                    if (value)
                                                        return {
                                                            ...selectedRm,
                                                            rm: value,
                                                        }
                                                    return selectedRm
                                                })
                                            }
                                        />
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
                                                setSelectedRm((selectedRm) => ({
                                                    ...selectedRm,
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
                                                        selectedRm.quantity &&
                                                        selectedRm.rm &&
                                                        selectedRm.rm.id
                                                    ) {
                                                        if (
                                                            !values.bom.find(
                                                                (r) =>
                                                                    r.rmId ===
                                                                    selectedRm
                                                                        .rm.id
                                                            )
                                                        ) {
                                                            push({
                                                                rmId: selectedRm
                                                                    .rm.id,
                                                                quantity:
                                                                    selectedRm.quantity,
                                                            })
                                                        }
                                                    }
                                                }}
                                            >
                                                Add to BOM
                                            </Button>
                                        </Grid>
                                        {errors.bom && (
                                            <Grid item xs={12}>
                                                <FormHelperText error>
                                                    {errors.bom as string}
                                                </FormHelperText>
                                            </Grid>
                                        )}
                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>
                                        {values.bom.length !== 0 && (
                                            <Grid item xs={12} container>
                                                <Grid item xs={4}>
                                                    <Typography variant="h6">
                                                        Raw Material Identifier
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
                                        {values.bom.map((item, index) => (
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
                                                        value={item.rmId}
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
                                                            // TODO - if isEdit then make a DELETE call to bom
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
