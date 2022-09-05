import { Accordion, AccordionDetails, AccordionSummary, Box, List, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useContext } from 'react'
import { DrawerContext } from '../../../context'
import { ItemInterface } from '../../../menu-items'

import NavItem from './NavItem'
import { useLocation } from 'react-router-dom'

const NavGroup = ({ item }: { item: ItemInterface }) => {
    const location = useLocation()
    const { open: drawerOpen } = useContext(DrawerContext)

    const navCollapse = item.children?.map((menuItem) => {
        return <NavItem key={menuItem.id} item={menuItem} level={1} />
    })

    const isSelected = item.children?.map(item => item.urls ? item.urls.indexOf(location.pathname) > -1 : false).reduce((acc, cur) => acc || cur)
    const textColor = 'text.primary'
    const selectedColor = 'primary.main'

    if (item.title) {
        return (
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                >
                    {
                        item.title &&
                        drawerOpen && (
                            <Box sx={{ pl: 3, mb: 1.5 }}>
                                <Typography variant="h6" color={isSelected ? selectedColor: textColor}>
                                    {item.title}
                                </Typography>
                            </Box>
                        )
                    }
                </AccordionSummary>
                <AccordionDetails>
                    <List
                        sx={{ mb: drawerOpen ? 1.5 : 0, py: 0, zIndex: 0 }}
                    >
                        {navCollapse}
                    </List>
                </AccordionDetails>
            </Accordion>
        )
    }

    return (
        <List sx={{ mb: drawerOpen ? 1.5 : 0, py: 0, zIndex: 0 }}>
            {navCollapse}
        </List>
    )
}

export default NavGroup