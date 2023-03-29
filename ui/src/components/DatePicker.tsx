import { DatePickerInput, DatePickerInputProps } from '@mantine/dates'

import { Grid } from '@mantine/core'
import React from 'react'

interface DatePickerInterface extends DatePickerInputProps {
    xs: number
}

const MDatePicker = ({ xs, ...props }: DatePickerInterface) => {
    return (
        <Grid.Col xs={xs}>
            <DatePickerInput
                valueFormat="DD/MM/YYYY"
                maxDate={new Date()}
                {...props}
            />
        </Grid.Col>
    )
}

export default MDatePicker
