import { PurchaseOrdersInterface } from '../PurchaseOrders'
import { createFormContext } from '@mantine/form'

export const [
    PurchaseOrdersFormProvider,
    usePurchaseOrdersFormContext,
    usePurchaseOrdersForm,
] = createFormContext<PurchaseOrdersInterface>()
