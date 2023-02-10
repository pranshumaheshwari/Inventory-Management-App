import { OutwardsQualityCheck } from './QualityCheck'
import { createFormContext } from '@mantine/form'

export const [
    OutwardsQualtiyFormProvider,
    useOutwardsQualtiyFormContext,
    useOutwardsQualtiyForm,
] = createFormContext<OutwardsQualityCheck>()
