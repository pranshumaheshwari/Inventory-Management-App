import {
    Button,
    Center,
    Grid,
    SelectItem,
    Skeleton,
    Stepper,
    Text,
} from '@mantine/core'
import { Fetch, useAuth } from '../../services'
import {
    FormInputNumber,
    FormInputText,
    FormMultiSelect,
} from '../../components'
import React, { useEffect, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'

import dayjs from 'dayjs'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'

export interface PurchaseOrderFromSalesOrderInterface {
    salesOrders: string[]
    finishedGoods: {
        fgId: string
        quantity: number
    }[]
    rawMaterials: {
        supplierId: string
        rmId: string
        quantity: number
        poId: string
        price: number
    }[]
}

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

const NewFromSalesOrder = () => {
    const {
        token: { token },
    } = useAuth()
    const navigate = useNavigate()
    const [activeStep, setActiveStep] = React.useState(0)
    const [error, setError] = useState('')
    const [salesOrder, setSalesOrder] = useState<SelectItem[]>()
    const form = useForm<PurchaseOrderFromSalesOrderInterface>({
        initialValues: {
            salesOrders: [],
            finishedGoods: [],
            rawMaterials: [],
        },
        validate: {
            salesOrders: isNotEmpty(),
            finishedGoods: isNotEmpty(),
            rawMaterials: isNotEmpty(),
        },
        validateInputOnChange: true,
    })

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const getSalesOrders = async () => {
        try {
            const data = await Fetch({
                url: '/salesorders',
                options: {
                    authToken: token,
                    params: {
                        select: JSON.stringify({
                            id: true,
                            customerId: true,
                        }),
                        where: JSON.stringify({
                            status: 'Open',
                        }),
                    },
                },
            }).then((data) => {
                return data.map((so: { id: string; customerId: string }) => ({
                    label: so.id,
                    value: so.id,
                    group: so.customerId,
                }))
            })
            setSalesOrder(data)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getFinsihedGoods = async (salesOrders: string[]) => {
        try {
            let data: PurchaseOrderFromSalesOrderInterface['finishedGoods'] = []
            Promise.all(
                salesOrders.map(async (salesOrder) => {
                    await Fetch({
                        url: `/salesorders/${encodeURIComponent(salesOrder)}`,
                        options: {
                            authToken: token,
                            params: {
                                select: JSON.stringify({
                                    fgId: true,
                                    quantity: true,
                                }),
                            },
                        },
                    }).then(
                        (
                            fgs: PurchaseOrderFromSalesOrderInterface['finishedGoods']
                        ) => {
                            for (let fg of fgs) {
                                const idx = data.findIndex(
                                    (d) => d.fgId === fg.fgId
                                )
                                if (idx !== -1) {
                                    data[idx].quantity += fg.quantity
                                } else {
                                    data.push(fg)
                                }
                            }
                        }
                    )
                })
            ).then(() => {
                form.setFieldValue('finishedGoods', data)
            })
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const getRawMaterials = async (
        finishedGoods: PurchaseOrderFromSalesOrderInterface['finishedGoods']
    ) => {
        const month = months[(dayjs().month() + 1) % 12]
        let data: PurchaseOrderFromSalesOrderInterface['rawMaterials'] = []
        Promise.all(
            finishedGoods.map(async (fg) => {
                await Fetch({
                    url: `/finishedgoods/${encodeURIComponent(fg.fgId)}`,
                    options: {
                        authToken: token,
                        params: {
                            select: JSON.stringify({
                                bom: {
                                    select: {
                                        rm: {
                                            select: {
                                                id: true,
                                                supplierId: true,
                                                price: true,
                                            },
                                        },
                                        quantity: true,
                                    },
                                },
                            }),
                        },
                    },
                }).then(
                    (f: {
                        bom: {
                            quantity: number
                            rm: {
                                id: string
                                supplierId: string
                                price: number
                            }
                        }[]
                    }) => {
                        for (let rm of f.bom) {
                            const idx = data.findIndex(
                                (d) => d.rmId === rm.rm.id
                            )
                            if (idx !== -1) {
                                data[idx].quantity += rm.quantity * fg.quantity
                            } else {
                                data.push({
                                    rmId: rm.rm.id,
                                    quantity: rm.quantity * fg.quantity,
                                    supplierId: rm.rm.supplierId,
                                    poId: `${rm.rm.supplierId}-${month}-001`,
                                    price: rm.rm.price,
                                })
                            }
                        }
                    }
                )
            })
        ).then(() => {
            form.setFieldValue('rawMaterials', data)
        })
    }

    const onSubmit = async () => {
        Promise.all(
            form.values.rawMaterials.map(async (rm) => {
                try {
                    await Fetch({
                        url: '/purchaseorders/details',
                        options: {
                            method: 'POST',
                            body: rm,
                            authToken: token,
                        },
                    })
                } catch (err) {
                    setError((err as Error).message)
                    showNotification({
                        title: 'Error',
                        message: <Text>{(err as Error).message}</Text>,
                        color: 'red',
                    })
                }
            })
        ).then(() => {
            showNotification({
                title: 'Success',
                message: <Text>Succesfully Purchase Orders</Text>,
                color: 'green',
            })

            navigate('..')
        })
    }

    const openModal = () =>
        openConfirmModal({
            title: 'Please confirm your action',
            centered: true,
            children: <Text size="sm">Are you sure you want to proceed</Text>,
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onConfirm: () => {
                onSubmit()
            },
        })

    useEffect(() => {
        Promise.all([getSalesOrders()])
    }, [])

    if (!salesOrder) {
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
                        {[
                            'Select Sales Orders',
                            'Select Finished Goods',
                            'Select Raw Materials',
                        ].map((label, index) => {
                            return <Stepper.Step key={label} label={label} />
                        })}
                    </Stepper>
                </Grid.Col>
                <Grid.Col xs={3} />
                {activeStep === 0 && (
                    <>
                        <Grid.Col xs={3} />
                        <FormMultiSelect
                            xs={6}
                            data={salesOrder}
                            name="salesOrders"
                            label="Sales Orders"
                            placeholder="Select Sales Orders"
                            withAsterisk
                            {...form.getInputProps('salesOrders')}
                            onChange={(salesOrders) => {
                                form.setFieldValue('salesOrders', salesOrders)
                                getFinsihedGoods(salesOrders)
                            }}
                        />
                        <Grid.Col xs={3} />
                        <Grid.Col xs={12}>
                            <Button
                                fullWidth
                                size="md"
                                variant="filled"
                                color="primary"
                                disabled={form.values.salesOrders.length === 0}
                                onClick={handleNext}
                            >
                                Next
                            </Button>
                        </Grid.Col>
                    </>
                )}
                {activeStep === 1 && (
                    <>
                        {form.values.finishedGoods.length !== 0 && (
                            <Grid.Col xs={12}>
                                <Grid justify="center" align="center" grow>
                                    <Grid.Col xs={5}>
                                        <Center>
                                            <Text fz="lg">
                                                Finished Good Part Number
                                            </Text>
                                        </Center>
                                    </Grid.Col>
                                    <Grid.Col xs={5}>
                                        <Center>
                                            <Text fz="lg">Quantity</Text>
                                        </Center>
                                    </Grid.Col>
                                    <Grid.Col xs={2} />
                                </Grid>
                            </Grid.Col>
                        )}
                        {form.values.finishedGoods.map((item, index) => (
                            <Grid.Col xs={12} key={index}>
                                <Grid justify="center" align="center" grow>
                                    <FormInputText
                                        {...form.getInputProps(
                                            `finishedGoods.${index}.fgId`
                                        )}
                                        xs={5}
                                        disabled
                                    />
                                    <FormInputNumber
                                        {...form.getInputProps(
                                            `finishedGoods.${index}.quantity`
                                        )}
                                        xs={5}
                                    />
                                    <Grid.Col xs={2}>
                                        <Button
                                            fullWidth
                                            size="xs"
                                            variant="outline"
                                            color="red"
                                            onClick={() => {
                                                form.removeListItem(
                                                    'finishedGoods',
                                                    index
                                                )
                                            }}
                                        >
                                            DELETE
                                        </Button>
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                        ))}
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
                                    getRawMaterials(form.values.finishedGoods)
                                    handleNext()
                                }}
                            >
                                Next
                            </Button>
                        </Grid.Col>
                    </>
                )}
                {activeStep === 2 && (
                    <>
                        {form.values.rawMaterials.length !== 0 && (
                            <Grid.Col xs={12}>
                                <Grid justify="center" align="center" grow>
                                    <Grid.Col xs={1}>
                                        <Center>
                                            <Text fz="lg">RM</Text>
                                        </Center>
                                    </Grid.Col>
                                    <Grid.Col xs={2}>
                                        <Center>
                                            <Text fz="lg">Supplier</Text>
                                        </Center>
                                    </Grid.Col>
                                    <Grid.Col xs={3}>
                                        <Center>
                                            <Text fz="lg">Puchase Order</Text>
                                        </Center>
                                    </Grid.Col>
                                    <Grid.Col xs={2}>
                                        <Center>
                                            <Text fz="lg">Quantity</Text>
                                        </Center>
                                    </Grid.Col>
                                    <Grid.Col xs={2}>
                                        <Center>
                                            <Text fz="lg">Price</Text>
                                        </Center>
                                    </Grid.Col>
                                    <Grid.Col xs={2} />
                                </Grid>
                            </Grid.Col>
                        )}
                        {form.values.rawMaterials.map((item, index) => (
                            <Grid.Col xs={12} key={index}>
                                <Grid justify="center" align="center" grow>
                                    <FormInputText
                                        {...form.getInputProps(
                                            `rawMaterials.${index}.rmId`
                                        )}
                                        xs={1}
                                        disabled
                                    />
                                    <FormInputText
                                        {...form.getInputProps(
                                            `rawMaterials.${index}.supplierId`
                                        )}
                                        xs={2}
                                        disabled
                                    />
                                    <FormInputText
                                        {...form.getInputProps(
                                            `rawMaterials.${index}.poId`
                                        )}
                                        xs={3}
                                        disabled
                                    />
                                    <FormInputNumber
                                        precision={2}
                                        {...form.getInputProps(
                                            `rawMaterials.${index}.quantity`
                                        )}
                                        xs={2}
                                    />
                                    <FormInputNumber
                                        precision={2}
                                        {...form.getInputProps(
                                            `rawMaterials.${index}.price`
                                        )}
                                        xs={2}
                                    />
                                    <Grid.Col xs={2}>
                                        <Button
                                            fullWidth
                                            size="xs"
                                            variant="outline"
                                            color="red"
                                            onClick={() => {
                                                form.removeListItem(
                                                    'rawMaterials',
                                                    index
                                                )
                                            }}
                                        >
                                            DELETE
                                        </Button>
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                        ))}
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
                        <Grid.Col xs={6} />
                        <Grid.Col xs={4}>
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
                                Submit
                            </Button>
                        </Grid.Col>
                    </>
                )}
                {error && (
                    <Grid.Col xs={12}>
                        <Text c="red">{error}</Text>
                    </Grid.Col>
                )}
            </Grid>
        </form>
    )
}

export default NewFromSalesOrder
