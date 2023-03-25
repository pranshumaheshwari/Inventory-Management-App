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
import { FinishedGoodFormProvider, useFinishedGoodForm } from './context'
import { FormInputNumber, FormInputText, FormSelect } from '../../../components'
import { RawMaterialSelectFilter, RawMaterialSelectItem } from '../../common'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { FinishedGoodsInterface } from '../FinishedGood'
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
    const [customer, setCustomer] = useState<SelectItem[]>()
    const [error, setError] = useState('')
    const [activeStep, setActiveStep] = React.useState(0)
    const [rawmaterial, setRawmaterial] = useState<SelectItem[]>()
    const [selectedRm, setSelectedRm] = useState<{
        rm: SelectItem
        quantity: number
    }>({
        rm: {
            value: '',
        },
        quantity: 0,
    })
    let initialValues: FinishedGoodsInterface = {
        id: '',
        description: '',
        category: '',
        customerId: '',
        price: 0,
        overheads: 0,
        storeStock: 0,
        manPower: 0,
        bom: [],
    }

    if (isEdit) {
        initialValues = {
            ...initialValues,
            ...(location.state as FinishedGoodsInterface),
        }
    }

    const form = useFinishedGoodForm({
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

    if (!customer || !rawmaterial) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <FinishedGoodFormProvider form={form}>
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
                            {['Basic Details', 'Bill of Material'].map(
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
                                precision={2}
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
                            <Grid.Col xs={1} />
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
                                                !form.values.bom.find(
                                                    (r) =>
                                                        r.rmId ===
                                                        selectedRm.rm.id
                                                )
                                            ) {
                                                form.insertListItem('bom', {
                                                    rmId: selectedRm.rm.id,
                                                    quantity:
                                                        selectedRm.quantity,
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
                            {form.values.bom.length !== 0 && (
                                <Grid.Col xs={12}>
                                    <Grid justify="center" align="center" grow>
                                        <Grid.Col xs={4}>
                                            <Text fz="lg">
                                                Raw Material Identifier
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col xs={4}>
                                            <Text fz="lg">Quantity</Text>
                                        </Grid.Col>
                                        <Grid.Col xs={4} />
                                    </Grid>
                                </Grid.Col>
                            )}
                            {form.values.bom.map((item, index) => (
                                <Grid.Col xs={12} key={index}>
                                    <Grid justify="center" align="center" grow>
                                        <FormInputText
                                            xs={4}
                                            disabled
                                            {...form.getInputProps(
                                                `bom.${index}.rmId`
                                            )}
                                        />
                                        <FormInputNumber
                                            xs={4}
                                            precision={4}
                                            {...form.getInputProps(
                                                `bom.${index}.quantity`
                                            )}
                                        />
                                        <Grid.Col xs={4}>
                                            <Button
                                                fullWidth
                                                size="xs"
                                                variant="outline"
                                                color="red"
                                                onClick={() => {
                                                    form.removeListItem(
                                                        'bom',
                                                        index
                                                    )
                                                    deleteRm(item.rmId)
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
        </FinishedGoodFormProvider>
    )
}

export default Form
