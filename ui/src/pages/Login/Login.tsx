import { Box, Card, CardContent, CardHeader, Grid, InputLabel, OutlinedInput, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { AuthForm } from './components'

interface LoginProps {}

const Login = (props: LoginProps) => {
	const [username, setUsername] = useState<string>('')
	return (
		<Box sx={{
			minHeight: '100vh',
		}}>
			<Grid
				container
				direction="column"
				justifyContent="flex-end"
				sx={{
					minHeight: '100vh'
				}}>
				<Grid item xs={12}>
					<Grid
						item
						xs={12}
						container
						justifyContent="center"
						alignItems="center"
						sx={{ minHeight: { xs: 'calc(100vh - 134px)', md: 'calc(100vh - 112px)' } }}
					>
						<Grid item>
							<Card
								elevation={0}
								sx={{
									boxShadow: 5,
									maxWidth: { xs: 400, lg: 475 },
									margin: { xs: 2.5, md: 3 },
								}}
							>
								<Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>
									<Grid item xs={12}>
										<CardContent>
											<AuthForm />
										</CardContent>
									</Grid>
								</Box>
							</Card>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Box>
	)
}

export default Login