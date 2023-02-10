import { CustomerInterface } from '../Customers'
import { createFormContext } from '@mantine/form'

export const [CustomerFormProvider, useCustomerFormContext, useCustomerForm] =
    createFormContext<CustomerInterface>()
