import { CssBaseline, StyledEngineProvider } from '@mui/material'
import { ReactElement, useMemo } from 'react'
import { ThemeOptions, ThemeProvider, createTheme } from '@mui/material/styles'

import { ConfirmProvider } from 'material-ui-confirm'
import CustomShadows from './shadows'
import Palette from './palette'
import Typography from './typography'
import componentsOverride from './overrides'

export default function ThemeCustomization({
    children,
}: {
    children: ReactElement
}) {
    const theme = Palette('light')

    const themeTypography = Typography(`'Public Sans', sans-serif`)
    const themeCustomShadows = useMemo(() => CustomShadows(theme), [theme])

    const themeOptions = useMemo<ThemeOptions>(
        () => ({
            breakpoints: {
                values: {
                    xs: 0,
                    sm: 768,
                    md: 1024,
                    lg: 1266,
                    xl: 1536,
                },
            },
            direction: 'ltr',
            mixins: {
                toolbar: {
                    minHeight: 60,
                    paddingTop: 8,
                    paddingBottom: 8,
                },
            },
            palette: theme.palette,
            customShadows: themeCustomShadows,
            typography: themeTypography,
        }),
        [theme, themeTypography, themeCustomShadows]
    )

    const themes = createTheme(themeOptions)
    themes.components = componentsOverride(themes)

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes}>
                <CssBaseline />
                <ConfirmProvider
                    defaultOptions={{
                        allowClose: false,
                        confirmationButtonProps: {
                            color: 'error',
                        },
                        confirmationText: 'Delete',
                        title: '',
                    }}
                >
                    {children}
                </ConfirmProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    )
}
