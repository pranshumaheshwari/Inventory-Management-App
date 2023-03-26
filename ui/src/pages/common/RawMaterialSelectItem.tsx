import { Group, SelectItem, Text } from '@mantine/core'

import { RawMaterialInterface } from '../RawMaterial/RawMaterial'
import { forwardRef } from 'react'

const RawMaterialSelectItem = forwardRef<HTMLDivElement, RawMaterialInterface>(
    (
        { id, description, price, dtplCode, ...others }: RawMaterialInterface,
        ref
    ) => (
        <div ref={ref} {...others}>
            <Group>
                <Text size="sm">{id}</Text>
                <div>
                    <Text size="xs" opacity={0.7}>
                        {description}
                    </Text>
                    <Text size="xs" opacity={0.7}>
                        {dtplCode}
                    </Text>
                </div>
            </Group>
        </div>
    )
)

export const RawMaterialSelectFilter = (
    value: string,
    item: SelectItem
): boolean => {
    return (
        item.id.toLowerCase().includes(value.toLowerCase().trim()) ||
        item.description.toLowerCase().includes(value.toLowerCase().trim()) ||
        item.dtplCode.toLowerCase().includes(value.toLowerCase().trim())
    )
}

export default RawMaterialSelectItem
