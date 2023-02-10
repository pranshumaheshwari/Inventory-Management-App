import { Grid, PasswordInput, PasswordInputProps } from '@mantine/core'
import { IconEyeCheck, IconEyeOff } from '@tabler/icons-react'

import React from 'react'

interface FormInputInterface extends PasswordInputProps {
    xs: number
}

const FormInput = ({ xs, ...props }: FormInputInterface) => {
    return (
        <Grid.Col xs={xs}>
            <PasswordInput
                visibilityToggleIcon={({ reveal, size }) =>
                    reveal ? (
                        <IconEyeOff size={size} />
                    ) : (
                        <IconEyeCheck size={size} />
                    )
                }
                {...props}
            />
        </Grid.Col>
    )
}

export default FormInput
