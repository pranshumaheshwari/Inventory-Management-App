import { Center, Group, Stack, Text, useMantineTheme } from '@mantine/core'
import { Dropzone, MIME_TYPES } from '@mantine/dropzone'
import { Fetch, useAuth } from '../../services'
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react'
import React, { useState } from 'react'

import Papa from 'papaparse'
import { showNotification } from '@mantine/notifications'

const BulkUpdate = () => {
    const theme = useMantineTheme()
    const {
        token: { token },
    } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    return (
        <Stack>
            <Dropzone
                loading={loading}
                onDrop={(files) => {
                    setLoading(true)
                    for (let file of files) {
                        Papa.parse(file, {
                            header: true,
                            skipEmptyLines: true,
                            complete: async (data) => {
                                Promise.all(
                                    data.data.map(async (row: any) => {
                                        try {
                                            await Fetch({
                                                url:
                                                    '/' +
                                                    file.name.split('.')[0] +
                                                    `/${row['id']}/stock`,
                                                options: {
                                                    method: 'PUT',
                                                    authToken: token,
                                                    body: row,
                                                },
                                            })
                                        } catch (err) {
                                            setError((err as Error).message)
                                            showNotification({
                                                title: 'Error',
                                                message: (
                                                    <Text>
                                                        {(err as Error).message}
                                                    </Text>
                                                ),
                                                color: 'red',
                                            })
                                        }
                                    })
                                ).then(() => {
                                    setLoading(false)
                                    showNotification({
                                        title: 'Success',
                                        message: (
                                            <Text>
                                                Succesfully updated records
                                            </Text>
                                        ),
                                        color: 'green',
                                    })
                                })
                            },
                        })
                    }
                }}
                onReject={() => {}}
                accept={[MIME_TYPES.csv]}
            >
                <Group
                    position="center"
                    spacing="xl"
                    style={{ minHeight: '75vh', pointerEvents: 'none' }}
                >
                    <Dropzone.Accept>
                        <IconUpload
                            size={50}
                            stroke={1.5}
                            color={
                                theme.colors[theme.primaryColor][
                                    theme.colorScheme === 'dark' ? 4 : 6
                                ]
                            }
                        />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX
                            size={50}
                            stroke={1.5}
                            color={
                                theme.colors.red[
                                    theme.colorScheme === 'dark' ? 4 : 6
                                ]
                            }
                        />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        <IconPhoto size={50} stroke={1.5} />
                    </Dropzone.Idle>

                    <div>
                        <Text size="xl" inline>
                            Drag files here or click to select files
                        </Text>
                        <Text size="sm" color="dimmed" inline mt={7}>
                            Attach as many files as you like
                        </Text>
                    </div>
                </Group>
            </Dropzone>
            <Center>{error && <Text c="red">{error}</Text>}</Center>
        </Stack>
    )
}

export default BulkUpdate
