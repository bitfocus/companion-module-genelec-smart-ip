export interface SpeakerEntry {
	ip: string
	name: string
}

export interface MulticastMessage {
	mcast: {
		ver: number
		level?: number
		mute?: boolean
		profile?: number
		state?: string
	}
}

export interface MulticastState {
	level?: number
	mute?: boolean
	profile?: number
	power?: 'STANDBY' | 'BOOT'
}

export interface AoIPIdentityResponse {
	id: string
	name: string
	fname: string
	mac: string
	locked?: boolean
}

export interface AoIPNetworkResponse {
	ip: string
	mask: string
	gw: string
}

export interface AudioInputs {
	input: string[]
}

export interface AudioVolume {
	level?: number
	mute?: boolean
}

export interface AudioSensitivity {
	node?: number
}

export interface AudioDelay {
	node?: number
	syst?: number
	axis?: number
}

export interface DeviceInfoResponse {
	fwId?: string
	build?: string
	baseId?: string
	hwId?: string
	model?: string
	category?: string
	technology?: string
	upgradeId?: number
	apiVer?: string
	confirmFwUpdate?: boolean
}

export interface DevicePowerResponse {
	state?: 'STANDBY' | 'ACTIVE' | 'ISS_SLEEP' | 'PWR_FAIL'
	poeAllocatedPwr: number
	poePd15W: boolean
}

export interface DeviceISSResponse {
	sleepDelay?: number
	threshold?: number
	ledIntensity?: number
	ledDisable?: boolean
}

export interface EventsResponse {
	bsLevel: number
	twLevel: number
	inLevel: number
	cpuT: number
	nwInKbps: number
	cpuLoad: number
	uptime: string
}

export interface LEDResponse {
	take?: boolean
	flash?: boolean
	color?: string
	ledIntensity?: number
	rj45Leds?: boolean
	hideClip?: boolean //Subwoofer only
}

export interface NetworkConfig {
	hostname?: string
	mode?: 'auto' | 'static'
	ip?: string
	mask?: string
	gw?: string
	volIp?: string
	volPort?: string
	auth?: string
}

export interface NetworkZoneResponse {
	zone: number
	name: string
}

export interface ProfileItem {
	id: number
	name?: string
	startup?: boolean
}

export interface ProfileListResponse {
	selected: number
	startup: number
	list: ProfileItem[]
}

export interface ProfileRestore {
	id: number
	startup?: boolean
}

export interface GenericResponse {
	[key: string]: unknown
}

export interface SystemState {
	deviceInfo?: DeviceInfoResponse
	power?: DevicePowerResponse
	led?: LEDResponse
	network?: NetworkConfig
	events?: EventsResponse
	audioInputs?: AudioInputs
	audioVolume?: AudioVolume
	aoipInfo?: AoIPIdentityResponse
	aoipNetwork?: AoIPNetworkResponse
	zone?: NetworkZoneResponse
	profiles?: ProfileListResponse
	deviceISS?: DeviceISSResponse
	audioDelay?: AudioDelay
	audioSensitivity?: AudioSensitivity
}
