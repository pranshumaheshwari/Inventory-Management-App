import { FormAutoComplete, FormSelect } from '../../components'
import React, { useState } from 'react'

import { Field } from 'formik'
import { RegularBreakpoints } from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'

interface InputAutoCompleteInterface<T> {
    identifierXs: RegularBreakpoints['xs']
    itemXs: RegularBreakpoints['xs']
    defaultIdentifier: keyof T
    identifierItems: {
        value: keyof T
        label: string
    }[]
    itemKey?: React.Key | null | undefined
    label: string
    name: string
    options: readonly T[]
    uniqueIdentifier: keyof T
    onChange?: (event: React.SyntheticEvent, value: T | null) => void
    placeholder?: string
}

function InputAutoComplete<T>({
    identifierXs,
    itemXs,
    defaultIdentifier,
    identifierItems,
    label,
    name,
    itemKey,
    options,
    uniqueIdentifier,
    onChange,
    placeholder,
}: InputAutoCompleteInterface<T>) {
    const [identifier, setIdentifier] = useState<keyof T>(defaultIdentifier)
    return (
        <>
            <Field
                name="IdentifierSelect"
                component={FormSelect}
                xs={identifierXs}
                label={`${label} Feild`}
                placeholder={`Select ${label}`}
                defaultValue={defaultIdentifier}
                items={identifierItems}
                onChange={(e: SelectChangeEvent) =>
                    setIdentifier(e.target?.value as keyof T)
                }
            />
            <Field
                name={name}
                component={FormAutoComplete}
                xs={itemXs}
                itemKey={itemKey}
                label={label}
                options={options}
                uniqueIdentifier={uniqueIdentifier}
                onChange={onChange}
                placeholder={placeholder}
                labelIdentifier={identifier}
            />
        </>
    )
}

export default InputAutoComplete
