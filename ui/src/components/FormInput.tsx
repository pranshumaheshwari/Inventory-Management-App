import React, { ChangeEvent } from 'react'
import { FormHelperText, Grid, InputLabel, OutlinedInput, RegularBreakpoints, Stack } from '@mui/material'
import { FieldProps } from 'formik'

interface FormInputInterface extends FieldProps {
    xs: RegularBreakpoints["xs"];
    label: string;
    type: string;
    placeholder?: string;
    onChange?: (e: ChangeEvent) => void;
}

const FormInput = ({ xs, label, type, placeholder, field, form, onChange }: FormInputInterface) => {
    const meta = form.getFieldMeta(field.name)
    return (
        <Grid item xs={xs}>
            <Stack spacing={1}>
                <InputLabel htmlFor={label}>{label}</InputLabel>
                <OutlinedInput
                    id={label}
                    type={type}
                    value={field.value}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={onChange ? onChange : field.onChange}
                    placeholder={placeholder}
                    fullWidth
                    error={Boolean(meta.touched && meta.error)}
                />
                {meta.touched && meta.error && (
                    <FormHelperText error id={"standard-weight-helper-text-" + field.name}>
                        {meta.error}
                    </FormHelperText>
                )}
            </Stack>
        </Grid>
    )
}

export default FormInput