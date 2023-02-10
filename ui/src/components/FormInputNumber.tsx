import { Grid, NumberInput, NumberInputProps } from '@mantine/core'

import React from 'react'

interface FormInputInterface extends NumberInputProps {
    xs: number
}

const FormInput = ({ xs, ...props }: FormInputInterface) => {
    return (
        <Grid.Col xs={xs}>
            <NumberInput {...props} />
        </Grid.Col>
    )
}

export default FormInput
