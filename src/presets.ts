import { GenelecSmartIPInstance } from './main.js'
import { Color } from './utils.js'
import { CompanionPresetDefinitions, type CompanionOptionValues } from '@companion-module/base'

export function UpdatePresets(self: GenelecSmartIPInstance): void {
	const presets: CompanionPresetDefinitions = {}
	const isMulticastMode = self.config.mode === 'multicast'

	function createAdjustmentPresets(
		baseKey: string,
		category: string,
		namePrefix: string,
		actionId: string,
		variableId: string,
		displayText: string,
		options?: {
			adjustmentValue?: string | number
			valueSize?: number | string
			headerName?: string
			actionOptions?: (adjustment: 'increase' | 'decrease') => CompanionOptionValues
		},
	): void {
		const headerName = options?.headerName || namePrefix
		const adjustmentValue = options?.adjustmentValue?.toString() ?? '1'
		const valueSize = options?.valueSize ?? '14'

		// Header
		presets[`${baseKey}Header`] = {
			category,
			name: headerName,
			type: 'text',
			text: '',
		}

		// Increase
		presets[`${baseKey}Increase`] = {
			type: 'button',
			category,
			name: `${namePrefix} Increase`,

			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: '+',
				size: 'auto',
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId,
							options: options?.actionOptions
								? options.actionOptions('increase')
								: {
										adjustment: 'increase',
										...(adjustmentValue !== undefined && { value: adjustmentValue.toString() }),
									},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		// Value Display
		presets[`${baseKey}Value`] = {
			type: 'button',
			category,
			name: `${namePrefix} Value`,
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `${displayText}\\n$(genelec:${variableId})`,
				size: valueSize as never,
				show_topbar: false,
				...(typeof valueSize === 'number' && valueSize === 14 && { alignment: 'center:center' }),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		// Decrease
		presets[`${baseKey}Decrease`] = {
			type: 'button',
			category,
			name: `${namePrefix} Decrease`,
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: '-',
				size: 'auto',
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId,
							options: options?.actionOptions
								? options.actionOptions('decrease')
								: {
										adjustment: 'decrease',
										...(adjustmentValue !== undefined && { value: adjustmentValue.toString() }),
									},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	if (!isMulticastMode) {
		createAdjustmentPresets('volume', 'Volume', 'Volume', 'volume', 'volume', 'Volume', {
			adjustmentValue: 1,
			valueSize: 14,
			headerName: 'Volume Adjustment - Buttons',
		})

		presets['volumeAdjustmentRotaryHeader'] = {
			type: 'text',
			category: 'Volume',
			name: 'Volume Adjustment - Dial',
			text: '(For use on devices with rotary dials)',
		}

		presets[`volumeAdjustmentRotary`] = {
			type: 'button',
			category: 'Volume',
			name: 'Volume Dial',
			options: {
				rotaryActions: true,
			},
			previewStyle: {
				text: 'Volume Dial',
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: 'Volume\\n$(genelec:volume) dB',
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [],
					up: [],
					rotate_left: [
						{
							actionId: 'volume',
							options: {
								adjustment: 'decrease',
								value: '1',
							},
						},
					],
					rotate_right: [
						{
							actionId: 'volume',
							options: {
								adjustment: 'increase',
								value: '1',
							},
						},
					],
				},
			],
			feedbacks: [],
		}

		presets[`volumeSetButtons`] = {
			type: 'text',
			category: 'Volume',
			name: 'Volume Set Values',
			text: '(Jump to a specific volume level)',
		}

		for (let value = 0; value >= -200; value -= 10) {
			presets[`volumeSet${value}`] = {
				type: 'button',
				category: 'Volume',
				name: `Volume Set ${value}`,
				options: {
					rotaryActions: true,
				},
				style: {
					bgcolor: Color.genelecDarkGray,
					color: Color.white,
					text: `SET Volume\\n\\n${value} dB`,
					size: 14,
					show_topbar: false,
				},
				steps: [
					{
						down: [
							{
								actionId: 'volume',
								options: {
									adjustment: 'set',
									value: value.toString(),
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'volume',
						options: {
							comparison: 'equal',
							value: value.toString(),
						},
						style: {
							bgcolor: Color.genelecGreen,
						},
					},
				],
			}
		}

		presets[`muteStatus`] = {
			type: 'button',
			category: 'Mute',
			name: `Mute Status`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `MUTE STATUS $(genelec:mute)`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'mute',
							options: {
								mode: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'mute',
					options: {},
					style: {
						bgcolor: Color.red,
					},
				},
				{
					feedbackId: 'mute',
					isInverted: true,
					options: {},
					style: {
						bgcolor: Color.genelecDarkGray,
					},
				},
			],
		}
		presets[`muteToggle`] = {
			type: 'button',
			category: 'Mute',
			name: `Mute Toggle`,
			previewStyle: {
				text: 'MUTE TOGGLE',
			},
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `Mute\\nToggle`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'mute',
							options: {
								mode: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'mute',
					options: {},
					style: {
						text: 'UNMUTE',
					},
				},
				{
					feedbackId: 'mute',
					isInverted: true,
					options: {},
					style: {
						text: 'MUTE',
					},
				},
			],
		}
		presets[`muteOn`] = {
			type: 'button',
			category: 'Mute',
			name: `Mute On`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `MUTE`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'mute',
							options: {
								mode: 'true',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'mute',
					options: {},
					style: {
						bgcolor: Color.red,
					},
				},
			],
		}
		presets[`muteOff`] = {
			type: 'button',
			category: 'Mute',
			name: `Mute Off`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `UNMUTE`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'mute',
							options: {
								mode: 'false',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'mute',
					isInverted: true,
					options: {},
					style: {
						bgcolor: Color.genelecDarkGray,
					},
				},
			],
		}

		presets[`levelsInput`] = {
			type: 'button',
			category: 'Levels',
			name: 'Input',
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: 'INPUT\\n$(genelec:input_level)',
				size: 13,
				show_topbar: false,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`levelsBass`] = {
			type: 'button',
			category: 'Levels',
			name: 'Bass',
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: 'BASS\\n$(genelec:bass_level)',
				size: 13,
				show_topbar: false,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`levelsTweeter`] = {
			type: 'button',
			category: 'Levels',
			name: 'Tweeter',
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: 'TWEETER\\n$(genelec:tweeter_level)',
				size: 13,
				show_topbar: false,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}
		presets[`inputsStatusHeader`] = {
			type: 'text',
			category: 'Inputs',
			name: 'Input Status',
			text: '',
		}
		presets[`inputsActive`] = {
			type: 'button',
			category: 'Inputs',
			name: `Inputs Active`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `INPUTS\n$(genelec:active_inputs)`,
				size: 12,
				show_topbar: false,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`inputsSelectorHeader`] = {
			type: 'text',
			category: 'Inputs',
			name: 'Select Inputs',
			text: '',
		}
		const inputOptions = [
			{ id: 'Analog', label: 'Analog', activeInputs: ['A'] },
			{ id: 'AoIP01', label: 'AoIP 01', activeInputs: ['AoIP01'] },
			{ id: 'AoIP02', label: 'AoIP 02', activeInputs: ['AoIP02'] },
			{ id: 'AnalogAoIP1', label: 'Analog + AoIP 01', activeInputs: ['A', 'AoIP01'] },
			{ id: 'AnalogAoIP2', label: 'Analog + AoIP 02', activeInputs: ['A', 'AoIP02'] },
			{ id: 'AoIP1AoIP2', label: 'AoIP 01 + AoIP 02', activeInputs: ['AoIP01', 'AoIP02'] },
			{ id: 'AnalogAoIP1AoIP2', label: 'Analog + AoIP 01 + AoIP 02', activeInputs: ['A', 'AoIP01', 'AoIP02'] },
			{ id: 'None', label: 'Remove All Inputs', activeInputs: [] },
		]
		for (const input of inputOptions) {
			presets[`inputSelection${input.id}`] = {
				type: 'button',
				category: 'Inputs',
				name: `Inputs ${input.id}`,
				options: {
					rotaryActions: true,
				},
				style: {
					bgcolor: Color.genelecDarkGray,
					color: Color.white,
					text: `${input.label}`,
					size: 14,
					show_topbar: false,
				},
				steps: [
					{
						down: [
							{
								actionId: 'inputsActive',
								options: {
									inputs: input.activeInputs,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'inputsActive',
						options: {
							inputs: input.activeInputs,
						},
						style: {
							bgcolor: Color.genelecGreen,
						},
					},
				],
			}
		}

		presets['profileCurrentHeader'] = {
			type: 'text',
			category: 'Profiles',
			name: 'Profile Status',
			text: '',
		}

		presets[`profileCurrent`] = {
			type: 'button',
			category: 'Profiles',
			name: `Profile Current`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `CURRENT PROFILE\\n$(genelec:profile_selected)`,
				size: 12,
				show_topbar: false,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets['profileSelectHeader'] = {
			type: 'text',
			category: 'Profiles',
			name: 'Select Profile',
			text: '',
		}

		for (let value = 0; value <= 5; value += 1) {
			presets[`profileSelect${value}`] = {
				type: 'button',
				category: 'Profiles',
				name: `Profile Select ${value}`,
				options: {
					rotaryActions: true,
				},
				style: {
					bgcolor: Color.genelecDarkGray,
					color: Color.white,
					text: `SELECT Profile\\n${value === 0 ? 'Default' : value}`,
					size: 14,
					show_topbar: false,
				},
				steps: [
					{
						down: [
							{
								actionId: 'profileSelect',
								options: {
									profile: value,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'profileSelected',
						options: {
							profile: value,
						},
						style: {
							bgcolor: Color.genelecGreen,
						},
					},
				],
			}
		}

		presets[`powerStatus`] = {
			type: 'button',
			category: 'Power',
			name: `Power Status`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `POWER STATUS\n$(genelec:power_state)`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'power',
							options: {
								mode: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'power',
					options: {
						mode: 'ACTIVE',
					},
					style: {
						bgcolor: Color.genelecGreen,
					},
				},
				{
					feedbackId: 'power',
					isInverted: true,
					options: {
						mode: 'ACTIVE',
					},
					style: {
						bgcolor: Color.orange,
					},
				},
			],
		}

		presets[`powerToggle`] = {
			type: 'button',
			category: 'Power',
			name: `Wake Speaker`,
			previewStyle: {
				text: 'STANDBY TOGGLE',
			},
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `Wake`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'power',
							options: {
								mode: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'power',
					options: {
						mode: 'ACTIVE',
					},
					style: {
						text: 'STANDBY',
					},
				},
				{
					feedbackId: 'power',
					isInverted: true,
					options: {
						mode: 'ACTIVE',
					},
					style: {
						text: 'WAKE',
					},
				},
			],
		}

		presets[`powerOn`] = {
			type: 'button',
			category: 'Power',
			name: `Wake Speaker`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `WAKE`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'power',
							options: {
								mode: 'ACTIVE',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'power',
					options: {
						mode: 'ACTIVE',
					},
					style: {
						bgcolor: Color.genelecGreen,
					},
				},
			],
		}

		presets[`powerStandby`] = {
			type: 'button',
			category: 'Power',
			name: `Speaker Standby`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `STANDBY`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'power',
							options: {
								mode: 'STANDBY',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'power',
					isInverted: true,
					options: {
						mode: 'STANDBY',
					},
					style: {
						bgcolor: Color.orange,
					},
				},
			],
		}

		presets[`zoneId`] = {
			type: 'button',
			category: 'Zone Info',
			name: `Zone Info`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `ZONE ID\n$(genelec:zone_id)`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`zoneName`] = {
			type: 'button',
			category: 'Zone Info',
			name: `Zone Info`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `ZONE NAME\n$(genelec:zone_name)`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		const diagnostics = [
			{ id: 'cpu_load', label: 'CPU LOAD', suffix: '%' },
			{ id: 'cpu_temp', label: 'CPU TEMP', suffix: '°C' },
			{ id: 'network_traffic', label: 'NETWORK TRAFFIC', suffix: 'Kbps' },
			{ id: 'uptime', label: 'UPTIME' },
			/* { id: 'fw_id', label: 'FIRMWARE' },
			{ id: 'build', label: 'BUILD' },
			{ id: 'base_id', label: 'BASE ID' }, */
			{ id: 'model', label: 'MODEL' },
		]
		for (const info of diagnostics) {
			presets[`systemInfo${info.id}`] = {
				type: 'button',
				category: 'Diagnostics',
				name: `${info.label}`,
				options: {
					rotaryActions: true,
				},
				style: {
					bgcolor: Color.genelecDarkGray,
					color: Color.white,
					text: `${info.label}\n$(genelec:${info.id})${info.suffix ? ` ${info.suffix}` : ''}`,
					size: 12,
					show_topbar: false,
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [],
			}
		}

		const AoIPInfo = [
			{ id: 'aoip_id', label: 'AoIP ID' },
			{ id: 'aoip_name', label: 'AoIP NAME' },
			{ id: 'aoip_fname', label: 'AoIP FRIENDLY NAME' },
			{ id: 'aoip_ip', label: 'AoIP IP' },
			{ id: 'aoip_mac', label: 'AoIP MAC' },
			{ id: 'aoip_mask', label: 'AoIP SUBNET' },
			{ id: 'aoip_gateway', label: 'AoIP GATEWAY' },
			{ id: 'aoip_locked', label: 'AoIP LOCK STATUS' },
		]
		for (const info of AoIPInfo) {
			presets[`aoipInfo${info.id}`] = {
				type: 'button',
				category: 'AoIP Info',
				name: `${info.label}`,
				options: {
					rotaryActions: true,
				},
				style: {
					bgcolor: Color.genelecDarkGray,
					color: Color.white,
					text: `${info.label}\\n$(genelec:${info.id})`,
					size: 12,
					show_topbar: false,
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [],
			}
		}

		const networkInfo = [
			{ id: 'hostname', label: 'HOSTNAME' },
			{ id: 'ip_mode', label: 'IP MODE' },
			{ id: 'subnet_mask', label: 'SUBNET MASK' },
			{ id: 'gateway', label: 'GATEWAY' },
			{ id: 'multicast_ip', label: 'MULTICAST IP' },
			{ id: 'multicast_port', label: 'MULTICAST PORT' },
		]
		for (const info of networkInfo) {
			presets[`networkInfo${info.id}`] = {
				type: 'button',
				category: 'Network Info',
				name: `${info.label}`,
				options: {
					rotaryActions: true,
				},
				style: {
					bgcolor: Color.genelecDarkGray,
					color: Color.white,
					text: `${info.label}\\n$(genelec:${info.id})`,
					size: 12,
					show_topbar: false,
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [],
			}
		}

		presets['blinkHeader'] = {
			type: 'text',
			category: 'LEDs',
			name: 'Blink LED',
			text: '',
		}
		presets[`blinkLED`] = {
			type: 'button',
			category: 'LEDs',
			name: `Blink LED`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `Blink LED Toggle`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'blinkLed',
							options: {
								blink: true,
							},
						},
					],
					up: [],
				},
				{
					down: [
						{
							actionId: 'blinkLed',
							options: {
								blink: false,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
		presets[`blinkLEDOn`] = {
			type: 'button',
			category: 'LEDs',
			name: `Blink LED`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `Blink LED On`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'blinkLed',
							options: {
								blink: true,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
		presets[`blinkLEDOff`] = {
			type: 'button',
			category: 'LEDs',
			name: `Blink LED`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `Blink LED Off`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'blinkLed',
							options: {
								blink: false,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
		presets['clipLedHeader'] = {
			type: 'text',
			category: 'LEDs',
			name: 'Clip LED',
			text: '',
		}
		presets[`clipLedToggle`] = {
			type: 'button',
			category: 'LEDs',
			name: `Clip LED Toggle`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `CLIP LED STATUS $(genelec:clip_led)`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'clipLed',
							options: {
								mode: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'clipLed',
					options: {},
					style: {
						bgcolor: Color.genelecGreen,
					},
				},
				{
					feedbackId: 'clipLed',
					isInverted: true,
					options: {},
					style: {
						bgcolor: Color.red,
					},
				},
			],
		}

		presets[`clipLedOn`] = {
			type: 'button',
			category: 'LEDs',
			name: `LED Toggle`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `Clip LED On`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'clipLed',
							options: {
								mode: 'true',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'clipLed',
					options: {},
					style: {
						bgcolor: Color.genelecGreen,
					},
				},
			],
		}

		presets[`clipLedOff`] = {
			type: 'button',
			category: 'LEDs',
			name: `LED Toggle`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `Clip LED Off`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'clipLed',
							options: {
								mode: 'false',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'clipLed',
					isInverted: true,
					options: {},
					style: {
						bgcolor: Color.genelecGreen,
					},
				},
			],
		}
		presets['rj45LedHeader'] = {
			type: 'text',
			category: 'LEDs',
			name: 'RJ45 LED',
			text: '',
		}

		presets[`rj45LedToggle`] = {
			type: 'button',
			category: 'LEDs',
			name: `RJ45 LED Toggle`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `RJ45 LED STATUS $(genelec:rj45_leds)`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'rj45Led',
							options: {
								mode: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'rj45Led',
					options: {},
					style: {
						bgcolor: Color.genelecGreen,
					},
				},
				{
					feedbackId: 'rj45Led',
					isInverted: true,
					options: {},
					style: {
						bgcolor: Color.red,
					},
				},
			],
		}

		presets[`rj45LedOn`] = {
			type: 'button',
			category: 'LEDs',
			name: `RJ45 LED On`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `RJ45 LED On`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'rj45Led',
							options: {
								mode: 'true',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'rj45Led',
					options: {},
					style: {
						bgcolor: Color.genelecGreen,
					},
				},
			],
		}

		presets[`rj45LedOff`] = {
			type: 'button',
			category: 'LEDs',
			name: `RJ45 LED Off`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `RJ45 LED Off`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'rj45Led',
							options: {
								mode: 'false',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'rj45Led',
					isInverted: true,
					options: {},
					style: {
						bgcolor: Color.genelecGreen,
					},
				},
			],
		}

		createAdjustmentPresets('sleepDelay', 'Sleep', 'Sleep Delay', 'sleepDelay', 'sleep_delay', 'Sleep Delay', {
			adjustmentValue: 1,
			valueSize: 14,
			headerName: 'Sleep Delay Adjustment - Buttons',
		})

		createAdjustmentPresets(
			'sleepThreshold',
			'Sleep',
			'Sleep Threshold',
			'sleepThreshold',
			'sleep_threshold',
			'Sleep Threshold',
			{
				adjustmentValue: 1,
				valueSize: 14,
				headerName: 'Sleep Threshold Adjustment - Buttons',
			},
		)

		createAdjustmentPresets(
			'sleepLedIntensity',
			'Sleep',
			'Sleep LED Intensity',
			'sleepLedIntensity',
			'sleep_led_intensity',
			'Sleep LED Intensity',
			{
				adjustmentValue: 1,
				valueSize: 14,
				headerName: 'Sleep LED Intensity Adjustment',
			},
		)
	}

	// Multicast Control Presets
	if (isMulticastMode) {
		createAdjustmentPresets(
			'zoneVolume',
			'Multicast Zone Control',
			'Zone Volume',
			'zoneVolume',
			'zone_volume',
			'Zone Vol',
			{
				adjustmentValue: 1,
				valueSize: 14,
				headerName: 'Multicast Zone - Volume',
			},
		)

		presets['zoneVolumeAdjustmentRotaryHeader'] = {
			type: 'text',
			category: 'Multicast Zone Control',
			name: 'Zone Volume Adjustment - Dials',
			text: '(For use on devices with rotary dials)',
		}

		presets[`zoneVolumeAdjustmentRotary`] = {
			type: 'button',
			category: 'Multicast Zone Control',
			name: 'Zone Volume Dial',
			options: {
				rotaryActions: true,
			},
			previewStyle: {
				text: 'Zone Volume Dial',
			},
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: 'Zone Volume\\n$(genelec:zone_volume) dB',
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [],
					up: [],
					rotate_left: [
						{
							actionId: 'zoneVolume',
							options: {
								adjustment: 'decrease',
								value: '1',
							},
						},
					],
					rotate_right: [
						{
							actionId: 'zoneVolume',
							options: {
								adjustment: 'increase',
								value: '1',
							},
						},
					],
				},
			],
			feedbacks: [],
		}

		presets[`zoneVolumeSetButtons`] = {
			type: 'text',
			category: 'Multicast Zone Control',
			name: 'Zone Volume Set Values',
			text: '(Jump to a specific volume level)',
		}

		for (let value = 0; value >= -130; value -= 10) {
			presets[`zoneVolumeSet${value}`] = {
				type: 'button',
				category: 'Multicast Zone Control',
				name: `Zone Volume Set ${value}`,
				options: {
					rotaryActions: true,
				},
				style: {
					bgcolor: Color.genelecDarkGray,
					color: Color.white,
					text: `SET Zone Vol\n\n${value} dB`,
					size: 14,
					show_topbar: false,
				},
				steps: [
					{
						down: [
							{
								actionId: 'zoneVolume',
								options: {
									adjustment: 'set',
									value: value.toString(),
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'zoneVolume',
						options: {
							comparison: 'equal',
							value: value.toString(),
						},
						style: {
							bgcolor: Color.genelecGreen,
						},
					},
				],
			}
		}

		presets['zoneMuteHeader'] = {
			type: 'text',
			category: 'Multicast Zone Control',
			name: 'Multicast Zone - Mute',
			text: '',
		}

		presets[`zoneMuteStatus`] = {
			type: 'button',
			category: 'Multicast Zone Control',
			name: `Multicast Zone - Mute Toggle`,
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `ZONE MUTE\n$(genelec:zone_mute)`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'zoneMute',
							options: {
								mode: 'toggle',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'zoneMute',
					options: {},
					style: {
						bgcolor: Color.red,
					},
				},
				{
					feedbackId: 'zoneMute',
					isInverted: true,
					options: {},
					style: {
						bgcolor: Color.genelecDarkGray,
					},
				},
			],
		}

		presets[`zoneMuteOn`] = {
			type: 'button',
			category: 'Multicast Zone Control',
			name: `Zone Mute On`,
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `ZONE MUTE`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'zoneMute',
							options: {
								mode: 'true',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'zoneMute',
					options: {},
					style: {
						bgcolor: Color.red,
					},
				},
			],
		}

		presets[`zoneMuteOff`] = {
			type: 'button',
			category: 'Multicast Zone Control',
			name: `Zone Unmute`,
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `ZONE UNMUTE`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'zoneMute',
							options: {
								mode: 'false',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'zoneMute',
					isInverted: true,
					options: {},
					style: {
						bgcolor: Color.genelecDarkGray,
					},
				},
			],
		}

		presets['zonePowerHeader'] = {
			type: 'text',
			category: 'Multicast Zone Control',
			name: 'Multicast Zone - Power',
			text: '',
		}

		presets[`zonePowerWake`] = {
			type: 'button',
			category: 'Multicast Zone Control',
			name: `Zone Wake`,
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `ZONE WAKE`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'zonePower',
							options: {
								mode: 'BOOT',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'zonePower',
					options: {},
					style: {
						bgcolor: Color.genelecGreen,
					},
				},
			],
		}

		presets[`zonePowerStandby`] = {
			type: 'button',
			category: 'Multicast Zone Control',
			name: `Zone Standby`,
			style: {
				bgcolor: Color.genelecDarkGray,
				color: Color.white,
				text: `ZONE STANDBY`,
				size: 14,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'zonePower',
							options: {
								mode: 'STANDBY',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'zonePower',
					isInverted: true,
					options: {},
					style: {
						bgcolor: Color.orange,
					},
				},
			],
		}

		presets['zoneProfileHeader'] = {
			type: 'text',
			category: 'Multicast Zone Control',
			name: 'Multicast Zone - Profile Select',
			text: '',
		}

		for (let value = 0; value <= 5; value += 1) {
			presets[`zoneProfileSelect${value}`] = {
				type: 'button',
				category: 'Multicast Zone Control',
				name: `Zone Profile ${value}`,
				style: {
					bgcolor: Color.genelecDarkGray,
					color: Color.white,
					text: `ZONE Profile\n${value === 0 ? 'Default' : value}`,
					size: 14,
					show_topbar: false,
				},
				steps: [
					{
						down: [
							{
								actionId: 'zoneProfile',
								options: {
									profile: value,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'zoneProfile',
						options: {
							profile: value,
						},
						style: {
							bgcolor: Color.genelecGreen,
						},
					},
				],
			}
		}
	}

	self.setPresetDefinitions(presets)
}
