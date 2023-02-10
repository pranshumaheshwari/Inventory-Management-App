import {
    AutocompleteItem,
    Button,
    Divider,
    Grid,
    SelectItem,
    Skeleton,
    Stepper,
    Text,
} from '@mantine/core'
import {
    DatePicker,
    FormAutoComplete,
    FormInputNumber,
    FormInputText,
    FormSelect,
} from '../../../components'
import { DispatchFormProvider, useDispatchForm } from './context'
import { Fetch, useAuth } from '../../../services'
import React, { useEffect, useState } from 'react'

import { isNotEmpty } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface OutwardsDispatch {
    customerId: string
    invoiceNumber: string
    soId: string
    createdAt: Date
    details: {
        fgId: string
        quantity: number
    }[]
}

const Dispatch = () => {
    const {
        token: { token },
    } = useAuth()
    const [activeStep, setActiveStep] = React.useState(0)
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [salesorder, setSalesOrder] = useState<SelectItem[]>([])
    const [finishedgoods, setFinishedGoods] = useState<AutocompleteItem[]>([])
    const [selectedFg, setSelectedFg] = useState<{
        fg: AutocompleteItem
        quantity: number
    }>({
        fg: {
            value: '',
        },
        quantity: 0,
    })
    const [error, setError] = useState('')
    let initialValues: OutwardsDispatch = {
        customerId: '',
        soId: '',
        invoiceNumber: '',
        details: [],
        createdAt: new Date(),
    }

    const form = useDispatchForm({
        initialValues,
        validate: {
            soId: isNotEmpty(),
            customerId: isNotEmpty(),
            invoiceNumber: isNotEmpty(),
            details: (value) =>
                value.length === 0
                    ? 'Need atleast one finished good in dispatch'
                    : null,
        },
        validateInputOnChange: true,
    })

    const openModal = () =>
        openConfirmModal({
            title: 'Please confirm your action',
            centered: true,
            children: <Text size="sm">Are you sure you want to proceed</Text>,
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: onSubmit,
        })

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const onSubmit = async () => {
        try {
            const resp = await Fetch({
                url: '/outwards/dispatch',
                options: {
                    method: 'POST',
                    body: {
                        ...form.values,
                        createdAt: form.values.createdAt.toISOString(),
                    },
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully created dispatch with ID - {resp.id}
                    </Text>
                ),
                color: 'green',
            })
            form.reset()
            setFinishedGoods([])
            setActiveStep(0)
        } catch (err) {
            setError((err as Error).message)
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }

    const getCustomer = async () => {
        try {
            const data = await Fetch({
                url: '/customers',
                options: {
                    authToken: token,
                },
            }).then((data) => {
                return data.map((customer: { name: string; id: string }) => ({
                    label: customer.name,
                    value: customer.id,
                }))
            })
            setCustomer(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const updateSalesOrder = async (customerId: string) => {
        try {
            const data = await Fetch({
                url: '/salesorders',
                options: {
                    authToken: token,
                    params: {
                        where: JSON.stringify({
                            customerId,
                        }),
                        select: JSON.stringify({
                            id: true,
                        }),
                    },
                },
            }).then((data) =>
                data.map((salesOrder: { id: string }) => ({
                    value: salesOrder.id,
                    label: salesOrder.id,
                    ...salesOrder,
                }))
            )
            setSalesOrder(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getFinishedGoods = async (soId: string) => {
        try {
            const data = await Fetch({
                url: `/salesorders/${encodeURIComponent(soId)}`,
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            fg: {
                                select: {
                                    id: true,
                                    description: true,
                                },
                            },
                        }),
                    },
                },
            }).then(
                (
                    data: {
                        fg: {
                            id: string
                            description: string
                        }
                    }[]
                ) =>
                    data.map((d) => ({
                        id: d.fg.id,
                        value: d.fg.id,
                        description: d.fg.description,
                    }))
            )
            setFinishedGoods(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getCustomer()
    }, [])

    if (!customer) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <DispatchFormProvider form={form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <Grid>
                    <Grid.Col xs={3} />
                    <Grid.Col xs={6}>
                        <Stepper
                            active={activeStep}
                            onStepClick={setActiveStep}
                        >
                            {['Basic Details', 'List of Finished Goods'].map(
                                (label, index) => {
                                    return (
                                        <Stepper.Step
                                            key={label}
                                            label={label}
                                        />
                                    )
                                }
                            )}
                        </Stepper>
                    </Grid.Col>
                    <Grid.Col xs={3} />
                    {activeStep === 0 && (
                        <>
                            <FormInputText
                                xs={6}
                                label="Invoice"
                                placeholder="Enter Invoice"
                                withAsterisk
                                {...form.getInputProps('invoiceNumber')}
                            />
                            <DatePicker
                                xs={6}
                                label="Date"
                                placeholder="Select Date"
                                withAsterisk
                                {...form.getInputProps('createdAt')}
                            />
                            <FormSelect
                                xs={6}
                                label="Customer"
                                placeholder="Select Customer"
                                data={customer}
                                withAsterisk
                                {...form.getInputProps('customerId')}
                                onChange={(value) => {
                                    if (value) {
                                        form.setFieldValue('customerId', value)
                                        updateSalesOrder(value)
                                    }
                                }}
                            />
                            <FormSelect
                                name="soId"
                                xs={6}
                                label="Sales Order"
                                placeholder="Select Sales Order"
                                data={salesorder}
                                withAsterisk
                                {...form.getInputProps('soId')}
                                onChange={(value) => {
                                    if (value) {
                                        form.setFieldValue('soId', value)
                                        getFinishedGoods(value)
                                    }
                                }}
                            />
                            <Grid.Col xs={12}>
                                <Button
                                    fullWidth
                                    size="md"
                                    variant="filled"
                                    color="primary"
                                    onClick={handleNext}
                                >
                                    Next
                                </Button>
                            </Grid.Col>
                        </>
                    )}

                    {activeStep === 1 && (
                        <>
                            <Grid.Col xs={1} />
                            <FormAutoComplete
                                xs={6}
                                id="fgId"
                                label="Finished Good"
                                placeholder="Select Finished Good"
                                data={finishedgoods}
                                onChange={(value) =>
                                    setSelectedFg((selectedFg) => {
                                        let fg = finishedgoods.find(
                                            (d) => d.value === value
                                        )
                                        if (fg)
                                            return {
                                                ...selectedFg,
                                                fg,
                                            }
                                        return selectedFg
                                    })
                                }
                            />
                            <FormInputNumber
                                name="quantity"
                                xs={4}
                                label="Quantity"
                                placeholder="Enter Quantity"
                                min={0}
                                onChange={(val) => {
                                    if (val) {
                                        setSelectedFg((selectedFg) => ({
                                            ...selectedFg,
                                            quantity: val,
                                        }))
                                    }
                                }}
                            />
                            <Grid.Col xs={1} />
                            <Grid.Col xs={12}>
                                <Button
                                    fullWidth
                                    size="md"
                                    variant="filled"
                                    color="primary"
                                    onClick={() => {
                                        if (
                                            selectedFg.quantity &&
                                            selectedFg.fg &&
                                            selectedFg.fg.id
                                        ) {
                                            form.insertListItem('details', {
                                                fgId: selectedFg.fg.id,
                                                quantity: selectedFg.quantity,
                                            })
                                        }
                                    }}
                                >
                                    Add to Dispatch
                                </Button>
                            </Grid.Col>
                            <Grid.Col xs={12}>
                                <Divider />
                            </Grid.Col>
                            {form.values.details.length !== 0 && (
                                <Grid.Col xs={12}>
                                    <Grid justify="center" align="center" grow>
                                        <Grid.Col xs={4}>
                                            <Text fz="lg">
                                                Finished Goods Identifier
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col xs={4}>
                                            <Text fz="lg">Quantity</Text>
                                        </Grid.Col>
                                        <Grid.Col xs={4} />
                                    </Grid>
                                </Grid.Col>
                            )}
                            {form.values.details.map((item, index) => (
                                <Grid.Col xs={12} key={index}>
                                    <Grid justify="center" align="center" grow>
                                        <FormInputText
                                            {...form.getInputProps(
                                                `details.${index}.fgId`
                                            )}
                                            xs={4}
                                            disabled
                                        />
                                        <FormInputNumber
                                            {...form.getInputProps(
                                                `details.${index}.quantity`
                                            )}
                                            min={0}
                                            xs={4}
                                        />
                                        <Grid.Col xs={4}>
                                            <Button
                                                fullWidth
                                                size="xs"
                                                variant="outline"
                                                color="red"
                                                onClick={() => {
                                                    form.removeListItem(
                                                        'details',
                                                        index
                                                    )
                                                    // onDeleteFg(item.fgId)
                                                }}
                                            >
                                                DELETE
                                            </Button>
                                        </Grid.Col>
                                    </Grid>
                                </Grid.Col>
                            ))}
                        </>
                    )}

                    {error && (
                        <Grid.Col xs={12}>
                            <Text c="red">{error}</Text>
                        </Grid.Col>
                    )}
                    {activeStep === 1 && (
                        <>
                            <Grid.Col xs={2}>
                                <Button
                                    fullWidth
                                    size="md"
                                    variant="filled"
                                    color="secondary"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            </Grid.Col>
                            <Grid.Col xs={8} />
                            <Grid.Col xs={2}>
                                <Button
                                    fullWidth
                                    size="md"
                                    type="submit"
                                    variant="filled"
                                    color="primary"
                                    onClick={() => {
                                        const result = form.validate()
                                        if (!result.hasErrors) {
                                            openModal()
                                        }
                                    }}
                                >
                                    Create
                                </Button>
                            </Grid.Col>
                        </>
                    )}
                </Grid>
            </form>
        </DispatchFormProvider>
    )
}

export default Dispatch
