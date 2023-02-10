import { DatePicker, DatePickerProps } from '@mantine/dates'

import { Grid } from '@mantine/core'
import React from 'react'

interface DatePickerInterface extends DatePickerProps {
    xs: number
}

const MDatePicker = ({ xs, ...props }: DatePickerInterface) => {
    return (
        <Grid.Col xs={xs}>
            <DatePicker
                inputFormat="DD/MM/YYYY"
                maxDate={new Date()}
                {...props}
            />
        </Grid.Col>
    )
}

export default MDatePicker
