import {
    AutocompleteItem,
    Button,
    Divider,
    Grid,
    Skeleton,
    Stepper,
    Text,
} from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import {
    FormAutoComplete,
    FormInputNumber,
    FormInputText,
    FormSelect,
} from '../../../components'
import React, { useEffect, useState } from 'react'
import {
    RequisitionIssueFormProvider,
    useRequisitionIssueForm,
} from './context'

import { isNotEmpty } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface RequisitionIssueInterface {
    requisitionId: number
    fgId: string
    details: {
        rmId: string
        quantity: number
    }[]
}

const RequisitionIssue = () => {
    const {
        token: { token },
    } = useAuth()
    const [activeStep, setActiveStep] = React.useState(0)
    const [finishedGoods, setFinishedGoods] = useState<
        {
            value: string
            label: string
        }[]
    >([])
    const [rawmaterial, setRawmaterial] = useState<AutocompleteItem[]>([])
    const [selectedRm, setSelectedRm] = useState<{
        rm: AutocompleteItem
        quantity: number
    }>({
        rm: {
            value: '',
        },
        quantity: 0,
    })
    const [error, setError] = useState('')
    let initialValues: RequisitionIssueInterface = {
        requisitionId: 0,
        fgId: '',
        details: [],
    }

    const form = useRequisitionIssueForm({
        initialValues,
        validate: {
            fgId: isNotEmpty(),
            requisitionId: isNotEmpty(),
            details: (value) =>
                value.length === 0
                    ? 'Need atleast one raw material to issue'
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
            await Fetch({
                url: '/requisition/issueMany',
                options: {
                    method: 'POST',
                    body: {
                        requisitionId: form.values.requisitionId,
                        details: form.values.details,
                    },
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Successfully issued against requisition -{' '}
                        {form.values.requisitionId}
                    </Text>
                ),
                color: 'green',
            })
            form.reset()
            setActiveStep(0)
            setRawmaterial([])
            setSelectedRm({
                rm: {
                    value: '',
                },
                quantity: 0,
            })
        } catch (err) {
            setError((err as Error).message)
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }

    const getFinishedGoods = async () => {
        try {
            const data = await Fetch({
                url: '/requisition',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            fgId: true,
                            quantity: true,
                        }),
                        where: JSON.stringify({
                            status: {
                                in: ['Ready', 'Running'],
                            },
                        }),
                    },
                },
            }).then((data) => {
                return data.map(
                    (requisition: {
                        fgId: string
                        id: string
                        quantity: number
                    }) => ({
                        label: `${requisition.id} - ${requisition.fgId} WITH QTY ${requisition.quantity}`,
                        value: requisition.id.toString(),
                    })
                )
            })
            setFinishedGoods(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getRawmaterial = async (requisitionId: number) => {
        try {
            const data = await Fetch({
                url: '/requisition',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            quantity: true,
                            fg: {
                                select: {
                                    bom: {
                                        select: {
                                            quantity: true,
                                            rm: {
                                                select: {
                                                    id: true,
                                                    description: true,
                                                    dtplCode: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            requisitionOutward: {
                                select: {
                                    rmId: true,
                                    quantity: true,
                                },
                            },
                        }),
                        where: JSON.stringify({
                            id: requisitionId,
                        }),
                    },
                },
            })
                .then(
                    (
                        data: {
                            quantity: number
                            fg: {
                                bom: {
                                    quantity: number
                                    rm: {
                                        id: string
                                        description: string
                                        dtplCode: string
                                    }
                                }[]
                            }
                            requisitionOutward: {
                                rmId: string
                                quantity: number
                            }[]
                        }[]
                    ) => data[0]
                )
                .then((data) =>
                    data.fg.bom.map((b) => ({
                        ...b.rm,
                        bomQuantity:
                            b.quantity * data.quantity -
                            data.requisitionOutward.reduce(
                                (total, obj, idx) => {
                                    if (
                                        data.requisitionOutward[idx].rmId ===
                                        b.rm.id
                                    ) {
                                        return total + obj.quantity
                                    }
                                    return total
                                },
                                0
                            ),
                        value: b.rm.id,
                    }))
                )
            setRawmaterial(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getFinishedGoods()
    }, [])

    if (!finishedGoods) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <RequisitionIssueFormProvider form={form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <Grid justify="center" align="center" grow>
                    <Grid.Col xs={3} />
                    <Grid.Col xs={6}>
                        <Stepper
                            active={activeStep}
                            onStepClick={setActiveStep}
                        >
                            {['Basic Details', 'Raw Material'].map((label) => {
                                return (
                                    <Stepper.Step key={label} label={label} />
                                )
                            })}
                        </Stepper>
                    </Grid.Col>
                    <Grid.Col xs={3} />
                    {activeStep === 0 && (
                        <>
                            <FormSelect
                                xs={12}
                                label="Requisition"
                                placeholder="Select Requisition"
                                data={finishedGoods}
                                withAsterisk
                                {...form.getInputProps('requisitionId')}
                                onChange={(value) => {
                                    if (value) {
                                        console.log(value)
                                        form.setFieldValue(
                                            'requisitionId',
                                            parseInt(value)
                                        )
                                        getRawmaterial(parseInt(value))
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
                            <FormAutoComplete
                                xs={8}
                                id="rmId"
                                label="Raw Material"
                                placeholder="Select Raw Material"
                                data={rawmaterial}
                                {...form.getInputProps('rmId')}
                                onChange={(value) =>
                                    setSelectedRm((selectedRm) => {
                                        let rm = rawmaterial.find(
                                            (d) => d.value === value
                                        )
                                        if (rm)
                                            return {
                                                ...selectedRm,
                                                rm,
                                            }
                                        return selectedRm
                                    })
                                }
                                withAsterisk
                            />
                            <FormInputNumber
                                name="quantity"
                                xs={2}
                                label="Quantity"
                                placeholder="Enter Quantity"
                                withAsterisk
                                min={0}
                                {...form.getInputProps('quantity')}
                                onChange={(val) => {
                                    if (val) {
                                        setSelectedRm((selectedRm) => ({
                                            ...selectedRm,
                                            quantity: val,
                                        }))
                                    }
                                }}
                            />
                            <FormInputNumber
                                name="requiredQuanity"
                                xs={2}
                                label="Required Quantity"
                                placeholder="Required Quantity"
                                withAsterisk
                                disabled
                                value={selectedRm.rm.bomQuantity}
                            />
                            <Grid.Col xs={12}>
                                <Button
                                    fullWidth
                                    size="md"
                                    variant="filled"
                                    color="primary"
                                    onClick={() => {
                                        if (
                                            selectedRm.quantity &&
                                            selectedRm.rm &&
                                            selectedRm.rm.id
                                        ) {
                                            if (
                                                !form.values.details.find(
                                                    (r) =>
                                                        r.rmId ===
                                                        selectedRm.rm.id
                                                )
                                            ) {
                                                form.insertListItem('details', {
                                                    rmId: selectedRm.rm.id,
                                                    quantity:
                                                        selectedRm.quantity,
                                                })
                                            }
                                        }
                                    }}
                                >
                                    Add
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
                                                Raw Material Part Number
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
                                            xs={4}
                                            disabled
                                            {...form.getInputProps(
                                                `details.${index}.rmId`
                                            )}
                                        />
                                        <FormInputNumber
                                            xs={4}
                                            {...form.getInputProps(
                                                `details.${index}.quantity`
                                            )}
                                        />
                                        <Grid.Col xs={1} />
                                        <Grid.Col xs={2}>
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
                                                }}
                                            >
                                                DELETE
                                            </Button>
                                        </Grid.Col>
                                        <Grid.Col xs={1} />
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
                                    variant="default"
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
                                    variant="filled"
                                    color="primary"
                                    onClick={openModal}
                                >
                                    Issue
                                </Button>
                            </Grid.Col>
                        </>
                    )}
                </Grid>
            </form>
        </RequisitionIssueFormProvider>
    )
}

export default RequisitionIssue
