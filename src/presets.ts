import { GenelecSmartIPInstance } from './main.js'
import { combineRgb } from '@companion-module/base'
import { CompanionPresetDefinitions, type CompanionOptionValues } from '@companion-module/base'

export function UpdatePresets(self: GenelecSmartIPInstance): void {
	const presets: CompanionPresetDefinitions = {}

	const Color = {
		black: combineRgb(0, 0, 0),
		white: combineRgb(255, 255, 255),
		darkGray: combineRgb(36, 36, 36),
		lightGray: combineRgb(110, 110, 110),
		red: combineRgb(200, 0, 0),
		green: combineRgb(0, 200, 0),
	}

	function createAdjustmentPresets(
		baseKey: string,
		category: string,
		namePrefix: string,
		actionId: string,
		variableId: string,
		displayText: string,
		options?: {
			adjustmentValue?: string | number
			valueIcon?: string
			valueSize?: number | string
			headerName?: string
			actionOptions?: (adjustment: 'increase' | 'decrease') => CompanionOptionValues
		},
	): void {
		const headerName = options?.headerName || namePrefix
		const adjustmentValue = options?.adjustmentValue ?? '1'
		const valueSize = options?.valueSize ?? 14

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
				bgcolor: Color.lightGray,
				color: Color.white,
				text: displayText,
				size: 14,
				alignment: 'center:bottom' as const,
				png64: 'icons.circlePlus',
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
										...(adjustmentValue !== undefined && { value: adjustmentValue }),
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
				bgcolor: Color.darkGray,
				color: Color.white,
				text: `${displayText}\\n$(bolin-ptz:${variableId})`,
				size: valueSize as never,
				show_topbar: false,
				...(options?.valueIcon && { png64: options.valueIcon }),
				...(typeof valueSize === 'number' &&
					valueSize === 14 && { alignment: options?.valueIcon ? 'center:bottom' : 'center:center' }),
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
				bgcolor: Color.lightGray,
				color: Color.white,
				text: displayText,
				size: 14,
				alignment: 'center:bottom' as const,
				png64: 'icons.circleMinus',
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
										...(adjustmentValue !== undefined && { value: adjustmentValue }),
									},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	createAdjustmentPresets('volume', 'Volume', 'Volume', 'volume', 'volume', 'Volume', {
		adjustmentValue: 1,
		valueIcon: '',
		valueSize: 14,
		headerName: 'Volume Adjustment - Buttons',
	})
	presets['volumeAdjustmentRotaryHeader'] = {
		type: 'text',
		category: 'Volume',
		name: 'Volume Adjustment - Dials',
		text: 'For use on devices with rotary dials',
	}

	presets[`volumeAdjustmentRotary`] = {
		type: 'button',
		category: 'Volume',
		name: 'Volume Adjustment Rotary',
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
			color: Color.white,
			text: 'Volume Adjustment Rotary',
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
							value: 1,
						},
					},
				],
				rotate_right: [
					{
						actionId: 'volume',
						options: {
							adjustment: 'increase',
							value: 1,
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
		name: 'Volume Set - Buttons',
		text: 'Jump to a specific volume level',
	}

	for (let value = -200; value <= 0; value += 10) {
		presets[`volumeSet${value}`] = {
			type: 'button',
			category: 'Volume',
			name: `Volume Set ${value}`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.lightGray,
				color: Color.white,
				text: `Volume\\n${value}`,
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
								value: value,
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
						value: value,
					},
					style: {
						bgcolor: Color.green,
					},
				},
			],
		}
	}

	presets[`muteToggle`] = {
		type: 'button',
		category: 'Mute',
		name: `Mute Toggle`,
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
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
		feedbacks: [],
	}
	presets[`muteOn`] = {
		type: 'button',
		category: 'Mute',
		name: `Mute On`,
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
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
		feedbacks: [],
	}
	presets[`muteOff`] = {
		type: 'button',
		category: 'Mute',
		name: `Mute Off`,
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
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
		feedbacks: [],
	}

	presets[`systemInfoCPULoad`] = {
		type: 'button',
		category: 'Diagnostics',
		name: 'System Info',
		style: {
			bgcolor: Color.darkGray,
			color: Color.white,
			text: 'CPU LOAD\\n$(genelec:cpu_load)%',
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
		{ id: 'cpu_load', label: 'CPU Load', suffix: '%' },
		{ id: 'cpu_temp', label: 'CPU Temp', suffix: '°C' },
		{ id: 'network_traffic', label: 'Network Traffic', suffix: 'Kbps' },
		{ id: 'uptime', label: 'Uptime' },
		{ id: 'fw_id', label: 'Firmware ID' },
		{ id: 'build', label: 'Build' },
		{ id: 'base_id', label: 'Base ID' },
		{ id: 'hw_id', label: 'Hardware ID' },
		{ id: 'model', label: 'Model' },
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
				bgcolor: Color.lightGray,
				color: Color.white,
				text: `${info.label}\n$(genelec:${info.id})${info.suffix ? ` ${info.suffix}` : ''}`,
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
	}

	presets[`levelsInput`] = {
		type: 'button',
		category: 'Levels',
		name: 'Input',
		style: {
			bgcolor: Color.darkGray,
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
			bgcolor: Color.darkGray,
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
			bgcolor: Color.darkGray,
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

	const inputs = [
		{ id: 'Analog', label: 'Analog', inputs: ['A'] },
		{ id: 'AoIP01', label: 'AoIP 01', inputs: ['AoIP01'] },
		{ id: 'AoIP02', label: 'AoIP 02', inputs: ['AoIP02'] },
		{ id: 'AnalogAoIP1', label: 'Analog + AoIP 01', inputs: ['A', 'AoIP01'] },
		{ id: 'AnalogAoIP2', label: 'Analog + AoIP 02', inputs: ['A', 'AoIP02'] },
		{ id: 'AoIP1AoIP2', label: 'AoIP 01 + AoIP 02', inputs: ['AoIP01', 'AoIP02'] },
		{ id: 'AnalogAoIP1AoIP2', label: 'Analog + AoIP 01 + AoIP 02', inputs: ['A', 'AoIP01', 'AoIP02'] },
		{ id: 'None', label: 'Remove All Inputs', inputs: [] },
	]
	for (const input of inputs) {
		presets[`inputSelection${input.id}`] = {
			type: 'button',
			category: 'Inputs Active',
			name: `Inputs Active ${input.id}`,
			options: {
				rotaryActions: true,
			},
			style: {
				bgcolor: Color.lightGray,
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
								inputs: input.inputs,
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
						inputs: input.inputs,
					},
					style: {
						bgcolor: Color.green,
					},
				},
			],
		}
	}

	const AoIPInfo = [
		{ id: 'aoip_id', label: 'AoIP ID' },
		{ id: 'aoip_name', label: 'AoIP Name' },
		{ id: 'aoip_fname', label: 'AoIP Friendly Name' },
		{ id: 'aoip_ip', label: 'AoIP IP' },
		{ id: 'aoip_mac', label: 'AoIP MAC' },
		{ id: 'aoip_mask', label: 'AoIP Subnet' },
		{ id: 'aoip_gateway', label: 'AoIP Gateway' },
		{ id: 'aoip_locked', label: 'AoIP Locked' },
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
				bgcolor: Color.lightGray,
				color: Color.white,
				text: `${info.label}\\n$(genelec:${info.id})`,
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
	}

	const networkInfo = [
		{ id: 'hostname', label: 'Hostname' },
		{ id: 'ip_mode', label: 'IP Mode' },
		{ id: 'subnet_mask', label: 'Subnet Mask' },
		{ id: 'gateway', label: 'Gateway' },
		{ id: 'multicast_ip', label: 'Multicast IP' },
		{ id: 'multicast_port', label: 'Multicast Port' },
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
				bgcolor: Color.lightGray,
				color: Color.white,
				text: `${info.label}\\n$(genelec:${info.id})`,
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
	}

	presets[`powerToggle`] = {
		type: 'button',
		category: 'Power',
		name: `Power Toggle`,
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
			color: Color.white,
			text: `Power\nToggle`,
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
					bgcolor: Color.green,
				},
			},
		],
	}

	presets[`powerOn`] = {
		type: 'button',
		category: 'Power',
		name: `Power Toggle`,
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
			color: Color.white,
			text: `Power\nOn`,
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
					bgcolor: Color.green,
				},
			},
		],
	}

	presets[`powerStandby`] = {
		type: 'button',
		category: 'Power',
		name: `Power Toggle`,
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
			color: Color.white,
			text: `Standby Mode`,
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
					bgcolor: Color.red,
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
			bgcolor: Color.lightGray,
			color: Color.white,
			text: `Zone ID\n$(genelec:zone_id)`,
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
			bgcolor: Color.lightGray,
			color: Color.white,
			text: `Zone Name\n$(genelec:zone_name)`,
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

	presets[`clipLedToggle`] = {
		type: 'button',
		category: 'LEDs',
		name: `Clip LED Toggle`,
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
			color: Color.white,
			text: `Clip LED Toggle`,
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
		feedbacks: [],
	}

	presets[`clipLedOn`] = {
		type: 'button',
		category: 'LEDs',
		name: `LED Toggle`,
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
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
					bgcolor: Color.green,
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
			bgcolor: Color.lightGray,
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
					bgcolor: Color.green,
				},
			},
		],
	}

	presets[`rj45LedToggle`] = {
		type: 'button',
		category: 'LEDs',
		name: `RJ45 LED Toggle`,
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
			color: Color.white,
			text: `RJ45 LED Toggle`,
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
		feedbacks: [],
	}

	presets[`rj45LedOn`] = {
		type: 'button',
		category: 'LEDs',
		name: `RJ45 LED On`,
		options: {
			rotaryActions: true,
		},
		style: {
			bgcolor: Color.lightGray,
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
					bgcolor: Color.green,
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
			bgcolor: Color.lightGray,
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
					bgcolor: Color.green,
				},
			},
		],
	}

	self.setPresetDefinitions(presets)
}
