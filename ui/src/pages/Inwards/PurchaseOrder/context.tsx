import { InwardsPurchaseOrderInterface } from './PurchaseOrder'
import { createFormContext } from '@mantine/form'

export const [
    InwardsPurchaseOrderFormProvider,
    useInwardsPurchaseOrderFormContext,
    useInwardsPurchaseOrderForm,
] = createFormContext<InwardsPurchaseOrderInterface>()
