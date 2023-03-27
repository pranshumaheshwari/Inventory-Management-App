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
import {
    FormInputNumber,
    FormInputText,
    FormSelect,
    Table,
} from '../../../components'
import { PurchaseOrdersFormProvider, usePurchaseOrdersForm } from './context'
import { RawMaterialSelectFilter, RawMaterialSelectItem } from '../../common'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ColDef } from 'ag-grid-community'
import { PurchaseOrdersInterface } from '../PurchaseOrders'
import { RawMaterialInterface } from '../../RawMaterial/RawMaterial'
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
    const [supplier, setSupplier] = useState<{ value: string }[] | null>()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = React.useState(0)
    const [rawMaterial, setRawMaterial] = useState<SelectItem[]>([])
    const [selectedRm, setSelectedRm] = useState<{
        rm: SelectItem
        quantity: number
    }>({
        rm: {
            value: '',
        },
        quantity: 0,
    })
    let initialValues: PurchaseOrdersInterface = {
        id: '',
        supplierId: '',
        status: 'Open',
        poDetails: [],
        supplier: {
            name: '',
        },
    }

    if (isEdit) {
        initialValues = {
            ...initialValues,
            ...(location.state as PurchaseOrdersInterface),
        }
    }

    const form = usePurchaseOrdersForm({
        initialValues,
        validate: {
            id: isNotEmpty(),
            supplierId: isNotEmpty(),
            status: isNotEmpty(),
            poDetails: (value) =>
                value.length === 0
                    ? 'Need atleast one raw material in purchase order'
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

    const onSubmit = async (values: PurchaseOrdersInterface) => {
        try {
            const resp = await Fetch({
                url: '/purchaseorders',
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
                        Succesfully {isEdit ? 'edited' : 'created'} Purchase
                        Order with ID - {resp.id}
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
                url: `/purchaseorders`,
                options: {
                    method: 'DELETE',
                    authToken: token,
                    body: initialValues,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully deleted Purchase Order with ID - {resp.id}
                    </Text>
                ),
                color: 'orange',
            })
            navigate('..')
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const onDeleteRm = async (rmId: string) => {
        try {
            await Fetch({
                url: `/purchaseorders/details`,
                options: {
                    method: 'DELETE',
                    authToken: token,
                    body: {
                        poId: initialValues.id,
                        rmId,
                    },
                },
            })
        } catch (e) {}
    }

    const getSuppliers = async () => {
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

    const getRawMaterials = async (supplierId: string) => {
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
                            price: true,
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
            setRawMaterial(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getSuppliers()
        if (isEdit) {
            getRawMaterials(initialValues.supplierId)
        }
    }, [])

    const detailsColumnDef = useMemo<
        ColDef<PurchaseOrdersInterface['poDetails'][number]>[]
    >(
        () => [
            {
                field: 'rmId',
                headerName: 'Raw Material',
            },
            {
                field: 'Description',
                valueGetter: (params) => {
                    return rawMaterial.find(
                        (rm) => rm.value === params.data?.rmId
                    )?.description
                },
            },
            {
                field: 'DTPL Part Number',
                valueGetter: (params) => {
                    return rawMaterial.find(
                        (rm) => rm.value === params.data?.rmId
                    )?.dtplCode
                },
            },
            {
                field: 'quantity',
                headerName: 'Quantity',
            },
            {
                field: 'price',
                headerName: 'Price',
            },
            {
                field: '#',
                cellRenderer: ({
                    data,
                }: {
                    data: PurchaseOrdersInterface['poDetails'][number]
                }) => (
                    <Button
                        fullWidth
                        size="xs"
                        variant="outline"
                        color="red"
                        onClick={() => {
                            form.removeListItem(
                                'poDetails',
                                form.values.poDetails.findIndex(
                                    (d) => d.rmId === data.rmId
                                )
                            )
                            onDeleteRm(data.rmId)
                        }}
                    >
                        DELETE
                    </Button>
                ),
            },
        ],
        [rawMaterial]
    )

    if (!supplier) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <PurchaseOrdersFormProvider form={form}>
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
                            {['Basic Details', 'List of Raw Material'].map(
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
                                name="id"
                                xs={2}
                                type="text"
                                label="ID"
                                placeholder="Enter ID"
                                withAsterisk
                                {...form.getInputProps('id')}
                            />
                            <FormSelect
                                name="supplierId"
                                xs={6}
                                label="Supplier"
                                placeholder="Select Supplier"
                                data={supplier}
                                withAsterisk
                                {...form.getInputProps('supplierId')}
                                onChange={(supplierId) => {
                                    if (supplierId) {
                                        form.setFieldValue(
                                            'supplierId',
                                            supplierId
                                        )
                                        getRawMaterials(supplierId)
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
                    )}{' '}
                    {activeStep === 1 && (
                        <>
                            <FormSelect
                                xs={6}
                                id="rmId"
                                label="Raw Material"
                                data={rawMaterial}
                                itemComponent={RawMaterialSelectItem}
                                filter={RawMaterialSelectFilter}
                                {...form.getInputProps('rmId')}
                                onChange={(value) =>
                                    setSelectedRm((selectedRm) => {
                                        let rm = rawMaterial.find(
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
                            <FormInputNumber
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
                                                !form.values.poDetails.find(
                                                    (r) =>
                                                        r.rmId ===
                                                        selectedRm.rm.id
                                                )
                                            ) {
                                                form.insertListItem(
                                                    'poDetails',
                                                    {
                                                        rmId: selectedRm.rm.id,
                                                        quantity:
                                                            selectedRm.quantity,
                                                        price: selectedRm.rm
                                                            .price,
                                                    }
                                                )
                                            }
                                        }
                                    }}
                                >
                                    Add to Purchase Order
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
                                    PurchaseOrdersInterface['poDetails'][number]
                                >
                                    fileName={form.values.id}
                                    rowData={form.values.poDetails}
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
        </PurchaseOrdersFormProvider>
    )
}

export default Form
