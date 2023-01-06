import {
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    RegularBreakpoints,
    Select,
    SelectChangeEvent,
    Stack,
} from '@mui/material'
import React, { ReactNode } from 'react'

import { FieldProps } from 'formik'

interface FormSelectInterface extends FieldProps {
    xs: RegularBreakpoints['xs']
    label: string
    placeholder: string
    defaultValue?: string
    items: {
        value: string | number
        label?: string
    }[]
    onChange?:
        | ((event: SelectChangeEvent, child: ReactNode) => void)
        | undefined
}

const FormSelect = ({
    xs,
    label,
    field,
    form,
    items,
    placeholder,
    defaultValue,
    onChange,
}: FormSelectInterface) => {
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
                    onChange={onChange ? onChange : field.onChange}
                    fullWidth
                    error={Boolean(meta.touched && meta.error)}
                    defaultValue={defaultValue}
                >
                    <MenuItem value="" disabled selected>
                        {placeholder}
                    </MenuItem>
                    {items &&
                        items.map((item) => (
                            <MenuItem value={item.value} key={item.value}>
                                {item.label ? item.label : item.value}
                            </MenuItem>
                        ))}
                </Select>
                {meta.touched && meta.error && (
                    <FormHelperText
                        error
                        id={'standard-weight-helper-text-' + field.name}
                    >
                        {meta.error}
                    </FormHelperText>
                )}
            </Stack>
        </Grid>
    )
}

export default FormSelect
