import { OutwardsDispatch } from './Dispatch'
import { createFormContext } from '@mantine/form'

export const [DispatchFormProvider, useDispatchFormContext, useDispatchForm] =
    createFormContext<OutwardsDispatch>()
