import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { withFirebase } from '../../Firebase'
import * as ROUTES from '../../../constants/routes'
import { IonContent, IonGrid, IonButton, IonRow, IonCol, IonInput, IonHeader, IonToolbar, IonButtons } from '@ionic/react'
import SplashLogo from '../../Reusables/ionic/SplashLogo'

import { Trans } from 'react-i18next'
import LabelledBackButton from '../../Reusables/ionic/LabelledBackButton'

const PasswordForgetPage = () => (
	<>
		<IonHeader>
			<IonToolbar>
				<IonButtons slot="start">
					<LabelledBackButton defaultHref={ROUTES.SIGN_IN} />
				</IonButtons>
			</IonToolbar>
		</IonHeader>
		<IonContent className="login-page">
			<SplashLogo
				maxWidth="100px"
				textStart="Forgot"
				textEnd="MyPassword!"
			/>
			<IonGrid>
				<PasswordForgetForm />
			</IonGrid>
		</IonContent>
	</>
)

const INITIAL_STATE = {
	email: '',
	error: null,
}

class PasswordForgetFormBase extends Component {
	constructor(props) {
		super(props)

		this.state = { ...INITIAL_STATE }
	}

	onSubmit = event => {
		const { email } = this.state

		this.props.firebase
			.doPasswordReset(email)
			.then(() => {
				this.setState({ ...INITIAL_STATE })
			})
			.catch(error => {
				this.setState({ error })
			})

		event.preventDefault()
	};

	onChange = event => {
		this.setState({ [event.target.name]: event.target.value })
	};

	render() {
		const { email, error } = this.state

		const isInvalid = email === ''

		return (
			<form onSubmit={this.onSubmit}>
				<IonRow>
					<IonCol>
						<IonInput
							name="email"
							value={email}
							onIonChange={this.onChange}
							clearInput
							type="email"
							placeholder="Email"
							class="input"
							padding-horizontal
							clear-input="true"></IonInput>
					</IonCol>
				</IonRow>
				<IonButton disabled={isInvalid} type="submit" expand="block">
					<Trans>Reset My Password</Trans>
				</IonButton>
				{error && <p>{error.message}</p>}
			</form>
		)
	}
}

const PasswordForgetLink = () => (
	<span><Link to={ROUTES.PASSWORD_FORGET}><Trans>Forgot Password</Trans></Link></span>
)

export default PasswordForgetPage

const PasswordForgetForm = withFirebase(PasswordForgetFormBase)

export { PasswordForgetForm, PasswordForgetLink }