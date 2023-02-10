import { Grid, Select, SelectProps } from '@mantine/core'

import React from 'react'

interface FormSelectInterface extends SelectProps {
    xs: number
}

const FormSelect = ({
    xs,
    searchable = true,
    ...props
}: FormSelectInterface) => {
    return (
        <Grid.Col xs={xs}>
            <Select searchable={searchable} {...props} />
        </Grid.Col>
    )
}

export default FormSelect
