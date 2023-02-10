import { FinishedGoodsInterface } from '../FinishedGood'
import { createFormContext } from '@mantine/form'

export const [
    FinishedGoodFormProvider,
    useFinishedGoodFormContext,
    useFinishedGoodForm,
] = createFormContext<FinishedGoodsInterface>()
