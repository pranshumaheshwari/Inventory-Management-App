import { MonthPickerInput, MonthPickerInputProps } from '@mantine/dates'

import { Grid } from '@mantine/core'
import React from 'react'

interface DatePickerInterface extends MonthPickerInputProps {
    xs: number
}

const MDatePicker = ({ xs, ...props }: DatePickerInterface) => {
    return (
        <Grid.Col xs={xs}>
            <MonthPickerInput valueFormat="MM" {...props} />
        </Grid.Col>
    )
}

export default MDatePicker
