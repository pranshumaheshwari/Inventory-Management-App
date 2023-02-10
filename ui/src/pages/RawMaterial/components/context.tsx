import { RawMaterialInterface } from '../RawMaterial'
import { createFormContext } from '@mantine/form'

export const [
    RawMaterialFormProvider,
    useRawMaterialFormContext,
    useRawMaterialForm,
] = createFormContext<RawMaterialInterface>()
