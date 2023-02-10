import {
    AutocompleteItem,
    Button,
    Center,
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
import { SalesOrdersFormProvider, useSalesOrdersForm } from './context'
import { useLocation, useNavigate } from 'react-router-dom'

import { FinishedGoodsInterface } from '../../FinishedGood/FinishedGood'
import { SalesOrdersInterface } from '../SalesOrders'
import { isNotEmpty } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

const Form = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isEdit = location.state ? true : false
    const {
        token: { token },
    } = useAuth()
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = React.useState(0)
    const [finishedgoods, setFinishedGoods] = useState<AutocompleteItem[]>()
    const [selectedFg, setSelectedFg] = useState<{
        fg: AutocompleteItem
        quantity: number
    }>({
        fg: {
            value: '',
        },
        quantity: 0,
    })
    let initialValues: SalesOrdersInterface = {
        id: '',
        customerId: '',
        status: 'Open',
        soDetails: [],
        customer: {
            name: '',
        },
    }

    if (isEdit) {
        initialValues = {
            ...initialValues,
            ...(location.state as SalesOrdersInterface),
        }
    }

    const form = useSalesOrdersForm({
        initialValues,
        validate: {
            id: isNotEmpty(),
            customerId: isNotEmpty(),
            status: isNotEmpty(),
            soDetails: (value) =>
                value.length === 0
                    ? 'Need atleast one finished good in sales order'
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

    const openDeleteModal = () =>
        openConfirmModal({
            title: 'Delete this item',
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to delete this item? This action is
                    destructive and irreversible. All data will be lost
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: "No don't delete it" },
            confirmProps: { color: 'red' },
            onConfirm: onDelete,
        })

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const onSubmit = async () => {
        try {
            const postData: Partial<SalesOrdersInterface> = {
                id: form.values.id,
                customerId: form.values.customerId,
                soDetails: form.values.soDetails,
            }
            const resp = await Fetch({
                url:
                    '/salesorders' +
                    (isEdit ? '/' + encodeURIComponent(initialValues.id) : ''),
                options: {
                    method: isEdit ? 'PUT' : 'POST',
                    body: postData,
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully {isEdit ? 'edited' : 'created'} sales order
                        with ID - {resp.id}
                    </Text>
                ),
                color: 'green',
            })
            navigate('..')
        } catch (err) {
            setError((err as Error).message)
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }

    const onDelete = async () => {
        try {
            const resp = await Fetch({
                url: `/salesorders/${encodeURIComponent(initialValues.id)}`,
                options: {
                    method: 'DELETE',
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully deleted sales order with ID - {resp.id}
                    </Text>
                ),
                color: 'orange',
            })
            navigate('..')
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const onDeleteFg = async (fgId: string) => {
        try {
            await Fetch({
                url: `/salesorders/${initialValues.id}/${fgId}`,
                options: {
                    method: 'DELETE',
                    authToken: token,
                },
            })
        } catch (e) {}
    }

    const getCustomers = async () => {
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

    const getFinishedGoods = async () => {
        try {
            const data = await Fetch({
                url: '/finishedgoods',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            description: true,
                        }),
                    },
                },
            }).then((data) =>
                data.map((d: Partial<FinishedGoodsInterface>) => ({
                    ...d,
                    value: d.id,
                }))
            )
            setFinishedGoods(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        Promise.all([getCustomers(), getFinishedGoods()])
    }, [])

    if (!customer || !finishedgoods) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <SalesOrdersFormProvider form={form}>
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
                                label="ID"
                                placeholder="Enter ID"
                                withAsterisk
                                {...form.getInputProps('id')}
                            />
                            <FormSelect
                                xs={6}
                                label="Customer"
                                placeholder="Select Customer"
                                data={customer}
                                withAsterisk
                                {...form.getInputProps('customerId')}
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
                    )}{' '}
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
                                            form.insertListItem('soDetails', {
                                                fgId: selectedFg.fg.id,
                                                quantity: selectedFg.quantity,
                                            })
                                        }
                                    }}
                                >
                                    Add to Sales Order
                                </Button>
                            </Grid.Col>
                            <Grid.Col xs={12}>
                                <Divider />
                            </Grid.Col>
                            {form.values.soDetails.length !== 0 && (
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
                            {form.values.soDetails.map((item, index) => (
                                <Grid.Col xs={12} key={index}>
                                    <Grid justify="center" align="center" grow>
                                        <FormInputText
                                            {...form.getInputProps(
                                                `soDetails.${index}.fgId`
                                            )}
                                            xs={4}
                                            disabled
                                        />
                                        <FormInputNumber
                                            {...form.getInputProps(
                                                `soDetails.${index}.quantity`
                                            )}
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
                                                        'soDetails',
                                                        index
                                                    )
                                                    onDeleteFg(item.fgId)
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
                                    {isEdit ? 'Update' : 'Create'}
                                </Button>
                            </Grid.Col>
                        </>
                    )}
                    {isEdit && (
                        <Grid.Col xs={12}>
                            <Center>
                                <Button
                                    size="xs"
                                    variant="filled"
                                    color="red"
                                    onClick={openDeleteModal}
                                >
                                    DELETE
                                </Button>
                            </Center>
                        </Grid.Col>
                    )}
                </Grid>
            </form>
        </SalesOrdersFormProvider>
    )
}

export default Form
