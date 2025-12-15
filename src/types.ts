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

export interface DeviceIDResponse {
	barcode: string
	mac: string
	hwId: string
	model: string
	modId: string
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

export interface DevicePower {
	state: 'STANDBY' | 'ACTIVE' | 'BOOT' | 'AOIPBOOT'
}

export interface DevicePowerResponse {
	state?: 'STANDBY' | 'ACTIVE' | 'ISS_SLEEP' | 'PWR_FAIL'
	poeAllocatedPwr: number
	poePd15W: boolean
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
	name: string
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
}
