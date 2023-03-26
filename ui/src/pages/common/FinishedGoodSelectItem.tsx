import { SelectItem, Text } from '@mantine/core'

import { FinishedGoodsInterface } from '../FinishedGood/FinishedGood'
import { forwardRef } from 'react'

const FinishedGoodSelectItem = forwardRef<
    HTMLDivElement,
    FinishedGoodsInterface
>(({ id, description, price, ...others }: FinishedGoodsInterface, ref) => (
    <div ref={ref} {...others}>
        <Text size="sm">{id}</Text>
        <Text size="xs" opacity={0.7}>
            {description}
        </Text>
    </div>
))

export const FinishedGoodSelectFilter = (
    value: string,
    item: SelectItem
): boolean => {
    return (
        item.id.toLowerCase().includes(value.toLowerCase().trim()) ||
        item.description.toLowerCase().includes(value.toLowerCase().trim())
    )
}

export default FinishedGoodSelectItem
