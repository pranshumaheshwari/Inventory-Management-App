import {
    Button,
    Center,
    Divider,
    Grid,
    SelectItem,
    Skeleton,
    Stepper,
    Text,
} from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FinishedGoodSelectFilter, FinishedGoodSelectItem } from '../../common'
import {
    FormInputNumber,
    FormInputText,
    FormSelect,
    Table,
} from '../../../components'
import React, { useEffect, useMemo, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'
import { useLocation, useNavigate } from 'react-router-dom'

import { ColDef } from 'ag-grid-community'
import { FinishedGoodsInterface } from '../../FinishedGood/FinishedGood'
import { SalesOrdersInterface } from '../SalesOrders'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

interface SalesOrdersInterfaceForm extends SalesOrdersInterface {
    selectedFg: {
        fgId: string
        quantity: number
    }
}

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
    const [finishedgoods, setFinishedGoods] = useState<SelectItem[]>([])
    let initialValues: SalesOrdersInterfaceForm = {
        id: '',
        customerId: '',
        status: 'Open',
        soDetails: [],
        customer: {
            name: '',
        },
        selectedFg: {
            fgId: '',
            quantity: 0,
        },
    }

    if (isEdit) {
        initialValues = {
            ...initialValues,
            ...(location.state as SalesOrdersInterfaceForm),
        }
    }

    const form = useForm({
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
            const resp = await Fetch({
                url:
                    '/salesorders' +
                    (isEdit ? '/' + encodeURIComponent(initialValues.id) : ''),
                options: {
                    method: isEdit ? 'PUT' : 'POST',
                    body: form.values,
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

    const getFinishedGoods = async (customerId: string) => {
        try {
            const data = await Fetch({
                url: '/finishedgoods',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            description: true,
                            category: true,
                        }),
                        where: JSON.stringify({
                            customerId,
                        }),
                    },
                },
            }).then((data) =>
                data.map((d: Partial<FinishedGoodsInterface>) => ({
                    label: d.description,
                    value: d.id,
                    group: d.category,
                    ...d,
                }))
            )
            setFinishedGoods(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getCustomers()
        if (isEdit) {
            getFinishedGoods(initialValues.customerId)
        }
    }, [])

    const detailsColumnDef = useMemo<
        ColDef<SalesOrdersInterfaceForm['soDetails'][number]>[]
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
                        (fg) => fg.id === params.data?.fgId
                    )?.description
                },
            },
            {
                field: 'quantity',
                headerName: 'Quantity',
                editable: true,
                valueParser: ({ newValue }) => parseFloat(newValue),
                type: 'numberColumn',
            },
            {
                headerName: '#',
                onCellClicked: ({ data }) => {
                    if (data) {
                        form.removeListItem(
                            'soDetails',
                            form.values.soDetails.findIndex(
                                (d) => d.fgId === data.fgId
                            )
                        )
                        if (isEdit) {
                            onDeleteFg(data.fgId)
                        }
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
                            onChange={(customerId) => {
                                if (customerId) {
                                    getFinishedGoods(customerId)
                                    form.setFieldValue('customerId', customerId)
                                }
                            }}
                        />
                        <FormSelect
                            name="status"
                            xs={2}
                            label="Status"
                            placeholder="Select Status"
                            defaultValue="Open"
                            data={['Open', 'Closed']}
                            {...form.getInputProps('status')}
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
                        <FormSelect
                            xs={6}
                            name="selectedFg.fgId"
                            label="Finished Good"
                            placeholder="Select Finished Good"
                            data={finishedgoods}
                            itemComponent={FinishedGoodSelectItem}
                            filter={FinishedGoodSelectFilter}
                            {...form.getInputProps('selectedFg.fgId')}
                        />
                        <FormInputNumber
                            name="selectedFg.quantity"
                            xs={4}
                            label="Quantity"
                            placeholder="Enter Quantity"
                            min={0}
                            {...form.getInputProps('selectedFg.quantity')}
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
                                        form.values.selectedFg.quantity &&
                                        form.values.selectedFg.fgId
                                    ) {
                                        form.insertListItem('soDetails', {
                                            fgId: form.values.selectedFg.fgId,
                                            quantity:
                                                form.values.selectedFg.quantity,
                                        })
                                        form.setFieldValue('selectedFg', {
                                            fgId: '',
                                            quantity: 0,
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
                        <Grid.Col
                            xs={12}
                            style={{
                                height: '50vh',
                            }}
                        >
                            <Table<
                                SalesOrdersInterfaceForm['soDetails'][number]
                            >
                                fileName={form.values.id}
                                rowData={form.values.soDetails}
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
    )
}

export default Form
