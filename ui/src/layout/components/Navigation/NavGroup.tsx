import { Accordion, AccordionDetails, AccordionSummary, Box, List, Typography } from '@mui/material'

import { DrawerContext } from '../../../context'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ItemInterface } from '../../../menu-items'
import NavItem from './NavItem'
import { useContext } from 'react'
import { useLocation } from 'react-router-dom'

const NavGroup = ({ item }: { item: ItemInterface }) => {
    const location = useLocation()
    const { open: drawerOpen } = useContext(DrawerContext)

    const navCollapse = item.children?.map((menuItem) => {
        if (menuItem.type === 'item' ) {
            return <NavItem key={menuItem.id} item={menuItem} level={1} />
        } else {
            return <NavGroup key={menuItem.id} item={menuItem} />
        }
    })

    const calculateIsSelected = (item: ItemInterface): boolean => {
        let isSelected = false
        if(item.children) {
            for(let i of item.children) {
                if (i.type === 'group') {
                    isSelected = isSelected || calculateIsSelected(i)
                } else {
                    isSelected = isSelected || (i.urls ? i.urls.indexOf(location.pathname) > -1 : false)
                }
            }
        }

        return isSelected
    }

    const isSelected = calculateIsSelected(item)
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