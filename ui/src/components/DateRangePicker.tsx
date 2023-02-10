import { DateRangePicker, DateRangePickerProps } from '@mantine/dates'

import { Grid } from '@mantine/core'
import React from 'react'

interface DateRangePickerInterface extends DateRangePickerProps {
    xs: number
}

const MDateRangePicker = ({ xs, ...props }: DateRangePickerInterface) => {
    return (
        <Grid.Col xs={xs}>
            <DateRangePicker
                inputFormat="DD/MM/YYYY"
                maxDate={new Date()}
                {...props}
            />
        </Grid.Col>
    )
}

export default MDateRangePicker
