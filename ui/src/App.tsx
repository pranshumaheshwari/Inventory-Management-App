import React from 'react';
import './App.css';
import { Link, Route, Routes } from 'react-router-dom';
import { Button } from '@mui/material';
import { useAuth } from './services';
import { Login } from './pages/Login';

function App() {
	const token = useAuth().token
	if (!token) {
		return <Login />
	}
	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="about" element={<About />} />
			</Routes>
		</div>
	)
}

function Home() {
	return (
		<>
			<main>
				<h2>Welcome to the homepage!</h2>
				<p>You can do this, I believe in you.</p>
			</main>
			<nav>
				<Button variant='contained'>
					<Link to="/about">About</Link>
				</Button>
			</nav>
		</>
	)
}

function About() {
	return (
		<>
			<main>
				<h2>Who are we?</h2>
				<p>
					That feels like an existential question, don't you
					think?
				</p>
			</main>
			<nav>
				<Link to="/">Home</Link>
			</nav>
		</>
	)
}

export default App;
