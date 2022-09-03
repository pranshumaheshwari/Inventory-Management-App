import React from 'react'
import { Breadcrumbs, BreadcrumbsProps, Typography } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const BreadCrumbsCustom = (props: BreadcrumbsProps) => {
    const location = useLocation()
    const paths = location.pathname.split('/').slice(1)
    const cummulativePaths = paths.map((value, index) => {
        if (!index) return {
            href: value,
            value: capitalizeFirstLetter(value),
            active: index === paths.length - 1 ? true : false
        }
        return {
            href: paths.slice(0, index).join('/') + '/' + value,
            value: capitalizeFirstLetter(value),
            active: index === paths.length - 1 ? true : false
        }
    })
    return (
        <Breadcrumbs aria-label="breadcrumb" {...props}>
            {
                cummulativePaths.slice(0, -1).map(item => (
                    <Typography
                        key={item.value}
                        component={Link}
                        to={item.href}
                        variant="h6"
                        sx={{
                            textDecoration: 'none',
                            ":hover": {
                                textDecoration: item.active ? 'none' : 'underline'
                            }
                        }} 
                        color="text.secondary"
                    >
                        {item.value}
                    </Typography>
                ))
            }
            <Typography
                variant="h5"
                sx={{
                    textDecoration: 'none',
                }} 
                color="text.primary"
            >
                {cummulativePaths.at(-1)?.value}
            </Typography>
        </Breadcrumbs>
    )
}

export default BreadCrumbsCustom