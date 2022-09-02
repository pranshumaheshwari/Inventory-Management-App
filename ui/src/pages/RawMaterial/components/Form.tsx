import React from 'react'
import * as Yup from 'yup'
import { Formik, FormikHelpers, Field } from 'formik'
import { Button, CircularProgress, FormHelperText, Grid, InputLabel, OutlinedInput, Stack } from '@mui/material';
import { Fetch, useAuth } from '../../../services'
import { useNavigate } from 'react-router-dom'
import { RawMaterialInterface } from '../RawMaterial';
import { FormInput } from '../../../components';

interface FormValues extends Required<RawMaterialInterface> {
    submit: null;
}

const Form = () => {
    const navigate = useNavigate()
    const { token } = useAuth()
    const onSubmit = async (values: FormValues, { setErrors, setStatus, setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const resp = await Fetch({
                url: '/rm',
                options: {
                    method: "POST",
                    body: values,
                    authToken: token.token
                }
            })
            navigate('..')
        } catch (err) {
            setStatus({ success: false });
            setErrors({ submit: (err as Error).message });
            setSubmitting(false);
        }
    }
    return (
        <Formik
            initialValues={{
                id: '',
                description: '',
                dtplCode: '',
                category: '',
                unit: '',
                price: 0,
                storeStock: 0,
                iqcPendingStock: 0,
                lineStock: 0,
                submit: null
            }}
            validationSchema={
                Yup.object().shape({
                    id: Yup.string().required('Unique ID is required'),
                    description: Yup.string().required('Name is required'),
                    unit: Yup.string().required('City is required'),
                    state: Yup.string().required('State is required'),
                    gst: Yup.string().length(15).required('GST No. with length of 15 is required')
                })
            }
            onSubmit={onSubmit}
        >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
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

export default Form