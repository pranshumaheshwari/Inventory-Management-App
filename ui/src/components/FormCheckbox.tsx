import { Grid, Checkbox, CheckboxProps } from '@mantine/core'

import React from 'react'

interface FormInputInterface extends CheckboxProps {
    xs: number
}

const FormInput = ({ xs, ...props }: FormInputInterface) => {
    return (
        <Grid.Col xs={xs}>
            <Checkbox {...props} />
        </Grid.Col>
    )
}

export default FormInput
