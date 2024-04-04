import {
    Button,
    Divider,
    Grid,
    SelectItem,
    Skeleton,
    Stepper,
    Text,
} from '@mantine/core'
import {
    FormInputNumber,
    FormInputText,
    FormSelect,
    Table,
} from '../../../components'
import { Fetch, useAuth } from '../../../services'
import { FinishedGoodSelectFilter, FinishedGoodSelectItem } from '../../common'
import React, { useEffect, useMemo, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'

import { ColDef } from 'ag-grid-community'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

export interface OutwardsDispatch {
    customerId: string
    invoiceNumber: string
    soId: string
    details: {
        fgId: string
        quantity: number
    }[]
    selectedFg: {
        fgId: string
        quantity: number
        storeStock: number
        oqcPendingStock: number
    }
}

const Dispatch = () => {
    const {
        token: { token },
    } = useAuth()
    const [activeStep, setActiveStep] = React.useState(0)
    const [customer, setCustomer] = useState<{ value: string }[] | null>()
    const [salesorder, setSalesOrder] = useState<SelectItem[]>([])
    const [finishedgoods, setFinishedGoods] = useState<SelectItem[]>([])
    const [error, setError] = useState('')
    let initialValues: OutwardsDispatch = {
        customerId: '',
        soId: '',
        invoiceNumber: '',
        details: [],
        selectedFg: {
            fgId: '',
            quantity: 0,
            storeStock: 0,
            oqcPendingStock: 0,
        },
    }

    const form = useForm({
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
                    },
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully created dispatch invoice with ID -{' '}
                        {resp[0].invoiceNumber}
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
                                    category: true,
                                    storeStock: true,
                                    oqcPendingStock: true,
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
                            category: string
                            storeStock: number
                            oqcPendingStock: number
                        }
                    }[]
                ) =>
                    data.map((d) => ({
                        value: d.fg.id,
                        label: d.fg.description,
                        group: d.fg.category,
                        ...d.fg,
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

    const detailsColumnDef = useMemo<
        ColDef<OutwardsDispatch['details'][number]>[]
    >(
        () => [
            {
                field: 'fgId',
                headerName: 'Part Number',
            },
            {
                headerName: 'Description',
                valueGetter: (params) => {
                    return finishedgoods?.find(
                        (fg) => fg.value === params.data?.fgId
                    )?.description
                },
            },
            {
                field: 'quantity',
                headerName: 'Quantity',
            },
            {
                headerName: '#',
                onCellClicked: ({ data }) => {
                    if (data) {
                        form.removeListItem(
                            'details',
                            form.values.details.findIndex(
                                (d) => d.fgId === data.fgId
                            )
                        )
                    }
                },
                cellRenderer: () => (
                    <Button fullWidth size="xs" variant="outline" color="red">
                        DELETE
                    </Button>
                ),
            },
        ],
        [finishedgoods, form]
    )

    if (!customer) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
            }}
        >
            <Grid>
                <Grid.Col xs={3} />
                <Grid.Col xs={6}>
                    <Stepper active={activeStep} onStepClick={setActiveStep}>
                        {['Basic Details', 'List of Finished Goods'].map(
                            (label, index) => {
                                return (
                                    <Stepper.Step key={label} label={label} />
                                )
                            }
                        )}
                    </Stepper>
                </Grid.Col>
                <Grid.Col xs={3} />
                {activeStep === 0 && (
                    <>
                        <FormInputText
                            xs={4}
                            label="Invoice"
                            placeholder="Enter Invoice"
                            withAsterisk
                            {...form.getInputProps('invoiceNumber')}
                        />
                        <FormSelect
                            xs={4}
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
                            xs={4}
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
                        <FormSelect
                            xs={5}
                            name="selectedFg.fgId"
                            label="Finished Good"
                            placeholder="Select Finished Good"
                            data={finishedgoods}
                            itemComponent={FinishedGoodSelectItem}
                            filter={FinishedGoodSelectFilter}
                            {...form.getInputProps('selectedFg.fgId')}
                            onChange={(fgId) => {
                                if (fgId) {
                                    form.setFieldValue('selectedFg.fgId', fgId)
                                    const fg = finishedgoods.find(
                                        (fg) => fg.value === fgId
                                    )
                                    if (fg) {
                                        form.setFieldValue(
                                            'selectedFg.oqcPendingStock',
                                            fg.oqcPendingStock
                                        )
                                        form.setFieldValue(
                                            'selectedFg.storeStock',
                                            fg.storeStock
                                        )
                                    }
                                }
                            }}
                        />
                        <FormInputNumber
                            name="selectedFg.quantity"
                            xs={3}
                            label="Quantity"
                            placeholder="Enter Quantity"
                            min={0}
                            {...form.getInputProps('selectedFg.quantity')}
                        />
                        <FormInputNumber
                            name="selectedFg.storeStock"
                            xs={2}
                            label="Store Stock"
                            disabled
                            {...form.getInputProps('selectedFg.storeStock')}
                        />
                        <FormInputNumber
                            name="selectedFg.oqcPendingStock"
                            xs={2}
                            label="OQC Pending Stock"
                            disabled
                            {...form.getInputProps(
                                'selectedFg.oqcPendingStock'
                            )}
                        />
                        <Grid.Col xs={12}>
                            <Button
                                fullWidth
                                size="md"
                                variant="filled"
                                color="primary"
                                onClick={() => {
                                    if (
                                        form.values.selectedFg.quantity &&
                                        form.values.selectedFg.fgId
                                    ) {
                                        if (form.values.selectedFg.quantity > form.values.selectedFg.storeStock) {
                                            showNotification({
                                                title: 'Failure',
                                                message: (
                                                    <Text>
                                                        Cannot dipatch quantity more than store stock
                                                    </Text>
                                                ),
                                                color: 'red',
                                            })
                                            return
                                        }
                                        form.insertListItem(
                                            'details',
                                            form.values.selectedFg
                                        )
                                        form.setFieldValue('selectedFg', {
                                            fgId: '',
                                            quantity: 0,
                                            storeStock: 0,
                                            oqcPendingStock: 0,
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
                        <Grid.Col
                            xs={12}
                            style={{
                                height: '50vh',
                            }}
                        >
                            <Table<OutwardsDispatch['details'][number]>
                                fileName={form.values.invoiceNumber}
                                rowData={form.values.details}
                                columnDefs={detailsColumnDef}
                                pagination={false}
                            />
                        </Grid.Col>
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
    )
}

export default Dispatch
