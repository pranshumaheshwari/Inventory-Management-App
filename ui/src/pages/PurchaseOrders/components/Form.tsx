import * as Yup from 'yup'

import {
    Autocomplete,
    Button,
    Divider,
    FormHelperText,
    Grid,
    InputLabel,
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
import { FormInput, FormSelect } from '../../../components'
import React, {
    ChangeEvent,
    SyntheticEvent,
    useContext,
    useEffect,
    useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AlertContext } from '../../../context'
import { PurchaseOrdersInterface } from '../PurchaseOrders'
import { RawMaterialInterface } from '../../RawMaterial/RawMaterial'
import { useConfirm } from 'material-ui-confirm'

interface FormValues extends Required<PurchaseOrdersInterface> {
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
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = React.useState(0)
    const [rawMaterial, setRawMaterial] =
        useState<Partial<RawMaterialInterface>[]>()
    const [rawMaterialIdentifier, setRawMaterialIdentifier] =
        useState<keyof RawMaterialInterface>('description')
    const [selectedRm, setSelectedRm] = useState<{
        rm: Partial<RawMaterialInterface>
        quantity: number
        price: number
    }>({
        rm: {},
        quantity: 0,
        price: 0,
    })
    let initialValues: FormValues = {
        id: '',
        supplierId: '',
        status: 'Open',
        poDetails: [],
        supplier: {
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
            const resp = await Fetch({
                url: '/purchaseorders',
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
                        Succesfully {isEdit ? 'edited' : 'created'} Purchase
                        Order with ID - {resp.id}
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
            description: `This will delete Purchase Order ${initialValues.id}`,
        })
            .then(async () => {
                try {
                    const resp = await Fetch({
                        url: `/purchaseorders`,
                        options: {
                            method: 'DELETE',
                            authToken: token,
                            body: initialValues,
                        },
                    })
                    setAlert({
                        type: 'warning',
                        children: (
                            <Typography>
                                Succesfully deleted Purchase Order with ID -{' '}
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

    const onDeleteRm = async (rmId: string) => {
        confirm({
            description: `This will delete raw material ${rmId} from Purchase Order ${initialValues.id}`,
        })
            .then(async () => {
                try {
                    await Fetch({
                        url: `/purchaseorders/details`,
                        options: {
                            method: 'DELETE',
                            authToken: token,
                            body: {
                                poId: initialValues.id,
                                rmId,
                            },
                        },
                    })
                } catch (e) {
                    setError((e as Error).message)
                }
            })
            .catch(() => {})
    }

    const getSuppliers = async () => {
        try {
            const data = await Fetch({
                url: '/suppliers',
                options: {
                    authToken: token,
                },
            }).then((data) => {
                return data.map((customer: { name: string; id: string }) => ({
                    label: customer.name,
                    value: customer.id,
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
                url: '/rawmaterial',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            description: true,
                            dtplCode: true,
                            price: true,
                        }),
                    },
                },
            })
            setRawMaterial(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        Promise.all([getSuppliers(), getRawMaterials()])
    }, [])

    if (!supplier || !rawMaterial) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={Yup.object().shape({
                id: Yup.string().required('Unique ID is required'),
                supplierId: Yup.string().required('Supplier is required'),
                poDetails: Yup.array()
                    .min(1)
                    .of(
                        Yup.object().shape({
                            rmId: Yup.string().required(
                                'Raw Material Identifier is required'
                            ),
                            quantity: Yup.number()
                                .min(0)
                                .required('Quantity is required'),
                            price: Yup.number()
                                .min(0)
                                .required('Raw Material Price required'),
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
                                {['Basic Details', 'List of Raw Material'].map(
                                    (label, index) => {
                                        const stepProps: {
                                            completed?: boolean
                                        } = {}
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
                                    xs={6}
                                    type="text"
                                    label="ID"
                                    placeholder="Enter ID"
                                />
                                <Field
                                    name="supplierId"
                                    component={FormSelect}
                                    xs={6}
                                    label="Supplier"
                                    placeholder="Select Supplier"
                                    items={supplier}
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
                            <FieldArray name="poDetails">
                                {({ remove, push }) => (
                                    <>
                                        <Field
                                            name="RmSelect"
                                            component={FormSelect}
                                            xs={4}
                                            label="Raw Material Field"
                                            placeholder="Select Raw Material Field"
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
                                                {
                                                    value: 'dtplCode',
                                                    label: 'DTPL Part Number',
                                                },
                                            ]}
                                            onChange={(e: SelectChangeEvent) =>
                                                setRawMaterialIdentifier(
                                                    e.target
                                                        ?.value as keyof RawMaterialInterface
                                                )
                                            }
                                        />
                                        <Grid item xs={4}>
                                            <InputLabel htmlFor="rmId">
                                                Raw Material
                                            </InputLabel>
                                            <Autocomplete
                                                id="rmId"
                                                options={rawMaterial}
                                                getOptionLabel={(option) =>
                                                    option[
                                                        rawMaterialIdentifier
                                                    ] as string
                                                }
                                                disablePortal
                                                onChange={(
                                                    e: SyntheticEvent,
                                                    value
                                                ) =>
                                                    setSelectedRm(
                                                        (selectedRm) => {
                                                            if (value)
                                                                return {
                                                                    ...selectedRm,
                                                                    rm: value,
                                                                    price: value.price
                                                                        ? value.price
                                                                        : 0,
                                                                }
                                                            return selectedRm
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
                                                setSelectedRm((selectedRm) => ({
                                                    ...selectedRm,
                                                    quantity: parseFloat(
                                                        e.target?.value
                                                    ),
                                                }))
                                            }
                                        />
                                        <Field
                                            name="price"
                                            component={FormInput}
                                            xs={2}
                                            type="number"
                                            label="Price"
                                            placeholder="Enter Price"
                                            value={
                                                selectedRm
                                                    ? selectedRm.rm.price
                                                    : 0
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                setSelectedRm((selectedRm) => ({
                                                    ...selectedRm,
                                                    price: parseFloat(
                                                        e.target?.value
                                                    ),
                                                    rm: {
                                                        ...selectedRm.rm,
                                                        price: parseInt(
                                                            e.target.value
                                                        ),
                                                    },
                                                }))
                                            }
                                        />
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
                                                            !values.poDetails.find(
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
                                                                price: selectedRm.price,
                                                            })
                                                        }
                                                    }
                                                }}
                                            >
                                                Add to Purchase Order
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>
                                        {values.poDetails.length !== 0 && (
                                            <Grid item xs={12} container>
                                                <Grid item xs={4}>
                                                    <Typography variant="h6">
                                                        Raw Material Part Number
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="h6">
                                                        Quantity
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="h6">
                                                        Price
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        )}
                                        {values.poDetails.map((item, index) => (
                                            <Grid
                                                item
                                                xs={12}
                                                container
                                                key={index}
                                            >
                                                <Field
                                                    name={`poDetails.${index}.rmId`}
                                                    component={FormInput}
                                                    xs={3}
                                                    type="text"
                                                    disabled
                                                />
                                                <Field
                                                    name={`poDetails.${index}.quantity`}
                                                    component={FormInput}
                                                    xs={3}
                                                    type="number"
                                                />
                                                <Field
                                                    name={`poDetails.${index}.price`}
                                                    component={FormInput}
                                                    xs={3}
                                                    type="number"
                                                />
                                                <Grid item xs={1} />
                                                <Grid item xs={2}>
                                                    <Button
                                                        disableElevation
                                                        disabled={isSubmitting}
                                                        fullWidth
                                                        size="small"
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => {
                                                            remove(index)
                                                            onDeleteRm(
                                                                item.rmId
                                                            )
                                                        }}
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
