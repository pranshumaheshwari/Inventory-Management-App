import React from 'react'
import * as Yup from 'yup'
import { Formik, FormikHelpers, Field } from 'formik'
import { Button, CircularProgress, FormHelperText, Grid, InputLabel, OutlinedInput, Stack } from '@mui/material';
import { Fetch, useAuth } from '../../../services'
import { useNavigate } from 'react-router-dom'
import { SupplierInterface } from '../Suppliers';
import { FormInput } from '../../../components';

interface FormValues extends Required<SupplierInterface> {
    submit: null;
}

const Form = () => {
    const navigate = useNavigate()
    const { token } = useAuth()
    const onSubmit = async (values: FormValues, { setErrors, setStatus, setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const resp = await Fetch({
                url: '/supplier',
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
                name: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                gst: '',
                submit: null
            }}
            validationSchema={
                Yup.object().shape({
                    id: Yup.string().required('Unique ID is required'),
                    name: Yup.string().required('Name is required'),
                    address1: Yup.string(),
                    address2: Yup.string(),
                    city: Yup.string().required('City is required'),
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
                            xs={4}
                            type="text"
                            label="ID"
                            placeholder="Enter ID"
                        />
                        <Field 
                            name="name" 
                            component={FormInput}
                            xs={8}
                            type="text"
                            label="Name"
                            placeholder="Enter name"
                        />
                        <Field 
                            name="address1" 
                            component={FormInput}
                            xs={6}
                            type="text"
                            label="Address 1"
                            placeholder="Address 1"
                        />
                        <Field 
                            name="address2" 
                            component={FormInput}
                            xs={6}
                            type="text"
                            label="Address 2"
                            placeholder="Address 2"
                        />
                        <Field 
                            name="city" 
                            component={FormInput}
                            xs={4}
                            type="text"
                            label="City"
                            placeholder="City"
                        />
                        <Field 
                            name="state" 
                            component={FormInput}
                            xs={4}
                            type="text"
                            label="State"
                            placeholder="State"
                        />
                        <Field 
                            name="gst" 
                            component={FormInput}
                            xs={4}
                            type="text"
                            label="GST"
                            placeholder="GST"
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