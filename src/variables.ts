import type { CompanionVariableDefinition } from '@companion-module/base'
import type { GenelecSmartIPInstance } from './main.js'

export function UpdateVariableDefinitions(self: GenelecSmartIPInstance): void {
	const variables: CompanionVariableDefinition[] = []
	const isMulticastMode = self.config.mode === 'multicast'

	if (!isMulticastMode) {
		variables.push(
			// Device Info
			{ variableId: 'fw_id', name: 'Firmware ID' },
			{ variableId: 'build', name: 'Build Version' },
			{ variableId: 'base_id', name: 'Base ID' },
			//{ variableId: 'hw_id', name: 'Hardware ID' },
			{ variableId: 'model', name: 'Model' },
			{ variableId: 'category', name: 'Category' },
			//{ variableId: 'technology', name: 'Technology' },
			//{ variableId: 'upgrade_id', name: 'Upgrade ID' },
			{ variableId: 'api_ver', name: 'API Version' },

			// Power
			{ variableId: 'power_state', name: 'Power State' },
			{ variableId: 'poe_allocated_pwr', name: 'PoE Allocated Power (W)' },
			{ variableId: 'poe_pd_limit', name: 'PoE PD Limit Status' },

			// Network
			{ variableId: 'hostname', name: 'Hostname' },
			{ variableId: 'ip_mode', name: 'IP Mode' },
			{ variableId: 'ip_address', name: 'IP Address' },
			{ variableId: 'subnet_mask', name: 'Subnet Mask' },
			{ variableId: 'gateway', name: 'Network Gateway' },
			{ variableId: 'multicast_ip', name: 'Multicast Control IP' },
			{ variableId: 'multicast_port', name: 'Multicast Control Port' },

			// Audio
			{ variableId: 'volume', name: 'Volume (dB)' },
			{ variableId: 'mute', name: 'Mute State' },
			{ variableId: 'active_inputs', name: 'Active Inputs' },

			//Audio Settings
			{ variableId: 'audio_delay', name: 'Audio Delay' },
			{ variableId: 'audio_sensitivity', name: 'Audio Sensitivity' },

			// AoIP
			{ variableId: 'aoip_id', name: 'AoIP ID' },
			{ variableId: 'aoip_name', name: 'AoIP Name' },
			{ variableId: 'aoip_fname', name: 'AoIP Friendly Name' },
			{ variableId: 'aoip_mac', name: 'AoIP MAC Address' },
			{ variableId: 'aoip_locked', name: 'AoIP Locked' },
			{ variableId: 'aoip_ip', name: 'AoIP IP Address' },
			{ variableId: 'aoip_mask', name: 'AoIP Subnet Mask' },
			{ variableId: 'aoip_gateway', name: 'AoIP Gateway' },

			// Zone
			{ variableId: 'zone_id', name: 'Zone ID' },
			{ variableId: 'zone_name', name: 'Zone Name' },

			// Profiles
			{ variableId: 'profile_selected', name: 'Selected Profile Number' },
			{ variableId: 'profile_startup', name: 'Startup Profile Number' },

			// Events / Status
			{ variableId: 'bass_level', name: 'Bass Output Level (dBFS)' },
			{ variableId: 'tweeter_level', name: 'Tweeter Output Level (dBFS)' },
			{ variableId: 'input_level', name: 'Input Level (dBFS)' },
			{ variableId: 'cpu_temp', name: 'CPU Temperature (°C)' },
			{ variableId: 'cpu_load', name: 'CPU Load (%)' },
			{ variableId: 'network_traffic', name: 'Network Traffic to CPU (kbps)' },
			{ variableId: 'uptime', name: 'Uptime' },

			// LEDs
			{ variableId: 'led_intensity', name: 'LED Intensity (%)' },
			{ variableId: 'rj45_leds', name: 'RJ45 LEDs' },
			{ variableId: 'clip_led', name: 'Clip LED (applicable to subwoofer only)' },

			//Device ISS
			{ variableId: 'sleep_delay', name: 'Sleep Delay (seconds)' },
			{ variableId: 'sleep_threshold', name: 'Sleep Threshold (dB)' },
			{ variableId: 'sleep_led_intensity', name: 'Sleep LED Intensity (%)' },
		)
	} else {
		// Multicast Zone
		variables.push(
			{ variableId: 'zone_mcast_ip', name: 'Multicast Zone - IP' },
			{ variableId: 'zone_mcast_port', name: 'Multicast Zone - Port' },
			{ variableId: 'zone_volume', name: 'Multicast Zone - Volume (dB)' },
			{ variableId: 'zone_mute', name: 'Multicast Zone - Mute State' },
			{ variableId: 'zone_profile', name: 'Multicast Zone - Profile' },
			{ variableId: 'zone_power', name: 'Multicast Zone - Zone Power State' },
		)
	}
	self.setVariableDefinitions(variables)
}

