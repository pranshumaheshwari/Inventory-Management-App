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
import { Fetch, useAuth } from '../../../../services'
import {
    FormInputNumber,
    FormInputText,
    FormSelect,
} from '../../../../components'
import { InvoiceFormProvider, useInvoiceForm } from './context'
import { RawMaterialSelectFilter, RawMaterialSelectItem } from '../../../common'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { InvoiceInterface } from '../Invoice'
import { RawMaterialInterface } from '../../../RawMaterial/RawMaterial'
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
    const [activeStep, setActiveStep] = React.useState(0)
    const [rawmaterial, setRawmaterial] = useState<SelectItem[]>([])
    const [selectedRm, setSelectedRm] = useState<{
        rm: SelectItem
        quantity: number
    }>({
        rm: {
            value: '',
        },
        quantity: 0,
    })
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [error, setError] = useState('')
    let initialValues: InvoiceInterface = {
        id: '',
        supplierId: '',
        supplier: {
            name: '',
        },
        status: 'Open',
        invoiceDetails: [],
    }

    if (isEdit) {
        initialValues = {
            ...initialValues,
            ...(location.state as InvoiceInterface),
        }
    }

    const form = useInvoiceForm({
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

    const onSubmit = async (values: InvoiceInterface) => {
        try {
            const resp = await Fetch({
                url: '/invoice',
                options: {
                    method: isEdit ? 'PUT' : 'POST',
                    body: values,
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Successfully {isEdit ? 'updated' : 'created'} invoice{' '}
                        {resp[0].id}
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

    const updateSupplier = async (supplierId: string) => {
        try {
            const data = await Fetch({
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
                            supplierId,
                        }),
                    },
                },
            }).then((data) =>
                data.map((d: Partial<RawMaterialInterface>) => ({
                    ...d,
                    value: d.id,
                    label: d.description,
                    group: d.category,
                }))
            )
            setRawmaterial(data)
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

    if (!supplier) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <InvoiceFormProvider form={form}>
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
                            {['Basic Details', 'Raw Material'].map(
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
                            <FormSelect
                                name="supplierId"
                                xs={6}
                                label="Supplier"
                                placeholder="Select Supplier"
                                data={supplier}
                                withAsterisk
                                {...form.getInputProps('supplierId')}
                                onChange={(value) => {
                                    form.getInputProps('supplierId').onChange(
                                        value
                                    )
                                    if (value) {
                                        updateSupplier(value)
                                    }
                                }}
                            />
                            <FormInputText
                                name="id"
                                xs={4}
                                type="text"
                                label="Invoice ID"
                                placeholder="Enter Invoice ID"
                                withAsterisk
                                {...form.getInputProps('id')}
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
                    )}
                    {activeStep === 1 && (
                        <>
                            <FormSelect
                                xs={6}
                                id="rmId"
                                label="Raw Material"
                                data={rawmaterial}
                                itemComponent={RawMaterialSelectItem}
                                filter={RawMaterialSelectFilter}
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
                                xs={3}
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
                            {/* <FormInputNumber
                                name="price"
                                xs={3}
                                min={0}
                                precision={2}
                                label="Price"
                                placeholder="Enter Price"
                                {...form.getInputProps('price')}
                                value={selectedRm ? selectedRm.rm.price : 0}
                                onChange={(val) => {
                                    if (val) {
                                        setSelectedRm((selectedRm) => ({
                                            ...selectedRm,
                                            rm: {
                                                ...selectedRm.rm,
                                                price: val,
                                            },
                                        }))
                                    }
                                }}
                            /> */}
                            <Grid.Col xs={3} />
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
                                                !form.values.invoiceDetails.find(
                                                    (r) =>
                                                        r.rmId ===
                                                        selectedRm.rm.id
                                                )
                                            ) {
                                                form.insertListItem(
                                                    'invoiceDetails',
                                                    {
                                                        rmId: selectedRm.rm.id,
                                                        quantity:
                                                            selectedRm.quantity,
                                                    }
                                                )
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
                            {form.values.invoiceDetails.length !== 0 && (
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
                            {form.values.invoiceDetails.map((item, index) => (
                                <Grid.Col xs={12} key={index}>
                                    <Grid justify="center" align="center" grow>
                                        <FormInputText
                                            xs={4}
                                            disabled
                                            {...form.getInputProps(
                                                `invoiceDetails.${index}.rmId`
                                            )}
                                        />
                                        <FormInputNumber
                                            xs={4}
                                            {...form.getInputProps(
                                                `invoiceDetails.${index}.quantity`
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
                                                        'invoiceDetails',
                                                        index
                                                    )
                                                    deleteRm(item.rmId)
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
        </InvoiceFormProvider>
    )
}

export default Form
