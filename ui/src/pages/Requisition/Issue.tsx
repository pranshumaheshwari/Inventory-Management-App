import * as Yup from 'yup'

import {
    Button,
    Divider,
    FormHelperText,
    Grid,
    SelectChangeEvent,
    Skeleton,
    Step,
    StepLabel,
    Stepper,
    Typography,
} from '@mui/material'
import { Fetch, useAuth } from '../../services'
import { Field, FieldArray, Formik, FormikHelpers } from 'formik'
import { FormInput, FormSelect } from '../../components'
import React, {
    ChangeEvent,
    SyntheticEvent,
    useContext,
    useEffect,
    useState,
} from 'react'

import { AlertContext } from '../../context'
import { InputAutoComplete } from '../common'
import { RawMaterialInterface } from '../RawMaterial/RawMaterial'
import { useConfirm } from 'material-ui-confirm'

interface RequisitionIssueInterface {
    requisitionId: number
    fgId: string
    details: {
        rmId: string
        quantity: number
    }[]
}
interface FormValues extends Required<RequisitionIssueInterface> {
    submit: null
}

interface RM extends Partial<RawMaterialInterface> {
    bomQuantity?: number
}

const RequisitionIssue = () => {
    const { setAlert } = useContext(AlertContext)
    const {
        token: { token },
    } = useAuth()
    const [activeStep, setActiveStep] = React.useState(0)
    const [finishedGoods, setFinishedGoods] = useState<
        {
            value: string
            label: string
        }[]
    >([])
    const [rawmaterial, setRawmaterial] = useState<RM[]>([])
    const [selectedRm, setSelectedRm] = useState<{
        rm: RM
        quantity: number
    }>({
        rm: {},
        quantity: 0,
    })
    const [error, setError] = useState('')
    let initialValues: FormValues = {
        requisitionId: 0,
        fgId: '',
        details: [],
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
            await Fetch({
                url: '/requisition/issueMany',
                options: {
                    method: 'POST',
                    body: {
                        requisitionId: values.requisitionId,
                        details: values.details,
                    },
                    authToken: token,
                },
            })
            setAlert({
                type: 'success',
                children: (
                    <Typography>
                        Successfully issued against requisition -{' '}
                        {values.requisitionId}
                    </Typography>
                ),
            })
            resetForm()
            setActiveStep(0)
            setRawmaterial([])
            setSelectedRm({
                rm: {},
                quantity: 0,
            })
        } catch (err) {
            setStatus({ success: false })
            setErrors({ submit: (err as Error).message })
            setSubmitting(false)
        }
    }

    const getFinishedGoods = async () => {
        try {
            const data = await Fetch({
                url: '/requisition',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            fgId: true,
                            quantity: true,
                        }),
                        where: JSON.stringify({
                            status: {
                                in: ['Ready', 'Running'],
                            },
                        }),
                    },
                },
            }).then((data) => {
                return data.map(
                    (requisition: {
                        fgId: string
                        id: string
                        quantity: number
                    }) => ({
                        label: `${requisition.id} - ${requisition.fgId} WITH QTY ${requisition.quantity}`,
                        value: requisition.id.toString(),
                    })
                )
            })
            setFinishedGoods(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getRawmaterial = async (requisitionId: number) => {
        try {
            const data = await Fetch({
                url: '/requisition',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            quantity: true,
                            fg: {
                                select: {
                                    bom: {
                                        select: {
                                            quantity: true,
                                            rm: {
                                                select: {
                                                    id: true,
                                                    description: true,
                                                    dtplCode: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        }),
                        where: JSON.stringify({
                            id: requisitionId,
                        }),
                    },
                },
            })
                .then(
                    (
                        data: {
                            quantity: number
                            fg: {
                                bom: {
                                    quantity: number
                                    rm: {
                                        id: string
                                        description: string
                                        dtplCode: string
                                    }
                                }[]
                            }
                        }[]
                    ) => data[0]
                )
                .then((data) =>
                    data.fg.bom.map((b) => ({
                        ...b.rm,
                        bomQuantity: b.quantity * data.quantity,
                    }))
                )
            setRawmaterial(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getFinishedGoods()
    }, [])

    if (!finishedGoods) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={Yup.object().shape({
                requisitionId: Yup.number().required(
                    'Requisition ID is required'
                ),
                details: Yup.array(
                    Yup.object().shape({
                        rmId: Yup.string().required('Raw Material is required'),
                        quantity: Yup.string().required('Quantity is required'),
                    })
                ),
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
                                    (label) => {
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
                                    name="requisitionId"
                                    component={FormSelect}
                                    xs={12}
                                    label="Requisition"
                                    placeholder="Select Requisition"
                                    items={finishedGoods}
                                    onChange={(e: SelectChangeEvent) => {
                                        handleChange(e)
                                        getRawmaterial(parseInt(e.target.value))
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
                                        <InputAutoComplete<
                                            Partial<RawMaterialInterface>
                                        >
                                            identifierXs={3}
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
                                            itemXs={5}
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
                                        <Field
                                            name="requiredQuanity"
                                            component={FormInput}
                                            xs={2}
                                            type="number"
                                            label="Required Quantity"
                                            value={selectedRm.rm.bomQuantity}
                                            disabled
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
                                                            !values.details.find(
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
                                        {errors.details && (
                                            <Grid item xs={12}>
                                                <FormHelperText error>
                                                    {errors.details as string}
                                                </FormHelperText>
                                            </Grid>
                                        )}
                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>
                                        {values.details.length !== 0 && (
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
                                                <Field
                                                    name={`details.${index}.rmId`}
                                                    component={FormInput}
                                                    xs={4}
                                                    type="text"
                                                    disabled
                                                />
                                                <Field
                                                    name={`details.${index}.quantity`}
                                                    component={FormInput}
                                                    xs={4}
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
                                                        }}
                                                    >
                                                        DELETE
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={1} />
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

export default RequisitionIssue
