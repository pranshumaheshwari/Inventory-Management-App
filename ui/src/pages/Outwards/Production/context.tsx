import { ProductionInterface } from './Production'
import { createFormContext } from '@mantine/form'

export const [
    ProductionFormProvider,
    useProductionFormContext,
    useProductionForm,
] = createFormContext<ProductionInterface>()
