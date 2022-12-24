import {
    Avatar,
    Box,
    ButtonBase,
    CardContent,
    ClickAwayListener,
    Grid,
    IconButton,
    Paper,
    Popper,
    Stack,
    Typography,
    alpha
} from '@mui/material'
import React, { useRef, useState } from 'react'

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MainCard from '../../components/MainCard'
import Transitions from '../../components/Transition'
import avatar1 from '../../assets/images/avatar.png'
import { useAuth } from '../../services'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'

const Profile = () => {
    const theme = useTheme()
    const { token, removeToken } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        removeToken()
        navigate(0)
    }

    const anchorRef = useRef<HTMLButtonElement>(null)
    const [open, setOpen] = useState(false)
    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen)
    }

    const handleClose = (event: MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
            return
        }
        setOpen(false)
    }

    const iconBackColorOpen = 'grey.300'

    return (
        <Box sx={{ flexShrink: 0, ml: 0 }}>
            <ButtonBase
                sx={{
                    p: 0.25,
                    bgcolor: open ? iconBackColorOpen : 'transparent',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'secondary.lighter' }
                }}
                aria-label="open profile"
                ref={anchorRef}
                aria-controls={open ? 'profile-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 0.5 }}>
                    <Avatar alt="profile user" src={avatar1} sx={{ width: 32, height: 32 }} />
                </Stack>
            </ButtonBase>
            <Popper
                placement="bottom-end"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 9]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions type="fade" in={open} {...TransitionProps}>
                        {open && (
                            <Paper
                                sx={{
                                    boxShadow: `0px 2px 8px ${alpha(theme.palette.grey[900], 0.15)}`,
                                    width: 290,
                                    minWidth: 240,
                                    maxWidth: 290,
                                    [theme.breakpoints.down('md')]: {
                                        maxWidth: 250
                                    }
                                }}
                            >
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MainCard elevation={0} border={false} content={false}>
                                        <CardContent sx={{ px: 2.5, pt: 3 }}>
                                            <Grid container justifyContent="space-between" alignItems="center">
                                                <Grid item>
                                                    <Stack direction="row" spacing={1.25} alignItems="center">
                                                        <Avatar alt="profile user" src={avatar1} sx={{ width: 32, height: 32 }} />
                                                        <Stack>
                                                            <Typography variant="h6">{token.user.name}</Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {token.user.type}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Grid>
                                                <Grid item>
                                                    <IconButton size="large" color="secondary" onClick={handleLogout}>
                                                        <LogoutOutlinedIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </MainCard>
                                </ClickAwayListener>
                            </Paper>
                        )}
                    </Transitions>
                )}
            </Popper>
        </Box>
    )
}

export default Profile