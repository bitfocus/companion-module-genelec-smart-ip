import { type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	mode: 'individual' | 'zone'
	bonjourHost: string
	customHost: string
	user: string
	password: string
	speakers: SpeakerConfig[]
	multicastIp: string
	multicastPort: number
}

export interface SpeakerConfig {
	ip: string
	label: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'dropdown',
			id: 'mode',
			label: 'Connection Mode',
			width: 8,
			choices: [
				{
					id: 'individual',
					label: 'Individual Speaker',
				},
				{
					id: 'zone',
					label: 'Custom Multicast Zone',
				},
			],
			default: 'individual',
		},
		{
			type: 'bonjour-device',
			id: 'bonjourHost',
			label: 'Smart IP Speaker',
			width: 8,
			isVisibleExpression: '$(options:mode) != "zone"',
		},
		{
			type: 'textinput',
			id: 'customHost',
			label: 'Custom IP Address (Single Speaker)',
			width: 8,
			isVisibleExpression: '!$(options:bonjourHost) && $(options:mode) != "zone"',
		},
		{
			type: 'textinput',
			id: 'user',
			label: 'Username',
			width: 4,
			default: 'admin',
			isVisibleExpression: '$(options:mode) != "zone"',
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Password',
			width: 4,
			default: 'admin',
			isVisibleExpression: '$(options:mode) != "zone"',
		},
		/* {
			type: 'secret-text',
			id: 'password',
			label: 'Password',
			width: 4,
			default: 'admin',
		}, */
		{
			type: 'textinput',
			id: 'multicastIp',
			label: 'Custom Multicast IP',
			width: 6,
			default: '',
			regex: '/^$|^((22[4-9]|23[0-9])\\.(\\d{1,3}\\.){2}\\d{1,3})$/',
			isVisibleExpression: '$(options:mode) == "zone"',
		},
		{
			type: 'number',
			id: 'multicastPort',
			label: 'Custom Multicast Port',
			width: 6,
			default: 49152,
			min: 1024,
			max: 65535,
			isVisibleExpression: '$(options:mode) == "zone"',
		},
	]
}
