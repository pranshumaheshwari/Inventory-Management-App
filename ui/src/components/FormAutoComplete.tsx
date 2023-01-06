import {
    Autocomplete,
    FormHelperText,
    Grid,
    InputLabel,
    RegularBreakpoints,
    Stack,
    TextField,
} from '@mui/material'

import { FieldProps } from 'formik'
import React from 'react'

interface FormAutoCompleteInterface<T> extends FieldProps {
    xs: RegularBreakpoints['xs']
    itemKey?: React.Key | null | undefined
    label: string
    options: readonly T[]
    labelIdentifier: keyof T
    uniqueIdentifier: keyof T
    onChange?: (event: React.SyntheticEvent, value: T | null) => void
    placeholder?: string
}

function FormAutoComplete<T>({
    xs,
    itemKey: key,
    label,
    options,
    labelIdentifier,
    uniqueIdentifier,
    onChange,
    field,
    form,
    placeholder,
}: FormAutoCompleteInterface<T>) {
    const meta = form.getFieldMeta(field.name)
    return (
        <Grid item xs={xs}>
            <Stack spacing={1}>
                <InputLabel htmlFor={label}>{label}</InputLabel>
                <Autocomplete<T>
                    key={key}
                    options={options}
                    getOptionLabel={(option) =>
                        option[labelIdentifier] as string
                    }
                    isOptionEqualToValue={(option, value) =>
                        option[uniqueIdentifier] === value[uniqueIdentifier]
                    }
                    onChange={onChange}
                    fullWidth
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            value={field.value}
                            name={field.name}
                            id={label}
                            onBlur={field.onBlur}
                            placeholder={placeholder}
                            error={Boolean(meta.touched && meta.error)}
                        />
                    )}
                />
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

export default FormAutoComplete
