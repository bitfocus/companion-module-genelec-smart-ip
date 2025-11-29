import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	customHost: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'bonjour-device',
			id: 'host',
			label: 'Smart IP Speaker',
			width: 8,
		},
		{
			type:'textinput',
			id: 'customHost',
			label: 'IP Address',
			width: 8,
			isVisibleExpression: '!$(options.host)'
		},
	]
}
