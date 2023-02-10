import { NewRequisitionInterface } from './New'
import { createFormContext } from '@mantine/form'

export const [
    NewRequisitionFormProvider,
    useNewRequisitionFormContext,
    useNewRequisitionForm,
] = createFormContext<NewRequisitionInterface>()
