import { Grid, TextInput, TextInputProps } from '@mantine/core'

import React from 'react'

interface FormInputInterface extends TextInputProps {
    xs: number
}

const FormInput = ({ xs, ...props }: FormInputInterface) => {
    return (
        <Grid.Col xs={xs}>
            <TextInput {...props} />
        </Grid.Col>
    )
}

export default FormInput
