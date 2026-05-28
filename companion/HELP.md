## Genelec Smart IP

Control [Genelec Smart IP Installation Speakers](https://www.genelec.com/smart-ip).

## Getting Started

There are two ways to connect to Smart IP speakers: as individual devices, or as a multicast group. In the configuration, you can select your desired mode.

**Individual Mode**

- Smart IP speakers will be automatically discovered on your local network and available to select via the "Smart IP Speaker" dropdown.
- If needed, you can also select "Manual" and enter an IP address of the speaker.
- You can add as many instances of the module as you have speakers to get individual control and feedback of the devices.

**Multicast Mode**

- Enter the desired multicast address and port. These setting must match the configured values for the speaker(s) from Genelec's Smart IP Manager App under the "Network" menu.

## Actions

- Volume
- Mute
- Set Power State
- Set Inputs Active
- Select Profile
- Set Zone Config
- Identify / Blink LED
- LED Intensity
- Clip LED
- RJ45 LEDs
- Sleep LED Intensity
- Sleep Delay
- Sleep Threshold

_Multicast Mode Actions_

- Zone Volume
- Zone Mute
- Zone Profile Select
- Zone Power

## Feedback

- Power State
- Mute State
- Inputs Active
- Current Profile
- Selected Startup Profile
- Clip LED Enabled
- RJ45 LED

_Multicast Mode Actions_

- Zone Mute State
- Zone Current Profile
- Zone Power State

## Variables

- volume (Volume (dB))
- mute (Mute State)
- active_inputs (Active Inputs)
- audio_delay (Audio Delay)
- audio_sensitivity (Audio Sensitivity)
- bass_level (Bass Output Level (dBFS))
- tweeter_level (Tweeter Output Level (dBFS))
- input_level (Input Level (dBFS))
- zone_id (Zone ID)
- zone_name (Zone Name)
- profile_selected (Selected Profile Number)
- profile_startup (Startup Profile Number)
- power_state (Power State)
- aoip_id (AoIP ID)
- aoip_name (AoIP Name)
- aoip_fname (AoIP Friendly Name)
- aoip_mac (AoIP MAC Address)
- aoip_locked (AoIP Locked)
- aoip_ip (AoIP IP Address)
- aoip_mask (AoIP Subnet Mask)
- aoip_gateway (AoIP Gateway)
- poe_allocated_pwr (PoE Allocated Power (W))
- poe_pd_limit (PoE PD Limit Status)
- hostname (Hostname)
- ip_mode (IP Mode)
- ip_address (IP Address)
- subnet_mask (Subnet Mask)
- gateway (Network Gateway)
- multicast_ip (Multicast Control IP)
- multicast_port (Multicast Control Port)
- fw_id (Firmware ID)
- build (Build Version)
- base_id (Base ID)
- model (Model)
- category (Category)
- api_ver (API Version)
- cpu_temp (CPU Temperature (°C))
- cpu_load (CPU Load (%))
- network_traffic (Network Traffic to CPU (kbps))
- uptime (Uptime)
- led_intensity (LED Intensity (%))
- rj45_leds (RJ45 LEDs)
- clip_led (Clip LED (applicable to subwoofer only))
- sleep_delay (Sleep Delay (seconds))
- sleep_threshold (Sleep Threshold (dB))
- sleep_led_intensity (Sleep LED Intensity (%))

_Multicast Mode Actions_

- zone_mcast_ip (Zone Multicast IP)
- zone_mcast_port (Zone Multicast Port)
- zone_volume (Zone Volume (dB) - Multicast)
- zone_mute (Zone Mute State - Multicast)
- zone_profile (Zone Profile - Multicast)
- zone_power (Zone Power State - Multicast)
