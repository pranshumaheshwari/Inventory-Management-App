import { Anchor, Breadcrumbs, Title, useMantineTheme } from '@mantine/core'

import React from 'react'
import { useLocation } from 'react-router-dom'

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function splitOnCamelCase(string: string) {
    return string.replace(/([a-z])([A-Z])/g, '$1 $2')
}

const BreadCrumbsCustom = () => {
    const location = useLocation()
    const theme = useMantineTheme()
    const paths = location.pathname.split('/').slice(1)
    const cummulativePaths = paths.map((value, index) => {
        if (!index)
            return {
                href: '/' + value,
                value: capitalizeFirstLetter(splitOnCamelCase(value)),
                active: index === paths.length - 1 ? true : false,
            }
        return {
            href: '/' + paths.slice(0, index).join('/') + '/' + value,
            value: capitalizeFirstLetter(splitOnCamelCase(value)),
            active: index === paths.length - 1 ? true : false,
        }
    })
    return (
        <Breadcrumbs>
            {cummulativePaths.slice(0, -1).map((item) => (
                <Anchor key={item.href} href={item.href} color="dimmed">
                    <Title
                        key={item.value}
                        order={5}
                        variant="link"
                        color="dimmed"
                    >
                        {item.value}
                    </Title>
                </Anchor>
            ))}
            <Title key="active" order={4} color={theme.primaryColor}>
                {cummulativePaths.at(-1)?.value}
            </Title>
        </Breadcrumbs>
    )
}

export default BreadCrumbsCustom
