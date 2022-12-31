import { Grid, RegularBreakpoints } from '@mui/material'

import { DesktopDatePicker } from '@mui/x-date-pickers'
import InputLabel from '@mui/material/InputLabel'
import React from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

interface DatePickerInterface {
    xs: RegularBreakpoints['xs']
    label: string
    name: string
    value: Date
    onChange: (
        value: Date | null,
        keyboardInputValue?: string | undefined
    ) => void
}

const DatePicker = ({
    xs,
    label,
    onChange,
    value,
    name,
}: DatePickerInterface) => {
    return (
        <Grid item xs={xs}>
            <Stack spacing={1}>
                <InputLabel htmlFor={label}>{label}</InputLabel>
                <DesktopDatePicker
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            id={label}
                            name={name}
                        />
                    )}
                    value={value}
                    onChange={onChange}
                    disableFuture
                />
            </Stack>
        </Grid>
    )
}

export default DatePicker
