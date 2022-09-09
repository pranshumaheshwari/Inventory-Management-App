import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Formik, FormikHelpers, Field } from 'formik'
import { Button, CircularProgress, FormHelperText, Grid, InputLabel, OutlinedInput, Skeleton, Stack } from '@mui/material';
import { Fetch, useAuth } from '../../../services'
import { useLocation, useNavigate } from 'react-router-dom'
import { RawMaterialInterface } from '../RawMaterial'
import { FormInput } from '../../../components'
import FormSelect from '../../../components/FormSelect'

interface FormValues extends Required<RawMaterialInterface> {
    submit: null;
}

const Form = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isEdit = location.state ? true : false
    const { token: { token } } = useAuth()
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [error, setError] = useState('')
    const onSubmit = async (values: FormValues, { setErrors, setStatus, setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const resp = await Fetch({
                url: '/rawmaterial' + (isEdit ? '/' + encodeURIComponent((location.state as FormValues).id) : ''),
                options: {
                    method: isEdit ? "PUT" : "POST",
                    body: values,
                    authToken: token
                }
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
            const data = await Fetch({
                url: `/rawmaterial/${encodeURIComponent((location.state as FormValues).id)}`,
                options: {
                    method: "DELETE",
                    authToken: token
                }
            })
            navigate('..')
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getSuppliers = async () => {
        try {
            const data = await Fetch({
                url: '/suppliers',
                options: {
                    authToken: token
                }
            }).then(data => {
                return data.map((supplier: {
                    name: string;
                    id: string;
                }) => ({
                    label: supplier.name,
                    value: supplier.id
                }))
            })
            setSupplier(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getSuppliers()
    }, [])

    if (error) {
        <Grid item xs={12}>
            <FormHelperText error>{error}</FormHelperText>
        </Grid>
    }

    if (!supplier) {
        return (
            <Skeleton width="90vw" height="100%" />
        )
    }

    return (
        <Formik
            initialValues={isEdit ? location.state as FormValues : {
                id: '',
                description: '',
                dtplCode: '',
                category: '',
                unit: '',
                price: 0,
                storeStock: 0,
                iqcPendingStock: 0,
                lineStock: 0,
                supplierId: '',
                submit: null
            }}
            validationSchema={
                Yup.object().shape({
                    id: Yup.string().required('Unique ID is required'),
                    description: Yup.string().required('Description is required'),
                    dtplCode: Yup.string().required('DTPL Part Number is required'),
                    category: Yup.string().required('Category is required'),
                    supplierId: Yup.string().required('Supplier is required'),
                    unit: Yup.string().required('Unit is required'),
                    price: Yup.number().moreThan(0).required('Price is required'),
                    iqcPendingStock: Yup.number().min(0),
                    storeStock: Yup.number().min(0),
                    lineStock: Yup.number().min(0),
                })
            }
            onSubmit={onSubmit}
        >
            {({ errors, handleSubmit, isSubmitting }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Field
                            name="id"
                            component={FormInput}
                            xs={2}
                            type="text"
                            label="ID"
                            placeholder="Enter ID"
                        />
                        <Field
                            name="description"
                            component={FormInput}
                            xs={6}
                            type="text"
                            label="Description"
                            placeholder="Enter Description"
                        />
                        <Field
                            name="dtplCode"
                            component={FormInput}
                            xs={4}
                            type="text"
                            label="DTPL Part Number"
                            placeholder="Enter DTPL Part Number"
                        />
                        <Field
                            name="supplierId"
                            component={FormSelect}
                            xs={4}
                            label="Supplier"
                            placeholder="Select Supplier"
                            items={supplier}
                        />
                        <Field
                            name="category"
                            component={FormSelect}
                            xs={3}
                            label="Category"
                            placeholder="Select Category"
                            items={[
                                {
                                    value: 'Coil',
                                },
                                {
                                    value: 'Connector',
                                },
                                {
                                    value: 'Consumables',
                                },
                                {
                                    value: 'Fuse',
                                },
                                {
                                    value: 'Grommet',
                                },
                                {
                                    value: 'Misc',
                                },
                                {
                                    value: 'Sleeve',
                                },
                                {
                                    value: 'Sticker',
                                },
                                {
                                    value: 'Tape',
                                },
                                {
                                    value: 'Terminal',
                                },
                                {
                                    value: 'Wire',
                                },
                            ]}
                        />
                        <Field
                            name="unit"
                            component={FormInput}
                            xs={2}
                            type="text"
                            label="Unit"
                            placeholder="Enter Unit"
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
                            name="iqcPendingStock"
                            component={FormInput}
                            xs={4}
                            type="number"
                            label="IQC Pending Stock"
                            placeholder="Enter IQC Stock"
                        />
                        <Field
                            name="storeStock"
                            component={FormInput}
                            xs={4}
                            type="number"
                            label="Store Stock"
                            placeholder="Enter Store Stock"
                        />
                        <Field
                            name="lineStock"
                            component={FormInput}
                            xs={4}
                            type="number"
                            label="Line Stock"
                            placeholder="Enter Line Stock"
                        />
                        {errors.submit && (
                            <Grid item xs={12}>
                                <FormHelperText error>{errors.submit}</FormHelperText>
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
                                {isEdit ? "Update" : "Create"}
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
                        {
                            isEdit && (
                                <Grid item xs={12}>
                                    <Grid
                                        container
                                        justifyContent='center'
                                        alignItems='center'
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
                            )
                        }
                    </Grid>
                </form>
            )}
        </Formik>
    )
}

export default Form