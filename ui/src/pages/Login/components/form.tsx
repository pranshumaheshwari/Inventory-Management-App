import React from 'react'
import * as Yup from 'yup'
import { Formik, FormikHelpers } from 'formik'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { Button, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack } from '@mui/material';
import { Fetch, useAuth } from '../../../services'

type Props = {}

interface FormValues {
    username: string;
    password: string;
    submit: null
}

const LoginForm = (props: Props) => {
    const { setToken } = useAuth()
    const [showPassword, setShowPassword] = React.useState(false)
    const onSubmit = async (values: FormValues, { setErrors, setStatus, setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            const token = await Fetch({
                url: '/login',
                options: {
                    method: "POST",
                    body: {
                        "username": values.username,
                        "password": values.password
                    }
                }
            })
            setToken(token)
        } catch(err) {
            setStatus({ success: false });
            setErrors({ submit: (err as Error).message });
            setSubmitting(false);
        }
    }
    return (
        <Formik
            initialValues={{
                username: '',
                password: '',
                submit: null
            }}
            validationSchema={
                Yup.object().shape({
                    username: Yup.string().required('Username is required'),
                    password: Yup.string().required('Password is required')
                })
            }
            onSubmit={onSubmit}
        >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="username">Username</InputLabel>
                                <OutlinedInput
                                    id="username"
                                    type="text"
                                    value={values.username}
                                    name="username"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    fullWidth
                                    error={Boolean(touched.username && errors.username)}
                                />
                                {touched.username && errors.username && (
                                    <FormHelperText error id="standard-weight-helper-text-username">
                                        {errors.username}
                                    </FormHelperText>
                                )}
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="password">Password</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    error={Boolean(touched.password && errors.password)}
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={values.password}
                                    name="password"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={(e) => {setShowPassword(!showPassword)}}
                                                onMouseDown={(e) => {e.preventDefault()}}
                                                edge="end"
                                                size="large"
                                            >
                                                {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    placeholder="Enter password"
                                />
                                {touched.password && errors.password && (
                                    <FormHelperText error id="standard-weight-helper-text-password">
                                        {errors.password}
                                    </FormHelperText>
                                )}
                            </Stack>
                        </Grid>
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
                                Login
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            )}
        </Formik>
    )
}

export default LoginForm