import { RequisitionIssueInterface } from './Issue'
import { createFormContext } from '@mantine/form'

export const [
    RequisitionIssueFormProvider,
    useRequisitionIssueFormContext,
    useRequisitionIssueForm,
] = createFormContext<RequisitionIssueInterface>()
