import { ForwardedRef, forwardRef, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { useTheme } from '@mui/material/styles'
import { Avatar, Chip, Icon, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { DrawerContext } from '../../../context'
import { ItemInterface } from '../../../menu-items'

const NavItem = ({ item, level }: { item: ItemInterface, level: number}) => {
    const theme = useTheme()
    const { open: drawerOpen, selected: openItem, setSelected } = useContext(DrawerContext)

    let listItemProps = { component: forwardRef((props, ref: ForwardedRef<HTMLAnchorElement>) => <Link ref={ref} {...props} to={item.url ? item.url : '/'} />) }

    const itemIcon = item.icon ? <Icon>{item.icon}</Icon> : false

    const isSelected = openItem === item.id

    useEffect(() => {
        const currentIndex = document.location.pathname
            .toString()
            .split('/')
            .findIndex((id) => id === item.id)
        if (currentIndex > -1) {
            setSelected(item.id)
        }
        // eslint-disable-next-line
    }, [])

    const textColor = 'text.primary'
    const iconSelectedColor = 'primary.main'

    return (
        <ListItemButton
            {...listItemProps}
            disabled={item.disabled}
            onClick={() => setSelected(item.id)}
            selected={isSelected}
            sx={{
                zIndex: 1201,
                pl: drawerOpen ? `${level * 28}px` : 1.5,
                py: !drawerOpen && level === 1 ? 1.25 : 1,
                ...(drawerOpen && {
                    '&:hover': {
                        bgcolor: 'primary.lighter'
                    },
                    '&.Mui-selected': {
                        bgcolor: 'primary.lighter',
                        borderRight: `2px solid ${theme.palette.primary.main}`,
                        color: iconSelectedColor,
                        '&:hover': {
                            color: iconSelectedColor,
                            bgcolor: 'primary.lighter'
                        }
                    }
                }),
                ...(!drawerOpen && {
                    '&:hover': {
                        bgcolor: 'transparent'
                    },
                    '&.Mui-selected': {
                        '&:hover': {
                            bgcolor: 'transparent'
                        },
                        bgcolor: 'transparent'
                    }
                })
            }}
        >
            {itemIcon && (
                <ListItemIcon
                    sx={{
                        minWidth: 28,
                        color: isSelected ? iconSelectedColor : textColor,
                        ...(!drawerOpen && {
                            borderRadius: 1.5,
                            width: 36,
                            height: 36,
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                                bgcolor: 'secondary.lighter'
                            }
                        }),
                        ...(!drawerOpen &&
                            isSelected && {
                                bgcolor: 'primary.lighter',
                                '&:hover': {
                                    bgcolor: 'primary.lighter'
                                }
                            })
                    }}
                >
                    {itemIcon}
                </ListItemIcon>
            )}
            {(drawerOpen || (!drawerOpen && level !== 1)) && (
                <ListItemText
                    primary={
                        <Typography variant="h6" sx={{ color: isSelected ? iconSelectedColor : textColor }}>
                            {item.title}
                        </Typography>
                    }
                />
            )}
            {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
                <Chip
                    color={item.chip.color}
                    variant={item.chip.variant}
                    size={item.chip.size}
                    label={item.chip.label}
                    avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
                />
            )}
        </ListItemButton>
    )
}

export default NavItem