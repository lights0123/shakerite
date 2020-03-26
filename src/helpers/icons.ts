import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
const currentIcons = Object.keys(allIcons).map((i) => {
	const key = i.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
	return {
		[key]: allIcons[i],
	};
});
const iconsObject = Object.assign({}, ...currentIcons);
addIcons(iconsObject);
