import * as Yup from 'yup'

import {
    Button,
    CircularProgress,
    FormHelperText,
    Grid,
    Typography,
} from '@mui/material'
import { Fetch, useAuth } from '../../../services'
import { Field, Formik, FormikHelpers } from 'formik'
import React, { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AlertContext } from '../../../context'
import { CustomerInterface } from '../Customers'
import { FormInput } from '../../../components'
import { useConfirm } from 'material-ui-confirm'

interface FormValues extends Required<CustomerInterface> {
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
    const [error, setError] = useState('')
    const onSubmit = async (
        values: FormValues,
        { setErrors, setStatus, setSubmitting }: FormikHelpers<FormValues>
    ) => {
        try {
            const resp = await Fetch({
                url:
                    '/customers' +
                    (isEdit
                        ? '/' +
                          encodeURIComponent((location.state as FormValues).id)
                        : ''),
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
                        Succesfully {isEdit ? 'edited' : 'created'} customer
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
            description: `This will delete customer ${
                (location.state as FormValues).id
            }`,
        })
            .then(async () => {
                try {
                    const resp = await Fetch({
                        url: `/customers/${encodeURIComponent(
                            (location.state as FormValues).id
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
                                Succesfully deleted customer with ID - {resp.id}
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

    return (
        <Formik
            initialValues={
                isEdit
                    ? (location.state as FormValues)
                    : {
                          id: '',
                          name: '',
                          address1: '',
                          address2: '',
                          city: '',
                          state: '',
                          gst: '',
                          submit: null,
                      }
            }
            validationSchema={Yup.object().shape({
                id: Yup.string().required('Unique ID is required'),
                name: Yup.string().required('Name is required'),
                address1: Yup.string(),
                address2: Yup.string(),
                city: Yup.string().required('City is required'),
                state: Yup.string().required('State is required'),
                gst: Yup.string()
                    .length(15)
                    .required('GST No. with length of 15 is required'),
            })}
            onSubmit={onSubmit}
        >
            {({ errors, handleSubmit, isSubmitting }) => (
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
                                {isEdit ? 'Update' : 'Create'}
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
