import { Button, Center, Grid, Skeleton, Text } from '@mantine/core'
import { Fetch, useAuth } from '../../../services'
import { FormInputNumber, FormInputText, FormSelect } from '../../../components'
import { RawMaterialFormProvider, useRawMaterialForm } from './context'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { RawMaterialInterface } from '../RawMaterial'
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
    const [supplier, setSupplier] = useState<
        { value: string; label: string }[] | null
    >()
    const [error, setError] = useState('')
    const initialValues = isEdit
        ? (location.state as RawMaterialInterface)
        : {
              id: '',
              description: '',
              dtplCode: '',
              category: '',
              unit: '',
              price: 0,
              storeStock: 0,
              iqcPendingStock: 0,
              poPendingStock: 0,
              lineStock: 0,
              supplierId: '',
          }
    const form = useRawMaterialForm({
        initialValues,
        validate: {
            id: isNotEmpty(),
            description: isNotEmpty(),
            dtplCode: isNotEmpty(),
            category: isNotEmpty(),
            supplierId: isNotEmpty(),
            unit: isNotEmpty(),
            price: (value) => (value <= 0 ? 'Price is required' : null),
            iqcPendingStock: (value) =>
                value < 0 ? 'Quantity should be non-negative' : null,
            storeStock: (value) =>
                value < 0 ? 'Quantity should be non-negative' : null,
            lineStock: (value) =>
                value < 0 ? 'Quantity should be non-negative' : null,
        },
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
    const onSubmit = async (values: RawMaterialInterface) => {
        try {
            const resp = await Fetch({
                url:
                    '/rawmaterial' +
                    (isEdit
                        ? '/' +
                          encodeURIComponent(
                              (location.state as RawMaterialInterface).id
                          )
                        : ''),
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
                        Succesfully {isEdit ? 'edited' : 'created'} raw material
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
                url: `/rawmaterial/${encodeURIComponent(
                    (location.state as RawMaterialInterface).id
                )}`,
                options: {
                    method: 'DELETE',
                    authToken: token,
                },
            })
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully deleted raw material with ID - {resp.id}
                    </Text>
                ),
                color: 'orange',
            })
            navigate('..')
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getSuppliers = async () => {
        try {
            const data = await Fetch({
                url: '/suppliers',
                options: {
                    authToken: token,
                },
            }).then((data) => {
                return data.map((supplier: { name: string; id: string }) => ({
                    label: supplier.name,
                    value: supplier.id,
                }))
            })
            setSupplier(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    useEffect(() => {
        getSuppliers()
    }, [])

    if (!supplier) {
        return <Skeleton width="90vw" height="100%" />
    }

    return (
        <RawMaterialFormProvider form={form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <Grid justify="center" align="center" grow>
                    <FormInputText
                        name="id"
                        xs={2}
                        type="text"
                        label="ID"
                        placeholder="Enter ID"
                        withAsterisk
                        {...form.getInputProps('id')}
                    />
                    <FormInputText
                        name="description"
                        xs={6}
                        type="text"
                        label="Description"
                        placeholder="Enter Description"
                        withAsterisk
                        {...form.getInputProps('description')}
                    />
                    <FormInputText
                        name="dtplCode"
                        xs={4}
                        type="text"
                        label="DTPL Part Number"
                        placeholder="Enter DTPL Part Number"
                        withAsterisk
                        {...form.getInputProps('dtplCode')}
                    />
                    <FormSelect
                        name="supplierId"
                        xs={4}
                        label="Supplier"
                        placeholder="Select Supplier"
                        searchable
                        data={supplier}
                        withAsterisk
                        {...form.getInputProps('supplierId')}
                    />
                    <FormSelect
                        name="category"
                        xs={3}
                        label="Category"
                        placeholder="Select Category"
                        data={[
                            'Coil',
                            'Connector',
                            'Consumables',
                            'Fuse',
                            'Grommet',
                            'Misc',
                            'Sleeve',
                            'Sticker',
                            'Tape',
                            'Terminal',
                            'Wire',
                        ]}
                        withAsterisk
                        {...form.getInputProps('category')}
                    />
                    <FormInputText
                        name="unit"
                        xs={2}
                        type="text"
                        label="Unit"
                        placeholder="Enter Unit"
                        withAsterisk
                        {...form.getInputProps('unit')}
                    />
                    <FormInputNumber
                        name="price"
                        xs={3}
                        type="number"
                        label="Price"
                        placeholder="Enter Price"
                        withAsterisk
                        min={0}
                        {...form.getInputProps('price')}
                    />
                    <FormInputNumber
                        name="iqcPendingStock"
                        xs={4}
                        type="number"
                        label="IQC Pending Stock"
                        placeholder="Enter IQC Stock"
                        min={0}
                        {...form.getInputProps('iqcPendingStock')}
                    />
                    <FormInputNumber
                        name="storeStock"
                        xs={4}
                        type="number"
                        label="Store Stock"
                        placeholder="Enter Store Stock"
                        min={0}
                        {...form.getInputProps('storeStock')}
                    />
                    <FormInputNumber
                        name="lineStock"
                        xs={4}
                        type="number"
                        label="Line Stock"
                        placeholder="Enter Line Stock"
                        min={0}
                        {...form.getInputProps('lineStock')}
                    />
                    {error && (
                        <Grid.Col xs={12}>
                            <Text c="red">{error}</Text>
                        </Grid.Col>
                    )}
                    <Grid.Col xs={12}>
                        <Button
                            fullWidth
                            size="xs"
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
        </RawMaterialFormProvider>
    )
}

export default Form
