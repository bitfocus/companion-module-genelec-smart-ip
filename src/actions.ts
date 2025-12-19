import type { CompanionActionDefinitions } from '@companion-module/base'
import type { GenelecSmartIPInstance } from './main.js'
import { LEDResponse } from './types.js'

export function UpdateActions(self: GenelecSmartIPInstance): void {
	const actions: CompanionActionDefinitions = {}

	const toggleChoices = [
		{ id: 'toggle', label: 'Toggle' },
		{ id: 'true', label: 'Enable' },
		{ id: 'false', label: 'Disable' },
	]

	function createToggleAction(
		actionId: string,
		name: string,
		getCurrentValue: () => boolean | undefined,
		setValue: (value: boolean) => Promise<void>,
		description?: string,
	): void {
		actions[actionId] = {
			name: name,
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					choices: toggleChoices,
					default: 'toggle',
					id: 'mode',
				},
			],
			description: description ?? `Set the ${name.toLowerCase()}`,
			callback: async (action) => {
				const currentValue = getCurrentValue() ?? false
				let newValue: boolean
				if (action.options.mode === 'toggle') {
					newValue = !currentValue
				} else {
					newValue = action.options.mode === 'true' ? true : false
				}
				await setValue(newValue)
			},
		}
	}

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
		min: number = 0,
		max: number = 100,
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
				} else if (action.options.adjustment === 'set') {
					newValue = value
				} else {
					return
				}

				newValue = Math.max(min, Math.min(max, newValue))

				await setValue(newValue)
			},
		}
	}

	createValueAction(
		'volume',
		'Volume',
		() => self.speaker?.state.audioVolume?.level,
		async (value) => self.speaker?.setVolume({ level: value }),
		0,
		5,
		-200,
		0,
	)

	createToggleAction(
		'mute',
		'Mute',
		() => self.speaker?.state.audioVolume?.mute,
		async (value) => self.speaker?.setVolume({ mute: value }),
	)

	createValueAction(
		'ledIntensity',
		'LED Intensity',
		() => self.speaker?.state.led?.ledIntensity,
		async (value) => self.speaker?.setLEDState({ ledIntensity: value }),
		100,
		5,
		0,
		100,
	)

	createToggleAction(
		'rj45Led',
		'RJ45 LEDs',
		() => self.speaker?.state.led?.rj45Leds,
		async (value) => self.speaker?.setLEDState({ rj45Leds: value }),
	)

	actions['clipLed'] = {
		name: 'Clip LED',
		options: [
			{
				type: 'dropdown',
				label: 'Mode',
				choices: toggleChoices,
				default: 'toggle',
				id: 'mode',
			},
		],
		description: `Set the hide state of the clip LED`,
		callback: async (action) => {
			const currentValue = self.speaker?.state.led?.hideClip ?? false
			let newValue: boolean
			if (action.options.mode === 'toggle') {
				newValue = !currentValue
			} else {
				newValue = action.options.mode === 'true' ? false : true
			}
			await self.speaker?.setLEDState({ hideClip: newValue })
		},
	}

	actions['blinkLed'] = {
		name: 'Identify / Blink LED',
		options: [
			{
				type: 'checkbox',
				label: 'Enable',
				default: true,
				id: 'blink',
			},
		],
		description: `Identify the device by blinking the LED yellow for 10 seconds`,
		callback: async (action) => {
			let data: LEDResponse = {
				take: false,
				flash: false,
			}
			if (action.options.blink) {
				data = {
					take: true,
					flash: true,
					color: 'YELLOW',
				}
			}
			await self.speaker?.setLEDState(data)
		},
	}

	/* 	actions['zoneConfig'] = {
			name: 'Set Zone Config',
			options: [
				{
					type: 'textinput',
					label: 'Zone Number',
					default: '',
					id: 'zoneNumber',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Zone Name',
					default: '',
					id: 'zoneName',
					useVariables: true,
				},
			],
			description: `Set the zone config`,
			callback: async (action) => {
				const zoneNumber = action.options.zoneNumber as string
				await self.speaker?.setZoneConfig({ zone: parseInt(zoneNumber), name: action.options.zoneName as string })
			},
		} */

	actions['inputsActive'] = {
		name: 'Set Inputs Active',
		options: [
			{
				type: 'multidropdown',
				id: 'inputs',
				label: 'Inputs',
				default: ['AoIP01', 'AoIP02'],
				choices: [
					{ id: 'A', label: 'Analog' },
					{ id: 'AoIP01', label: 'AoIP 01' },
					{ id: 'AoIP02', label: 'AoIP 02' },
				],
			},
		],
		description: `Set the inputs active state`,
		callback: async (action) => {
			const inputs: string[] = []
			const actionInputs: string[] = action.options.inputs as string[]
			if (actionInputs.length > 0) {
				actionInputs.forEach((input) => {
					inputs.push(input)
				})
			}
			await self.speaker?.setInputs({ input: inputs })
		},
	}

	actions['power'] = {
		name: 'Set Power State',
		options: [
			{
				type: 'dropdown',
				label: 'Mode',
				choices: [
					{ id: 'toggle', label: 'Toggle' },
					{ id: 'ACTIVE', label: 'Active' },
					{ id: 'STANDBY', label: 'Standby' },
				],
				default: 'toggle',
				id: 'mode',
			},
		],
		description: `Set the power state of the speaker`,
		callback: async (action) => {
			if (action.options.mode === 'toggle') {
				await self.speaker?.setPowerState({
					state: self.speaker?.state.power?.state === 'STANDBY' ? 'ACTIVE' : 'STANDBY',
				})
			} else {
				await self.speaker?.setPowerState({ state: action.options.mode as 'STANDBY' | 'ACTIVE' })
			}
		},
	}

	actions['profileSelect'] = {
		name: 'Select Profile',
		options: [
			{
				type: 'dropdown',
				label: 'Profile',
				choices: [
					{ id: 0, label: 'Default Profile' },
					{ id: 1, label: 'Profile 1' },
					{ id: 2, label: 'Profile 2' },
					{ id: 3, label: 'Profile 3' },
					{ id: 4, label: 'Profile 4' },
					{ id: 5, label: 'Profile 5' },
				],
				default: 0,
				id: 'profile',
			},
			{
				type: 'checkbox',
				label: 'Use on Startup',
				default: false,
				id: 'startup',
			},
		],
		description: `Set the current profile for the speaker`,
		callback: async (action) => {
			await self.speaker?.setProfile({
				id: action.options.profile as number,
				startup: action.options.startup as boolean,
			})
		},
	}

	self.setActionDefinitions(actions)
}
