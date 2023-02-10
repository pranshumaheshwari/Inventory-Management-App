import { ActionIcon, Affix, Menu } from '@mantine/core'
import { IconEdit, TablerIconsProps } from '@tabler/icons-react'

import React from 'react'

export interface AffixInterface {
    actions: {
        name: string
        icon: (props: TablerIconsProps) => JSX.Element
        onClick: () => void
    }[]
}

export default function MAffix({ actions }: AffixInterface) {
    return (
        <Affix position={{ bottom: 40, right: 40 }}>
            <Menu
                trigger="hover"
                openDelay={100}
                closeDelay={400}
                position="top"
            >
                <Menu.Target>
                    <ActionIcon
                        color="primary"
                        size="xl"
                        radius="xl"
                        variant="filled"
                    >
                        <IconEdit size={25} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    {actions.map((action) => (
                        <Menu.Item
                            key={action.name}
                            icon={<action.icon />}
                            onClick={action.onClick}
                        >
                            {action.name}
                        </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>
        </Affix>
    )
}
