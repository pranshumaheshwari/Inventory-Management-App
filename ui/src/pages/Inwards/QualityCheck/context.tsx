import { InwardsQualityCheck } from './QualityCheck'
import { createFormContext } from '@mantine/form'

export const [
    InwardsQualityCheckFormProvider,
    useInwardsQualityCheckFormContext,
    useInwardsQualityCheckForm,
] = createFormContext<InwardsQualityCheck>()
