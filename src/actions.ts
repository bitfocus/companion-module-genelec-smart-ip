import type { CompanionActionDefinitions } from '@companion-module/base'
import type { GenelecSmartIPInstance } from './main.js'

export function UpdateActions(self: GenelecSmartIPInstance): void {
	const actions: CompanionActionDefinitions = {}

	const setChoices = [
		{ id: 'increase', label: 'Increase' },
		{ id: 'decrease', label: 'Decrease' },
		{ id: 'set', label: 'Set' },
	]

	function createValueAction(
		actionId: string,
		name: string,
		getCurrentValue: () => number | undefined,
		setValue: (value: number) => Promise<void>,
		defaultValue: number = 0,
		step: number = 1,
		description?: string,
	): void {
		actions[actionId] = {
			name: name,
			options: [
				{
					type: 'dropdown',
					label: 'Adjustment',
					choices: setChoices,
					default: 'set',
					id: 'adjustment',
				},
				{
					type: 'textinput',
					label: 'Value',
					default: step.toString(),
					id: 'value',
					useVariables: true,
				},
			],
			description: description ?? `Set or adjust the ${name.toLowerCase()}`,
			callback: async (action) => {
				const currentValue = getCurrentValue() ?? defaultValue
				let newValue: number
				const value = parseFloat(action.options.value as string)

				if (isNaN(value)) return

				if (action.options.adjustment === 'increase') {
					newValue = currentValue + value
				} else if (action.options.adjustment === 'decrease') {
					newValue = currentValue - value
				} else {
					newValue = value
				}

				newValue = Math.max(-200, Math.min(0, newValue))

				await setValue(newValue)
			},
		}
	}

	createValueAction(
		'volume',
		'Volume',
		() => self.speaker?.state.audioVolume?.level,
		async (value) => self.speaker?.setVolume({ level: value, mute: false }),
		50,
		1,
	)

	self.setActionDefinitions(actions)
}
