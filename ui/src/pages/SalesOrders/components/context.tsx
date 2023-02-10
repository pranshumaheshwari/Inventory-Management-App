import { SalesOrdersInterface } from '../SalesOrders'
import { createFormContext } from '@mantine/form'

export const [
    SalesOrdersFormProvider,
    useSalesOrdersFormContext,
    useSalesOrdersForm,
] = createFormContext<SalesOrdersInterface>()
