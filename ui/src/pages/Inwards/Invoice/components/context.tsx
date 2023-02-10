import { InvoiceInterface } from '../Invoice'
import { createFormContext } from '@mantine/form'

export const [InvoiceFormProvider, useInvoiceFormContext, useInvoiceForm] =
    createFormContext<InvoiceInterface>()
