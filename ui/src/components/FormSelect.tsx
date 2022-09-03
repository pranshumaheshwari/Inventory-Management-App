import React from 'react'
import { FormHelperText, Grid, InputLabel, MenuItem, RegularBreakpoints, Select, Stack } from '@mui/material'
import { FieldProps } from 'formik'

interface FormSelectInterface extends FieldProps {
    xs: RegularBreakpoints["xs"];
    label: string;
    placeholder: string;
    items: {
        value: string | number;
        label?: string;
    }[]
}

const FormSelect = ({ xs, label, field, form, items, placeholder }: FormSelectInterface) => {
    const meta = form.getFieldMeta(field.name)
    return (
        <Grid item xs={xs}>
            <Stack spacing={1}>
                <InputLabel id={label + '-label'}>{label}</InputLabel>
                <Select
                    id={label}
                    labelId={label + '-label'}
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    fullWidth
                    error={Boolean(meta.touched && meta.error)}
                >
                    <MenuItem
                        value=""
                        disabled
                        selected
                    >
                        {placeholder}
                    </MenuItem>
                    {
                        items.map(item => (
                            <MenuItem value={item.value} key={item.value}>
                                {item.label ? item.label : item.value}
                            </MenuItem>
                        ))
                    }
                </Select>
                {meta.touched && meta.error && (
                    <FormHelperText error id={"standard-weight-helper-text-" + field.name}>
                        {meta.error}
                    </FormHelperText>
                )}
            </Stack>
        </Grid>
    )
}

export default FormSelect