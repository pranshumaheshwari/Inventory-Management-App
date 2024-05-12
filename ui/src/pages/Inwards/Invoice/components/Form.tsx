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
import {
    DatePicker,
    FormAutocomplete,
    FormInputNumber,
    FormSelect,
    Table,
} from '../../../../components'
import { Fetch, useAuth } from '../../../../services'
import { RawMaterialSelectFilter, RawMaterialSelectItem } from '../../../common'
import React, { useEffect, useMemo, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'
import { useLocation, useNavigate } from 'react-router-dom'

import { ColDef } from 'ag-grid-community'
import { InvoiceInterface } from '../Invoice'
import { RawMaterialInterface } from '../../../RawMaterial/RawMaterial'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

interface InvoiceInterfaceForm extends InvoiceInterface {
    selectedRm: {
        poId: string
        rmId: string
        quantity: number
        poPrice: number
    }
}

const Form = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isEdit = location.state ? true : false
    const {
        token: { token },
    } = useAuth()
    const [activeStep, setActiveStep] = React.useState(0)
    const [rawmaterial, setRawmaterial] = useState<SelectItem[]>([])
    const [purchaseOrders, setPurchaseOrders] = useState<SelectItem[]>([])
    const [invoices, setInvoices] = useState<string[]>([])
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [error, setError] = useState('')
    let initialValues: InvoiceInterfaceForm = {
        id: '',
        supplierId: '',
        supplier: {
            name: '',
        },
        status: 'Open',
        invoiceDetails: [],
        date: new Date(),
        selectedRm: {
            rmId: '',
            poId: '',
            quantity: 0,
            poPrice: 0,
        },
    }

    if (isEdit) {
        initialValues = {
            ...initialValues,
            ...(location.state as InvoiceInterfaceForm),
        }
    }

    const form = useForm({
        initialValues,
        validate: {
            id: isNotEmpty(),
            supplierId: isNotEmpty(),
            status: isNotEmpty(),
            invoiceDetails: (value) =>
                value.length === 0
                    ? 'Need atleast one raw material in invoice'
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
            onConfirm: () => {
                onSubmit(form.values)
            },
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

    const onSubmit = async (values: InvoiceInterfaceForm) => {
        try {
            const isPut = isEdit || invoices.includes(values.id)
            await Fetch({
                url: '/invoice',
                options: {
                    method: isPut ? 'PUT' : 'POST',
                    body: values,
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Successfully {isPut ? 'updated' : 'created'} invoice{' '}
                        {values.id}
                    </Text>
                ),
                color: 'green',
            })
            form.reset()
            setActiveStep(0)
            setRawmaterial([])
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
                url: `/invoice`,
                options: {
                    method: 'DELETE',
                    authToken: token,
                    body: initialValues,
                },
            })
            showNotification({
                title: 'Success',
                message: <Text>Successfully deleted invoice {resp.id}</Text>,
                color: 'orange',
            })
            navigate('..')
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getSupplier = async () => {
        try {
            const data = await Fetch({
                url: '/suppliers',
                options: {
                    authToken: token,
                },
            }).then((data) => {
                return data.map((customer: { name: string; id: string }) => ({
                    label: customer.name,
                    value: customer.id,
                }))
            })
            setSupplier(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getPurchaseOrders = async (supplierId: string, rmId: string) => {
        try {
            await Fetch({
                url: '/purchaseorders/details',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            poId: true,
                            price: true,
                        }),
                        where: JSON.stringify({
                            rmId,
                            po: {
                                status: "Open",
                                supplierId,
                            }
                        }),
                    },
                },
            })
                .then((data) =>
                    data.map((d: { poId: string, price: number }) => ({
                        value: d.poId,
                        label: d.poId,
                        price: d.price
                    }))
                )
                .then((data) => {
                    setPurchaseOrders(data)
                })
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const deleteRm = async (rmId: string) => {
        try {
            await Fetch({
                url: `/invoice/details`,
                options: {
                    authToken: token,
                    method: 'DELETE',
                    body: {
                        invoiceId: initialValues.id,
                        supplierId: initialValues.supplierId,
                        rmId,
                    },
                },
            })
        } catch (e) {}
    }

    useEffect(() => {
        getSupplier()
    }, [])

    useEffect(() => {
        try {
            Promise.all(
                [
                Fetch({
                    url: '/invoice',
                    options: {
                        authToken: token,
                        params: {
                            select: JSON.stringify({
                                id: true,
                            }),
                            where: JSON.stringify({
                                supplierId: form.values.supplierId,
                                status: "Open",
                            }),
                        },
                    },
                })
                    .then((data) =>
                        data.map((d: Partial<InvoiceInterface>) =>d.id)
                    )
                    .then((data) => {
                        setInvoices(data)
                    }),
                Fetch({
                    url: '/rawmaterial',
                    options: {
                        authToken: token,
                        params: {
                            select: JSON.stringify({
                                id: true,
                                description: true,
                                dtplCode: true,
                                category: true,
                            }),
                            where: JSON.stringify({
                                supplierId: form.values.supplierId,
                            }),
                        },
                    },
                })
                    .then((data) =>
                        data.map((d: Partial<RawMaterialInterface>) => ({
                            ...d,
                            value: d.id,
                            label: d.description,
                            group: d.category,
                        }))
                    )
                    .then((data) => {
                        setRawmaterial(data)
                    })
            ])
        } catch (e) {
            setError((e as Error).message)
        }
    }, [form.values.supplierId])

    const detailsColumnDef = useMemo<
        ColDef<InvoiceInterfaceForm['invoiceDetails'][number]>[]
    >(
        () => [
            {
                field: 'rmId',
                headerName: 'Raw Material',
            },
            {
                headerName: 'DTPL Part Number',
                valueGetter: (params) => {
                    return rawmaterial?.find(
                        (rm) => rm.value === params.data?.rmId
                    )?.dtplCode
                },
            },
            {
                headerName: 'Description',
                valueGetter: (params) => {
                    return rawmaterial?.find(
                        (rm) => rm.value === params.data?.rmId
                    )?.description
                },
            },
            {
                field: 'quantity',
                headerName: 'Quantity',
            },
            {
                field: 'poId',
                headerName: 'Purchase Order',
            },
            {
                field: 'poPrice',
                headerName: 'PO Price',
            },
            {
                headerName: '#',
                onCellClicked: ({ data }) => {
                    if (data) {
                        form.removeListItem(
                            'invoiceDetails',
                            form.values.invoiceDetails.findIndex(
                                (d) => d.rmId === data.rmId
                            )
                        )
                        if (isEdit) {
                            deleteRm(data.rmId)
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
        [rawmaterial, form]
    )

    if (!supplier) {
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
                        {['Basic Details', 'Raw Material'].map(
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
                        <FormSelect
                            name="supplierId"
                            xs={3}
                            label="Supplier"
                            placeholder="Select Supplier"
                            data={supplier}
                            withAsterisk
                            {...form.getInputProps('supplierId')}
                        />
                        <FormAutocomplete
                            data={invoices}
                            name="id"
                            xs={4}
                            type="text"
                            label="Invoice ID"
                            placeholder="Enter Invoice ID"
                            withAsterisk
                            {...form.getInputProps('id')}
                        />
                        <DatePicker
                            xs={3}
                            label="Date"
                            placeholder="Select Date"
                            withAsterisk
                            {...form.getInputProps('date')}
                        />
                        <FormSelect
                            name="status"
                            xs={2}
                            label="Status"
                            placeholder="Select Status"
                            defaultValue="Open"
                            data={['Open', 'Closed']}
                            disabled
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
                )}
                {activeStep === 1 && (
                    <>
                        <FormSelect
                            xs={6}
                            name="selectedRm.rmId"
                            label="Raw Material"
                            data={rawmaterial}
                            itemComponent={RawMaterialSelectItem}
                            filter={RawMaterialSelectFilter}
                            withAsterisk
                            {...form.getInputProps('selectedRm.rmId')}
                            onChange={(rmId) => {
                                if (rmId) {
                                    form.setFieldValue("selectedRm.rmId", rmId)
                                    getPurchaseOrders(form.values.supplierId, rmId)
                                }
                            }}
                        />
                        <FormInputNumber
                            name="selectedRm.quantity"
                            xs={3}
                            label="Quantity"
                            placeholder="Enter Quantity"
                            withAsterisk
                            min={0}
                            {...form.getInputProps('selectedRm.quantity')}
                        />
                        <FormSelect
                            xs={3}
                            name="selectedRm.poId"
                            label="Purchase Order"
                            data={purchaseOrders}
                            withAsterisk
                            {...form.getInputProps('selectedRm.poId')}
                            onChange={(poId) => {
                                if (poId) {
                                    form.setFieldValue("selectedRm.poId", poId)
                                    const selectedPo = purchaseOrders.find((p) => p.value === poId)
                                    if (selectedPo) {
                                        form.setFieldValue("selectedRm.poPrice", selectedPo.price)
                                    }
                                }
                            }}
                        />
                        <Grid.Col xs={12}>
                            <Button
                                fullWidth
                                size="md"
                                variant="filled"
                                color="primary"
                                onClick={() => {
                                    if (
                                        form.values.selectedRm.rmId &&
                                        form.values.selectedRm.poId &&
                                        form.values.selectedRm.quantity
                                    ) {
                                        if (
                                            !form.values.invoiceDetails.find(
                                                (r) =>
                                                    r.rmId ===
                                                    form.values.selectedRm.rmId
                                            )
                                        ) {
                                            form.insertListItem(
                                                'invoiceDetails',
                                                form.values.selectedRm
                                            )
                                            form.setFieldValue('selectedRm', {
                                                ...form.values.selectedRm,
                                                rmId: '',
                                                quantity: 0,
                                                poId: '',
                                                poPrice: 0
                                            })
                                            setPurchaseOrders([])
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
                        <Grid.Col
                            xs={12}
                            style={{
                                height: '50vh',
                            }}
                        >
                            <Table<
                                InvoiceInterfaceForm['invoiceDetails'][number]
                            >
                                fileName={form.values.id}
                                rowData={form.values.invoiceDetails}
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
