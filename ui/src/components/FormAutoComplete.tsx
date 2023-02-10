import { Autocomplete, AutocompleteProps, Grid } from '@mantine/core'

import React from 'react'

interface FormAutoCompleteInterface extends AutocompleteProps {
    xs: number
}

function FormAutoComplete({ xs, ...props }: FormAutoCompleteInterface) {
    return (
        <Grid.Col xs={xs}>
            <Autocomplete {...props} />
        </Grid.Col>
    )
}

export default FormAutoComplete
