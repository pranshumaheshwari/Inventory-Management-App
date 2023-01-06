import { Grid, RegularBreakpoints } from '@mui/material'

import { DateTimePicker } from '@mui/x-date-pickers'
import InputLabel from '@mui/material/InputLabel'
import React from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

interface DateTimePickerInterface {
    xs: RegularBreakpoints['xs']
    label: string
    name: string
    value: Date
    onChange: (
        value: Date | null,
        keyboardInputValue?: string | undefined
    ) => void
}

const MDateTimePicker = ({
    xs,
    label,
    onChange,
    value,
    name,
}: DateTimePickerInterface) => {
    return (
        <Grid item xs={xs}>
            <Stack spacing={1}>
                <InputLabel htmlFor={label}>{label}</InputLabel>
                <DateTimePicker
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

export default MDateTimePicker
