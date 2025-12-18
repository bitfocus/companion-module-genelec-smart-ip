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
		category: 'Speaker Info',
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

	presets[`systemInfoCPUTemp`] = {
		type: 'button',
		category: 'Speaker Info',
		name: 'System Info',
		style: {
			bgcolor: Color.darkGray,
			color: Color.white,
			text: 'CPU TEMP\\n$(genelec:cpu_temp)°C',
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

	presets[`systemInfoNetwork`] = {
		type: 'button',
		category: 'Speaker Info',
		name: 'System Info',
		style: {
			bgcolor: Color.darkGray,
			color: Color.white,
			text: 'NTWRK TRAFFIC\\n$(genelec:network_traffic) kbps',
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

	presets[`systemInfoUptime`] = {
		type: 'button',
		category: 'Speaker Info',
		name: 'System Info',
		style: {
			bgcolor: Color.darkGray,
			color: Color.white,
			text: 'UPTIME\\n$(genelec:uptime)',
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

	self.setPresetDefinitions(presets)
}
