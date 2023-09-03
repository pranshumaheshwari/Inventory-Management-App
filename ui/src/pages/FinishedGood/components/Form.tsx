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
import { RawMaterialSelectFilter, RawMaterialSelectItem } from '../../common'
import React, { useEffect, useMemo, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'
import { useLocation, useNavigate } from 'react-router-dom'

import { ColDef } from 'ag-grid-community'
import { FinishedGoodsInterface } from '../FinishedGood'
import { RawMaterialInterface } from '../../RawMaterial/RawMaterial'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

interface FinishedGoodsInterfaceForm extends FinishedGoodsInterface {
    selectedRm: {
        rmId: string
        quantity: number
    }
}

const Form = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isEdit = location.state ? true : false
    const {
        token: { token, user },
    } = useAuth()
    const [customer, setCustomer] = useState<SelectItem[]>()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = React.useState(0)
    const [rawmaterial, setRawmaterial] = useState<SelectItem[]>()
    let initialValues: FinishedGoodsInterfaceForm = {
        id: '',
        description: '',
        category: '',
        customerId: '',
        price: 0,
        overheads: 0,
        storeStock: 0,
        manPower: 0,
        bom: [],
        selectedRm: {
            rmId: '',
            quantity: 0,
        },
    }

    if (isEdit) {
        initialValues = {
            ...initialValues,
            ...(location.state as FinishedGoodsInterfaceForm),
        }
    }

    const form = useForm({
        initialValues,
        validate: {
            id: isNotEmpty(),
            description: isNotEmpty(),
            category: isNotEmpty(),
            customerId: isNotEmpty(),
            price: (value) => (value <= 0 ? 'Price is required' : null),
            manPower: (value) =>
                value < 0 ? 'Man power be non-negative' : null,
            overheads: (value) =>
                value < 0 ? 'Overheads should be non-negative' : null,
            storeStock: (value) =>
                value < 0 ? 'Store stock should be non-negative' : null,
            bom: (value) =>
                value.length === 0
                    ? 'Need atleast one raw material in BOM'
                    : null,
        },
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
                    '/finishedgoods' +
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
                        Succesfully {isEdit ? 'edited' : 'created'} finished
                        good with ID - {resp.id}
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
                url: `/finishedgoods/${encodeURIComponent(initialValues.id)}`,
                options: {
                    method: 'DELETE',
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully deleted finished good with ID - {resp.id}
                    </Text>
                ),
                color: 'orange',
            })
            navigate('..')
        } catch (e) {
            setError((e as Error).message)
        }
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

    const getRawmaterials = async () => {
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
                            storeStock: true,
                            lineStock: true,
                        }),
                    },
                },
            }).then((data) =>
                data.map((d: Partial<RawMaterialInterface>) => ({
                    ...d,
                    value: d.id,
                    label: d.id,
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
                url: `/finishedgoods/${initialValues.id}/${rmId}`,
                options: {
                    authToken: token,
                    method: 'DELETE',
                },
            })
        } catch (e) {}
    }

    useEffect(() => {
        Promise.all([getCustomers(), getRawmaterials()])
    }, [])

    const detailsColumnDef = useMemo<
        ColDef<FinishedGoodsInterface['bom'][number]>[]
    >(
        () => [
            {
                field: 'rmId',
                headerName: 'Raw Material',
            },
            {
                field: 'DTPL Part Number',
                valueGetter: (params) => {
                    return rawmaterial?.find(
                        (rm) => rm.value === params.data?.rmId
                    )?.dtplCode
                },
            },
            {
                field: 'Description',
                valueGetter: (params) => {
                    return rawmaterial?.find(
                        (rm) => rm.value === params.data?.rmId
                    )?.description
                },
            },
            {
                field: 'storeStock',
                headerName: 'Store Stock',
                type: 'numberColumn',
                valueGetter: (params) => {
                    return rawmaterial?.find(
                        (rm) => rm.value === params.data?.rmId
                    )?.storeStock
                },
            },
            {
                field: 'lineStock',
                headerName: 'Line Stock',
                type: 'numberColumn',
                valueGetter: (params) => {
                    return rawmaterial?.find(
                        (rm) => rm.value === params.data?.rmId
                    )?.lineStock
                },
            },
            {
                field: 'quantity',
                headerName: 'Quantity',
                editable: true,
                valueParser: ({ newValue }) => parseFloat(newValue),
                valueFormatter: (params) => {
                    return Number(params.value).toFixed(4).toString()
                },
            },
            {
                field: '#',
                onCellClicked: ({ data }) => {
                    if (data) {
                        form.removeListItem(
                            'bom',
                            form.values.bom.findIndex(
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

    if (!customer || !rawmaterial) {
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
                        {['Basic Details', 'Bill of Material'].map(
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
                        <FormInputText
                            xs={8}
                            label="Description"
                            placeholder="Enter Description"
                            withAsterisk
                            {...form.getInputProps('description')}
                        />
                        <FormSelect
                            xs={6}
                            label="Customer"
                            placeholder="Select Customer"
                            data={customer}
                            withAsterisk
                            {...form.getInputProps('customerId')}
                        />
                        <FormSelect
                            xs={6}
                            label="Category"
                            placeholder="Select Category"
                            data={[
                                {
                                    value: 'Fuse_Box',
                                    label: 'Fuse Box',
                                },
                                {
                                    value: 'Indicator',
                                    label: 'Indicator',
                                },
                                {
                                    value: 'Magneto',
                                    label: 'Magneto',
                                },
                                {
                                    value: 'Battery_Cable',
                                    label: 'Battery Cable',
                                },
                                {
                                    value: 'Lead_Wire',
                                    label: 'Lead Wire',
                                },
                                {
                                    value: 'Piaggio',
                                    label: 'Piaggio',
                                },
                                {
                                    value: 'Pigtail',
                                    label: 'Pigtail',
                                },
                                {
                                    value: 'SPD',
                                    label: 'SPD',
                                },
                            ]}
                            withAsterisk
                            {...form.getInputProps('category')}
                        />
                        <FormInputNumber
                            xs={3}
                            type="number"
                            label="Price"
                            placeholder="Enter Price"
                            min={0}
                            precision={5}
                            withAsterisk
                            {...form.getInputProps('price')}
                        />
                        <FormInputNumber
                            xs={3}
                            type="number"
                            label="Store Stock"
                            placeholder="Enter Store Stock"
                            min={0}
                            {...form.getInputProps('storeStock')}
                        />
                        {user.type === 'admin' && (
                            <>
                                <FormInputNumber
                                    xs={3}
                                    type="number"
                                    label="Man Power"
                                    placeholder="Enter Man Power"
                                    precision={2}
                                    min={0}
                                    {...form.getInputProps('manPower')}
                                />
                                <FormInputNumber
                                    xs={3}
                                    type="number"
                                    label="Overheads"
                                    placeholder="Enter Overheads"
                                    precision={2}
                                    min={0}
                                    {...form.getInputProps('overheads')}
                                />
                            </>
                        )}
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
                            xs={9}
                            name="selectedRm.rmId"
                            label="Raw Material"
                            data={rawmaterial}
                            itemComponent={RawMaterialSelectItem}
                            filter={RawMaterialSelectFilter}
                            withAsterisk
                            {...form.getInputProps('selectedRm.rmId')}
                        />
                        <FormInputNumber
                            name="selectedRm.quantity"
                            xs={3}
                            label="Quantity"
                            placeholder="Enter Quantity"
                            withAsterisk
                            min={0}
                            precision={5}
                            {...form.getInputProps('selectedRm.quantity')}
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
                                        form.values.selectedRm.quantity &&
                                        form.values.selectedRm.rmId
                                    ) {
                                        if (
                                            !form.values.bom.find(
                                                (r) =>
                                                    r.rmId ===
                                                    form.values.selectedRm.rmId
                                            )
                                        ) {
                                            form.insertListItem(
                                                'bom',
                                                form.values.selectedRm
                                            )
                                            form.setFieldValue('selectedRm', {
                                                rmId: '',
                                                quantity: 0,
                                            })
                                        }
                                    }
                                }}
                            >
                                Add to BOM
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
                            <Table<FinishedGoodsInterfaceForm['bom'][number]>
                                fileName={form.values.id}
                                rowData={form.values.bom}
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
