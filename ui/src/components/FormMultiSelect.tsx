import { Grid, MultiSelect, MultiSelectProps } from '@mantine/core'

import React from 'react'

interface FormSelectInterface extends MultiSelectProps {
    xs: number
}

const FormSelect = ({
    xs,
    searchable = true,
    ...props
}: FormSelectInterface) => {
    return (
        <Grid.Col xs={xs}>
            <MultiSelect searchable={searchable} {...props} />
        </Grid.Col>
    )
}

export default FormSelect
