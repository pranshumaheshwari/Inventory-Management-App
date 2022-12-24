import { Grid, RegularBreakpoints } from '@mui/material'

import { Dayjs } from 'dayjs'
import { DesktopDatePicker } from '@mui/x-date-pickers'
import InputLabel from '@mui/material/InputLabel'
import React from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

interface DatePickerInterface {
    xs: RegularBreakpoints['xs']
    label: string
    name: string
    value: Dayjs
    onChange: (
        value: Dayjs | null,
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
                    inputFormat="DD/MM/YYYY"
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