export function UpdateVariableValues(self: GenelecSmartIPInstance): void {
	const isMulticastMode = self.config.mode === 'multicast'

	const newVariables: Record<string, string | number | boolean | undefined> = {}

	if (self.speaker) {
		const state = self.speaker.state
		const previousState = self.previousState

		// Device Info
		if (state.deviceInfo) {
			const newInfo = state.deviceInfo
			const oldInfo = previousState.deviceInfo

			if (newInfo.fwId !== oldInfo?.fwId) {
				newVariables.fw_id = newInfo.fwId
			}
			if (newInfo.build !== oldInfo?.build) {
				newVariables.build = newInfo.build
			}
			if (newInfo.baseId !== oldInfo?.baseId) {
				newVariables.base_id = newInfo.baseId
			}
			/* if (newInfo.hwId !== oldInfo?.hwId) {
				newVariables.hw_id = newInfo.hwId
			} */
			if (newInfo.model !== oldInfo?.model) {
				newVariables.model = newInfo.model
			}
			if (newInfo.category !== oldInfo?.category) {
				newVariables.category = newInfo.category
			}
			/* if (newInfo.technology !== oldInfo?.technology) {
				newVariables.technology = newInfo.technology
			}
			if (newInfo.upgradeId !== oldInfo?.upgradeId) {
				newVariables.upgrade_id = newInfo.upgradeId
			}
			*/
			if (newInfo.apiVer !== oldInfo?.apiVer) {
				newVariables.api_ver = newInfo.apiVer
			}

			previousState.deviceInfo = { ...newInfo }
		}

		// Power
		if (state.power) {
			const newPwr = state.power
			const oldPwr = previousState.power

			if (newPwr.state !== oldPwr?.state) {
				newVariables.power_state = newPwr.state
					? newPwr.state.charAt(0).toUpperCase() + newPwr.state.slice(1).toLowerCase()
					: undefined
			}
			if (newPwr.poeAllocatedPwr !== oldPwr?.poeAllocatedPwr) {
				newVariables.poe_allocated_pwr = newPwr.poeAllocatedPwr
			}
			if (newPwr.poePd15W !== oldPwr?.poePd15W) {
				newVariables.poe_pd_limit = newPwr.poePd15W ? 'Limited to 15W' : 'Not Limited'
			}

			previousState.power = { ...newPwr }
		}

		// Network
		if (state.network) {
			const newNet = state.network
			const oldNet = previousState.network

			if (newNet.hostname !== oldNet?.hostname) {
				newVariables.hostname = newNet.hostname
			}
			if (newNet.mode !== oldNet?.mode) {
				newVariables.ip_mode = newNet.mode === 'auto' ? 'DHCP' : 'Static'
			}
			if (newNet.ip !== oldNet?.ip) {
				newVariables.ip_address = newNet.ip
			}
			if (newNet.mask !== oldNet?.mask) {
				newVariables.subnet_mask = newNet.mask
			}
			if (newNet.gw !== oldNet?.gw) {
				newVariables.gateway = newNet.gw
			}
			if (newNet.volIp !== oldNet?.volIp) {
				newVariables.multicast_ip = newNet.volIp
			}
			if (newNet.volPort !== oldNet?.volPort) {
				newVariables.multicast_port = newNet.volPort
			}

			previousState.network = { ...newNet }
		}

		// Audio
		if (state.audioVolume) {
			const newVol = state.audioVolume
			const oldVol = previousState.audioVolume

			if (newVol.level !== oldVol?.level) {
				newVariables.volume = newVol.level != undefined ? Number(newVol.level.toFixed(1)) : undefined
			}
			if (newVol.mute !== oldVol?.mute) {
				newVariables.mute = newVol.mute ? 'Muted' : 'Unmuted'
			}

			previousState.audioVolume = { ...newVol }
		}
		if (state.audioInputs) {
			const newIn = state.audioInputs
			const oldIn = previousState.audioInputs

			const newInputStr = newIn.input.join(', ')
			const oldInputStr = oldIn?.input.join(', ')

			if (newInputStr !== oldInputStr) {
				if (newIn.input.length === 0) {
					newVariables.active_inputs = 'No Inputs'
				} else {
					const inputs = newIn.input.map((i) => (i === 'A' ? 'Analog' : i)).join(' + ')
					newVariables.active_inputs = inputs
				}
			}

			previousState.audioInputs = { ...newIn }
		}

		// AoIP
		if (state.aoipInfo) {
			const newAoip = state.aoipInfo
			const oldAoip = previousState.aoipInfo

			if (newAoip.id !== oldAoip?.id) {
				newVariables.aoip_id = newAoip.id
			}
			if (newAoip.name !== oldAoip?.name) {
				newVariables.aoip_name = newAoip.name
			}
			if (newAoip.fname !== oldAoip?.fname) {
				newVariables.aoip_fname = newAoip.fname
			}
			if (newAoip.mac !== oldAoip?.mac) {
				newVariables.aoip_mac = newAoip.mac
			}
			if (newAoip.locked !== oldAoip?.locked || oldAoip?.locked === undefined) {
				newVariables.aoip_locked = newAoip.locked === true ? 'Locked' : 'Unlocked'
			}

			previousState.aoipInfo = { ...newAoip }
		}
		if (state.aoipNetwork) {
			const newAoipNet = state.aoipNetwork
			const oldAoipNet = previousState.aoipNetwork

			if (newAoipNet.ip !== oldAoipNet?.ip) {
				newVariables.aoip_ip = newAoipNet.ip
			}
			if (newAoipNet.mask !== oldAoipNet?.mask) {
				newVariables.aoip_mask = newAoipNet.mask
			}
			if (newAoipNet.gw !== oldAoipNet?.gw) {
				newVariables.aoip_gateway = newAoipNet.gw
			}

			previousState.aoipNetwork = { ...newAoipNet }
		}

		// Zone
		if (state.zone) {
			const newZone = state.zone
			const oldZone = previousState.zone

			if (newZone.zone !== oldZone?.zone) {
				newVariables.zone_id = newZone.zone ?? 'None'
			}
			if (newZone.name !== oldZone?.name) {
				newVariables.zone_name = newZone.name ?? 'None'
			}

			previousState.zone = { ...newZone }
		}

		// Profiles
		if (state.profiles) {
			const newProf = state.profiles
			const oldProf = previousState.profiles

			if (newProf.selected !== oldProf?.selected) {
				newVariables.profile_selected = newProf.selected === 0 ? 'Default' : newProf.selected
			}
			if (newProf.startup !== oldProf?.startup) {
				newVariables.profile_startup = newProf.startup === 0 ? 'Default' : newProf.startup
			}

			previousState.profiles = { ...newProf }
		}

		// Check events
		if (state.events) {
			const newEvents = state.events
			const oldEvents = previousState.events

			if (newEvents.bsLevel !== oldEvents?.bsLevel) {
				newVariables.bass_level = newEvents.bsLevel != undefined ? Number(newEvents.bsLevel).toFixed(1) : undefined
			}
			if (newEvents.twLevel !== oldEvents?.twLevel) {
				newVariables.tweeter_level = newEvents.twLevel != undefined ? Number(newEvents.twLevel).toFixed(1) : undefined
			}
			if (newEvents.inLevel !== oldEvents?.inLevel) {
				newVariables.input_level = newEvents.inLevel != undefined ? Number(newEvents.inLevel).toFixed(1) : undefined
			}
			if (newEvents.cpuT !== oldEvents?.cpuT) {
				newVariables.cpu_temp = newEvents.cpuT.toFixed(1)
			}
			if (newEvents.cpuLoad !== oldEvents?.cpuLoad) {
				newVariables.cpu_load = newEvents.cpuLoad
			}
			if (newEvents.nwInKbps !== oldEvents?.nwInKbps) {
				newVariables.network_traffic = newEvents.nwInKbps
			}
			if (newEvents.uptime !== oldEvents?.uptime) {
				newVariables.uptime = newEvents.uptime
			}

			previousState.events = { ...newEvents }
		}

		// Check LED
		if (state.led) {
			const newLed = state.led
			const oldLed = previousState.led

			if (newLed.ledIntensity !== oldLed?.ledIntensity) {
				newVariables.led_intensity = newLed.ledIntensity
			}
			if (newLed.rj45Leds !== oldLed?.rj45Leds) {
				newVariables.rj45_leds = newLed.rj45Leds ? 'On' : 'Off'
			}
			if (newLed.hideClip !== oldLed?.hideClip) {
				newVariables.clip_led = newLed.hideClip ? 'Off' : 'On'
			}

			previousState.led = { ...newLed }
		}

		//Device ISS
		if (state.deviceISS) {
			const newIss = state.deviceISS
			const oldIss = previousState.deviceISS

			if (newIss.sleepDelay !== oldIss?.sleepDelay) {
				newVariables.sleep_delay = newIss.sleepDelay
			}
			if (newIss.threshold !== oldIss?.threshold) {
				newVariables.sleep_threshold = newIss.threshold
			}
			if (newIss.ledIntensity !== oldIss?.ledIntensity) {
				newVariables.sleep_led_intensity = newIss.ledIntensity
			}

			previousState.deviceISS = { ...newIss }
		}

		//Audio Settings
		if (state.audioDelay) {
			const newDelay = state.audioDelay
			const oldDelay = previousState.audioDelay

			if (newDelay.node !== oldDelay?.node) {
				newVariables.audio_delay = newDelay.node
			}

			previousState.audioDelay = { ...newDelay }
		}
		if (state.audioSensitivity) {
			const newSensitivity = state.audioSensitivity
			const oldSensitivity = previousState.audioSensitivity

			if (newSensitivity.node !== oldSensitivity?.node) {
				newVariables.audio_sensitivity = newSensitivity.node
			}

			previousState.audioSensitivity = { ...newSensitivity }
		}
	} // end if (self.speaker)

	// Multicast State
	if (isMulticastMode) {
		newVariables.zone_mcast_ip = self.config.multicastIp || 'Not Set'
		newVariables.zone_mcast_port = self.config.multicastPort || 'Not Set'

		const mcastState = self.multicastState
		if (mcastState.level !== undefined) {
			newVariables.zone_volume = Number(mcastState.level.toFixed(1))
		}
		if (mcastState.mute !== undefined) {
			newVariables.zone_mute = mcastState.mute ? 'Muted' : 'Unmuted'
		}
		if (mcastState.profile !== undefined) {
			newVariables.zone_profile = mcastState.profile
		}
		if (mcastState.power !== undefined) {
			newVariables.zone_power = mcastState.power === 'BOOT' ? 'Active' : 'Standby'
		}
	}

	if (Object.keys(newVariables).length > 0) {
		self.setVariableValues(newVariables)
	}
}
