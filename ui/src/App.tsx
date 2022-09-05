import React, { useState } from 'react';
import './App.css';
import { ScrollTop } from './components';
import CustomTheme from './themes'
import Routes from './routes'
import { DrawerContext } from './context';

function App() {
	const [open, setOpen] = useState(false)
	return (
		<CustomTheme>
			<ScrollTop>
				<DrawerContext.Provider value={{ open, setOpen }}>
					<Routes />
				</DrawerContext.Provider>
			</ScrollTop>
		</CustomTheme>
	)
}

export default App;
