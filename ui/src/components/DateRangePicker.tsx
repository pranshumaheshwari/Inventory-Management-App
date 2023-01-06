import { DateRangePicker, Range, RangeKeyDict } from 'react-date-range'
import { Grid, RegularBreakpoints } from '@mui/material'

import InputLabel from '@mui/material/InputLabel'
import React from 'react'
import Stack from '@mui/material/Stack'

interface DateRangePickerInterface {
    xs: RegularBreakpoints['xs']
    range: Range
    label?: string
    onChange: (value: RangeKeyDict) => void
}

const MDateRangePicker = ({
    xs,
    range,
    label,
    onChange,
}: DateRangePickerInterface) => {
    return (
        <Grid item xs={xs}>
            <Stack spacing={1}>
                <InputLabel htmlFor={label}>{label}</InputLabel>
                <DateRangePicker
                    dateDisplayFormat="dd/MM/yyyy"
                    onChange={onChange}
                    maxDate={new Date()}
                    ranges={[range]}
                    color="#1890ff"
                    displayMode="dateRange"
                    weekStartsOn={1}
                />
            </Stack>
        </Grid>
    )
}

export default MDateRangePicker
