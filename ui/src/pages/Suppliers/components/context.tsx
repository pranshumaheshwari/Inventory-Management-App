import { SupplierInterface } from '../Suppliers'
import { createFormContext } from '@mantine/form'

export const [SupplierFormProvider, useSupplierFormContext, useSupplierForm] =
    createFormContext<SupplierInterface>()
