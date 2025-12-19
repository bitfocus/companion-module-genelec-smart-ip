import { combineRgb } from '@companion-module/base'

export const Color = {
	black: combineRgb(0, 0, 0),
	white: combineRgb(255, 255, 255),
	darkGray: combineRgb(36, 36, 36),
	lightGray: combineRgb(110, 110, 110),
	red: combineRgb(200, 0, 0),
	orange: combineRgb(255, 128, 0),
	green: combineRgb(0, 200, 0),
	//Genelec Brand Colors
	genelecGreen: 0x00865b,
	genelecLightGray: combineRgb(230, 231, 232),
	genelecDarkGray: combineRgb(29, 29, 29),
}
