import * as Yup from 'yup'

import {
    Button,
    CircularProgress,
    FormHelperText,
    Grid,
    Typography,
} from '@mui/material'
import { DatePicker, FormInput } from '../../components'
import { Fetch, useAuth } from '../../services'
import { Field, Formik, FormikHelpers } from 'formik'
import React, { useContext } from 'react'
import dayjs, { Dayjs } from 'dayjs'

import { AlertContext } from '../../context'

interface AttendanceInterface {
    date: Dayjs
    number: number
}

interface FormValues extends Required<AttendanceInterface> {
    submit: null
}

const Attendance = () => {
    const {
        token: { token },
    } = useAuth()
    const { setAlert } = useContext(AlertContext)

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
                url: '/attendance',
                options: {
                    method: 'POST',
                    body: {
                        ...values,
                        date: values.date.toISOString(),
                    },
                    authToken: token,
                },
            })
            resetForm()
            setSubmitting(false)
            setAlert({
                type: 'success',
                children: (
                    <Typography>
                        Succesfully created new attendance record with ID -{' '}
                        {resp.id}
                    </Typography>
                ),
            })
        } catch (err) {
            setStatus({ success: false })
            setErrors({ submit: (err as Error).message })
            setSubmitting(false)
        }
    }

    return (
        <Formik
            initialValues={{
                submit: null,
                number: 0,
                date: dayjs(),
            }}
            validationSchema={Yup.object().shape({
                date: Yup.date().required('Date is required'),
                number: Yup.number().min(1).required('Attendance is required'),
            })}
            onSubmit={onSubmit}
        >
            {({
                errors,
                handleSubmit,
                isSubmitting,
                setValues,
                values,
                handleChange,
            }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Field
                            name="number"
                            component={FormInput}
                            xs={6}
                            type="number"
                            label="Attendance"
                            placeholder="Enter Attendance"
                        />
                        <DatePicker
                            name="date"
                            xs={6}
                            label="Date"
                            value={values.date}
                            onChange={(value: Dayjs | null) => {
                                setValues((values) => ({
                                    ...values,
                                    date: value ? value : dayjs(),
                                }))
                            }}
                        />
                        {errors.submit && (
                            <Grid item xs={12}>
                                <FormHelperText error>
                                    {errors.submit}
                                </FormHelperText>
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

export default Attendance
