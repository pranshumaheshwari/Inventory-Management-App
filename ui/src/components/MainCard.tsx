import PropTypes from 'prop-types'
import { ForwardedRef, forwardRef, ReactElement } from 'react'

import { useTheme } from '@mui/material/styles'
import { alpha, Card, CardContent, CardHeader, Divider, SxProps, Typography } from '@mui/material'

const headerSX = {
    p: 2.5,
    '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' }
}

const MainCard = forwardRef(
    (
        {
            border = true,
            boxShadow,
            children,
            content = true,
            contentSX = {},
            darkTitle,
            divider = true,
            elevation,
            secondary,
            shadow,
            sx = {},
            title,
            ...others
        }: MainCardInterface,
        ref: ForwardedRef<HTMLDivElement>
    ) => {
        const theme = useTheme()
        boxShadow = theme.palette.mode === 'dark' ? boxShadow || true : boxShadow

        return (
            <Card
                elevation={elevation || 0}
                ref={ref}
                {...others}
                sx={{
                    ...sx,
                    border: border ? '1px solid' : 'none',
                    borderRadius: 2,
                    borderColor: theme.palette.mode === 'dark' ? theme.palette.divider : theme.palette.grey[800],
                    boxShadow: boxShadow && (!border || theme.palette.mode === 'dark') ? shadow || `0px 2px 8px ${alpha(theme.palette.grey[900], 0.15)}` : 'inherit',
                    ':hover': {
                        boxShadow: boxShadow ? shadow || `0px 2px 8px ${alpha(theme.palette.grey[900], 0.15)}` : 'inherit'
                    },
                    '& pre': {
                        m: 0,
                        p: '16px !important',
                        fontFamily: theme.typography.fontFamily,
                        fontSize: '0.75rem'
                    }
                }}
            >
                {!darkTitle && title && (
                    <CardHeader sx={headerSX} titleTypographyProps={{ variant: 'subtitle1' }} title={title} action={secondary} />
                )}
                {darkTitle && title && (
                    <CardHeader sx={headerSX} title={<Typography variant="h3">{title}</Typography>} action={secondary} />
                )}

                {title && divider && <Divider />}

                {content && <CardContent sx={contentSX}>{children}</CardContent>}
                {!content && children}
            </Card>
        )
    }
)

interface MainCardInterface {
    border?: boolean;
    boxShadow?: boolean;
    contentSX?: SxProps;
    darkTitle?: boolean;
    divider?: boolean;
    elevation?: number;
    secondary?: ReactElement
    shadow?: string;
    sx?: SxProps;
    title?: string;
    content?: boolean;
    children: ReactElement
}

export default MainCard