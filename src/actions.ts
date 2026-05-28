import type { CompanionActionDefinitions } from '@companion-module/base'
import type { GenelecSmartIPInstance } from './main.js'
import { LEDResponse } from './types.js'

export function UpdateActions(self: GenelecSmartIPInstance): void {
	const actions: CompanionActionDefinitions = {}
	const isMulticastMode = self.config.mode === 'multicast'

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
			description: description ?? `Set the ${name.toLowerCase()} of the speaker`,
			callback: async (action) => {
				const currentValue = getCurrentValue() ?? false
				let newValue: boolean
				if (action.options.mode === 'toggle') {
					newValue = !currentValue
				} else {
					newValue = action.options.mode === 'true'
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
		_defaultValue: number = 0,
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
			description: description ?? `Set or adjust the ${name.toLowerCase()} of the speaker`,
			callback: async (action) => {
				const currentValue = getCurrentValue()
				if (currentValue === undefined) return
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

	if (!isMulticastMode) {
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

		createValueAction(
			'sleepLedIntensity',
			'Sleep LED Intensity',
			() => self.speaker?.state.deviceISS?.ledIntensity,
			async (value) => self.speaker?.setDeviceISS({ ledIntensity: value }),
			50,
			5,
			0,
			100,
		)

		createValueAction(
			'sleepDelay',
			'Sleep Delay',
			() => self.speaker?.state.deviceISS?.sleepDelay,
			async (value) => self.speaker?.setDeviceISS({ sleepDelay: value }),
			0,
			5,
			0,
			100,
		)

		createValueAction(
			'sleepThreshold',
			'Sleep Threshold',
			() => self.speaker?.state.deviceISS?.threshold,
			async (value) => self.speaker?.setDeviceISS({ threshold: value }),
			-70,
			5,
			-130,
			0,
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
			description: `Set the visibility of the clip LED`,
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
			description: `Identify the speaker by blinking its LED`,
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

		actions['zoneConfig'] = {
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
			description: `Set the zone for the speaker. Warning: this will reboot the device`,
			callback: async (action) => {
				const zoneNumber = action.options.zoneNumber as string
				await self.speaker?.setZoneConfig({ zone: parseInt(zoneNumber), name: action.options.zoneName as string })
			},
		}

		actions['inputsActive'] = {
			name: 'Set Active Inputs',
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
			description: `Set the currently active inputs of the speaker`,
			callback: async (action) => {
				await self.speaker?.setInputs({ input: action.options.inputs as string[] })
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
			description: `Set the current profile of the speaker. If "Use on Startup" is enabled, the profile will be set on startup.`,
			callback: async (action) => {
				await self.speaker?.setProfile({
					id: action.options.profile as number,
					startup: action.options.startup as boolean,
				})
			},
		}
	}

	if (isMulticastMode) {
		// Zone Multicast Actions
		actions['zoneVolume'] = {
			name: 'Zone Volume',
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
					default: '5',
					id: 'value',
					useVariables: true,
				},
			],
			description: `Set or adjust the volume for all speakers in a multicast zone`,
			callback: async (action) => {
				if (!self.multicast) {
					self.log('warn', 'Multicast not configured')
					return
				}
				const currentValue = self.multicastState.level ?? self.speaker?.state.audioVolume?.level ?? -30
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

				newValue = Math.max(-130, Math.min(0, newValue))
				self.multicastState.level = newValue
				self.multicast.sendVolume(newValue)
				self.checkFeedbacks('zoneVolume')
				self.updateVariableValues()
			},
		}

		actions['zoneMute'] = {
			name: 'Zone Mute',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					choices: toggleChoices,
					default: 'toggle',
					id: 'mode',
				},
			],
			description: `Set the mute state for all speakers in a multicast zone`,
			callback: async (action) => {
				if (!self.multicast) {
					self.log('warn', 'Multicast not configured')
					return
				}
				const currentValue = self.multicastState.mute ?? self.speaker?.state.audioVolume?.mute ?? false
				let newValue: boolean
				if (action.options.mode === 'toggle') {
					newValue = !currentValue
				} else {
					newValue = action.options.mode === 'true'
				}
				self.multicastState.mute = newValue
				self.multicast.sendMute(newValue)
				self.updateVariableValues()
				self.checkFeedbacks('zoneMute')
			},
		}

		actions['zoneProfile'] = {
			name: 'Zone Profile Select',
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
			],
			description: `Set the current profile for all speakers in a multicast zone`,
			callback: async (action) => {
				if (!self.multicast) {
					self.log('warn', 'Multicast not configured')
					return
				}
				const profile = action.options.profile as number
				self.multicastState.profile = profile
				self.multicast.sendProfile(profile)
				self.updateVariableValues()
				self.checkFeedbacks('zoneProfile')
			},
		}

		actions['zonePower'] = {
			name: 'Zone Power',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					choices: [
						{ id: 'BOOT', label: 'Wake' },
						{ id: 'STANDBY', label: 'Standby' },
					],
					default: 'BOOT',
					id: 'mode',
				},
			],
			description: `Set the power state for all speakers in a multicast zone`,
			callback: async (action) => {
				if (!self.multicast) {
					self.log('warn', 'Multicast not configured')
					return
				}
				const state = action.options.mode as 'BOOT' | 'STANDBY'
				self.multicastState.power = state
				self.multicast.sendPower(state)
				self.updateVariableValues()
				self.checkFeedbacks('zonePower')
			},
		}
	}
	self.setActionDefinitions(actions)
}
