import { DatePickerInput, DatePickerInputProps } from '@mantine/dates'

import { Grid } from '@mantine/core'
import React from 'react'

interface DateRangePickerInterface extends DatePickerInputProps<'range'> {
    xs: number
}

const MDateRangePicker = ({ xs, ...props }: DateRangePickerInterface) => {
    return (
        <Grid.Col xs={xs}>
            <DatePickerInput<'range'>
                type="range"
                valueFormat="DD/MM/YYYY"
                maxDate={new Date()}
                {...props}
            />
        </Grid.Col>
    )
}

export default MDateRangePicker
