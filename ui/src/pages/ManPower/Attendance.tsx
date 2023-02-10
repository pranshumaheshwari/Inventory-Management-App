import { Button, Grid, Text } from '@mantine/core'
import { DatePicker, FormInputNumber } from '../../components'
import { Fetch, useAuth } from '../../services'

import React from 'react'
import { createFormContext } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'

interface AttendanceInterface {
    date: Date
    number: number
}

const Attendance = () => {
    const [AttendanceFormProvider, _, useAttendanceForm] =
        createFormContext<AttendanceInterface>()
    const {
        token: { token },
    } = useAuth()
    const initialValues: AttendanceInterface = {
        number: 0,
        date: new Date(),
    }
    const form = useAttendanceForm({
        initialValues,
        validate: {
            number: (value) =>
                value <= 0 ? 'Attendance should be greater than 0' : null,
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

    const onSubmit = async () => {
        try {
            const resp = await Fetch({
                url: '/attendance',
                options: {
                    method: 'POST',
                    body: {
                        number: form.values.number,
                        date: form.values.date.toISOString(),
                    },
                    authToken: token,
                },
            })
            form.reset()
            showNotification({
                title: 'Success',
                message: (
                    <Text>
                        Succesfully created new attendance record with ID -{' '}
                        {resp.id}
                    </Text>
                ),
                color: 'green',
            })
        } catch (err) {
            showNotification({
                title: 'Error',
                message: <Text>{(err as Error).message}</Text>,
                color: 'red',
            })
        }
    }

    return (
        <AttendanceFormProvider form={form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <Grid>
                    <FormInputNumber
                        xs={6}
                        label="Attendance"
                        placeholder="Enter Attendance"
                        withAsterisk
                        min={0}
                        {...form.getInputProps('number')}
                    />
                    <DatePicker
                        xs={6}
                        label="Date"
                        placeholder="Select Date"
                        withAsterisk
                        {...form.getInputProps('date')}
                    />
                    <Grid.Col xs={12}>
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
                            Create
                        </Button>
                    </Grid.Col>
                </Grid>
            </form>
        </AttendanceFormProvider>
    )
}

export default Attendance
