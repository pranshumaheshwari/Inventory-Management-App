import React, { useMemo, useState } from 'react'
import { Icon, SpeedDial, SpeedDialAction } from '@mui/material'

const SpeedDialCustom = ({ actions }: SpeedDialInterface) => {
    const [open, setOpen] = useState(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)
    const icon = useMemo(() => {
        if(open) {
            return "close_outlined"
        }
        return "edit_outlined"
    }, [open])
    return (
        <>
            <SpeedDial
                ariaLabel="SpeedDial"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                icon={<Icon>{icon}</Icon>}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={<Icon>{action.icon}</Icon>}
                        tooltipTitle={action.name}
                        onClick={action.onClick}
                    />
                ))}
            </SpeedDial>
        </>
    )
}

export interface SpeedDialInterface {
    actions: {
        name: string;
        icon: string;
        onClick: () => void;
    }[]
}

export default SpeedDialCustom