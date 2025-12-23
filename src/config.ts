import { type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	bonjourHost: string
	customHost: string
	user: string
	password: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'bonjour-device',
			id: 'bonjourHost',
			label: 'Smart IP Speaker',
			width: 8,
		},
		{
			type: 'textinput',
			id: 'customHost',
			label: 'IP Address',
			width: 8,
			isVisibleExpression: '!$(options:bonjourHost)',
		},
		{
			type: 'textinput',
			id: 'user',
			label: 'Username',
			width: 4,
			default: 'admin',
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Password',
			width: 4,
			default: 'admin',
		},
		/* {
			type: 'secret-text',
			id: 'password',
			label: 'Password',
			width: 4,
			default: 'admin',
		}, */
	]
}
