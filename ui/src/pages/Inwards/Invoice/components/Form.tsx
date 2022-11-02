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
import { Fetch, useAuth } from '../../../../services'
import { Field, FieldArray, Formik, FormikHelpers } from 'formik'
import React, { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { FormInput } from '../../../../components'
import FormSelect from '../../../../components/FormSelect'
import { InvoiceInterface } from '../Invoice'
import { RawMaterialInterface } from '../../../RawMaterial/RawMaterial'

interface FormValues extends Required<InvoiceInterface> {
    submit: null
}

const Form = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isEdit = location.state ? true : false
    const {
        token: { token },
    } = useAuth()
    const [activeStep, setActiveStep] = React.useState(0)
    const [rawmaterial, setRawmaterial] = useState<
        Partial<RawMaterialInterface>[]
    >([])
    const [rawmaterialIdentifier, setRawmaterialIdentifier] =
        useState<keyof RawMaterialInterface>('description')
    const [selectedRm, setSelectedRm] = useState<{
        rm: Partial<RawMaterialInterface>
        quantity: number
    }>({
        rm: {},
        quantity: 0,
    })
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [error, setError] = useState('')
    let initialValues: FormValues = {
        invoiceNumber: '',
        supplierId: '',
        supplier: {
            name: '',
        },
        status: 'PO',
        rm: [],
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
            const data = Array.from(values.rm).map((val) => ({
                ...val,
                supplierId: values.supplierId,
                invoiceNumber: values.invoiceNumber,
                status: values.status,
            }))
            console.log(data)
            await Fetch({
                url:
                    '/inwards/invoice' +
                    (isEdit
                        ? '/' +
                          encodeURIComponent(initialValues.supplierId) +
                          '/' +
                          encodeURIComponent(initialValues.invoiceNumber)
                        : 's'),
                options: {
                    method: isEdit ? 'PUT' : 'POST',
                    body: data,
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

    const onDelete = async () => {
        try {
            await Fetch({
                url: `/inwards/invoice/${encodeURIComponent(
                    initialValues.supplierId
                )}/${encodeURIComponent(initialValues.invoiceNumber)}`,
                options: {
                    method: 'DELETE',
                    authToken: token,
                },
            })
            navigate('..')
        } catch (e) {
            setError((e as Error).message)
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

    const updateSupplier = async (supplierId: string) => {
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
                        where: JSON.stringify({
                            supplierId,
                        }),
                    },
                },
            })
            setRawmaterial(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const deleteRm = async (rmId: string) => {
        try {
            await Fetch({
                url: `/inwards/invoice/${encodeURIComponent(
                    initialValues.supplierId
                )}/${encodeURIComponent(
                    initialValues.invoiceNumber
                )}/${encodeURIComponent(rmId)}`,
                options: {
                    authToken: token,
                    method: 'DELETE',
                },
            })
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        Promise.all([getSupplier(), getRawmaterials()])
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
                invoiceNumber: Yup.string().required('Invoice No is required'),
                supplierId: Yup.string().required('Supplier is required'),
                status: Yup.string().required('Status is required'),
            })}
            onSubmit={onSubmit}
        >
            {({ values, errors, handleSubmit, isSubmitting, handleChange }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={3} />
                        <Grid item xs={6}>
                            <Stepper activeStep={activeStep}>
                                {['Basic Details', 'Raw Material'].map(
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
                                    name="supplierId"
                                    component={FormSelect}
                                    xs={6}
                                    label="Supplier"
                                    placeholder="Select Supplier"
                                    items={supplier}
                                    onChange={(e: SelectChangeEvent) => {
                                        handleChange(e)
                                        updateSupplier(e.target?.value)
                                    }}
                                />
                                <Field
                                    name="invoiceNumber"
                                    component={FormInput}
                                    xs={4}
                                    type="text"
                                    label="Invoice Number"
                                    placeholder="Enter Invoice Number"
                                />
                                <Field
                                    name="status"
                                    component={FormSelect}
                                    xs={2}
                                    label="Status"
                                    placeholder="Select Status"
                                    defaultValue="PO"
                                    items={[
                                        {
                                            value: 'PO',
                                        },
                                        {
                                            value: 'IQC',
                                        },
                                        {
                                            value: 'IN',
                                        },
                                    ]}
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
                            <FieldArray name="rm">
                                {({ remove, push }) => (
                                    <>
                                        <Grid item xs={1} />
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
                                                    label: 'ID',
                                                },
                                                {
                                                    label: 'DTPL Part Number',
                                                    value: 'dtplCode',
                                                },
                                            ]}
                                            onChange={(e: SelectChangeEvent) =>
                                                setRawmaterialIdentifier(
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
                                                options={rawmaterial}
                                                getOptionLabel={(option) =>
                                                    option[
                                                        rawmaterialIdentifier
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
                                                            !values.rm.find(
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
                                                Add
                                            </Button>
                                        </Grid>
                                        {errors.rm && (
                                            <Grid item xs={12}>
                                                <FormHelperText error>
                                                    {errors.rm as string}
                                                </FormHelperText>
                                            </Grid>
                                        )}
                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>
                                        {values.rm.length !== 0 && (
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
                                        {values.rm.map((item, index) => (
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
                                                        onClick={() => {
                                                            remove(index)
                                                            deleteRm(item.rmId)
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
                        {activeStep === 1 && errors.submit && (
                            <Grid item xs={12}>
                                <FormHelperText error>
                                    {errors.submit}
                                </FormHelperText>
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
                        {activeStep === 1 && isEdit && (
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
