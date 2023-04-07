import {
    Grid,
    SegmentedControl,
    SegmentedControlProps,
    Text,
} from '@mantine/core'

import React from 'react'

interface FormSelectInterface extends SegmentedControlProps {
    xs: number
    label: string
}

const FormSelect = ({ xs, label, ...props }: FormSelectInterface) => {
    return (
        <Grid.Col xs={xs}>
            {label && (
                <Text fz="sm" fw={500}>
                    {label}
                </Text>
            )}
            <SegmentedControl {...props} />
        </Grid.Col>
    )
}

export default FormSelect
