import { Grid, Autocomplete, AutocompleteProps } from '@mantine/core'

import React from 'react'

interface FormAutocompleteInterface extends AutocompleteProps {
    xs: number
}

const FormAutocomplete = ({
    xs,
    limit=3,
    ...props
}: FormAutocompleteInterface) => {
    return (
        <Grid.Col xs={xs}>
            <Autocomplete limit={limit} {...props} />
        </Grid.Col>
    )
}

export default FormAutocomplete
