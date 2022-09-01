import { SimpleBar } from '../../components';
import Navigation from './Navigation';

const DrawerContent = () => (
    <SimpleBar
        sx={{
            '& .simplebar-content': {
                display: 'flex',
                flexDirection: 'column'
            }
        }}
    >
        <>
            <Navigation />
        </>
    </SimpleBar>
);

export default DrawerContent;