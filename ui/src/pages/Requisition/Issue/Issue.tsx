import { Button, Grid, Skeleton, Stepper, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormInputNumber, FormInputText, FormSelect } from '../../../components'
import React, { useEffect, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'

import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface RequisitionIssueInterface {
    requisitionId: number
    details: {
        rmId: string
        quantity: number
        storeStock: number
        lineStock: number
        maxQuantity: number
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
    const [error, setError] = useState('')
    let initialValues: RequisitionIssueInterface = {
        requisitionId: 0,
        details: [],
    }

    const form = useForm({
        initialValues,
        validate: {
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
                        details: form.values.details.filter(
                            (d) => d.quantity > 0
                        ),
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
                                                    storeStock: true,
                                                    lineStock: true,
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
                                        storeStock: number
                                        lineStock: number
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
                        ...b,
                        requisitionQuantity: data.quantity,
                        issuedQuantity: data.requisitionOutward.reduce(
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
                    }))
                )
                .then((data) =>
                    data
                        .map((b) => ({
                            ...b,
                            ...b.rm,
                            rmId: b.rm.id,
                            maxQuantity: Math.ceil(
                                b.quantity * b.requisitionQuantity -
                                    b.issuedQuantity
                            ),
                            quantity: 0,
                        }))
                        .filter((b) => b.maxQuantity > 0)
                )
            form.setFieldValue('details', data)
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
        <form
            onSubmit={(e) => {
                e.preventDefault()
            }}
        >
            <Grid justify="center" align="center" grow>
                <Grid.Col xs={3} />
                <Grid.Col xs={6}>
                    <Stepper active={activeStep} onStepClick={setActiveStep}>
                        {['Basic Details', 'Raw Material'].map((label) => {
                            return <Stepper.Step key={label} label={label} />
                        })}
                    </Stepper>
                </Grid.Col>
                <Grid.Col xs={3} />
                {activeStep === 0 && (
                    <>
                        <FormSelect
                            xs={12}
                            label="Requisition"
                            name="requisitionId"
                            placeholder="Select Requisition"
                            data={finishedGoods}
                            withAsterisk
                            {...form.getInputProps('requisitionId')}
                            value={form.values.requisitionId.toString()}
                            onChange={(value) => {
                                if (value) {
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
                        {form.values.details.length !== 0 && (
                            <Grid.Col xs={12}>
                                <Grid justify="center" align="center" grow>
                                    <Grid.Col xs={2}>
                                        <Text fz="lg">Raw Material</Text>
                                    </Grid.Col>
                                    <Grid.Col xs={2}>
                                        <Text fz="lg">Store Stock</Text>
                                    </Grid.Col>
                                    <Grid.Col xs={2}>
                                        <Text fz="lg">Line Stock</Text>
                                    </Grid.Col>
                                    <Grid.Col xs={2}>
                                        <Text fz="lg">Issued Quantity</Text>
                                    </Grid.Col>
                                    <Grid.Col xs={2}>
                                        <Text fz="lg">Remaining Quantity</Text>
                                    </Grid.Col>
                                    <Grid.Col xs={2}>
                                        <Text fz="lg">Quantity</Text>
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                        )}
                        {form.values.details.map((item, index) => (
                            <Grid.Col xs={12} key={index}>
                                <Grid justify="center" align="center" grow>
                                    <FormInputText
                                        xs={2}
                                        disabled
                                        {...form.getInputProps(
                                            `details.${index}.rmId`
                                        )}
                                    />
                                    <FormInputNumber
                                        xs={2}
                                        {...form.getInputProps(
                                            `details.${index}.storeStock`
                                        )}
                                        disabled
                                    />
                                    <FormInputNumber
                                        xs={2}
                                        {...form.getInputProps(
                                            `details.${index}.lineStock`
                                        )}
                                        disabled
                                    />
                                    <FormInputNumber
                                        xs={2}
                                        {...form.getInputProps(
                                            `details.${index}.issuedQuantity`
                                        )}
                                        disabled
                                    />
                                    <FormInputNumber
                                        xs={2}
                                        {...form.getInputProps(
                                            `details.${index}.maxQuantity`
                                        )}
                                        disabled
                                    />
                                    <FormInputNumber
                                        xs={2}
                                        {...form.getInputProps(
                                            `details.${index}.quantity`
                                        )}
                                        min={0}
                                        max={
                                            form.values.details[index]
                                                .maxQuantity
                                        }
                                    />
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
                                onClick={() => {
                                    const result = form.validate()
                                    if (!result.hasErrors) {
                                        openModal()
                                    }
                                }}
                            >
                                Issue
                            </Button>
                        </Grid.Col>
                    </>
                )}
            </Grid>
        </form>
    )
}

export default RequisitionIssue
