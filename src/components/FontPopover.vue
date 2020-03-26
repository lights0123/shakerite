<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. -->
<template>
	<ion-list lines="full">
		<ion-grid>
			<ion-row>
				<ion-col>
					<ion-item @click="decreaseFont" class="text-button text-smaller">
						<div>A</div>
					</ion-item>
				</ion-col>
				<ion-col>
					<ion-item @click="increaseFont" class="text-button text-larger">
						<div>A</div>
					</ion-item>
				</ion-col>
			</ion-row>
			<ion-row class="row-dots">
				<ion-col v-for="dot in dots" :key="dot.fg + dot.bg" @click="selectedColor = dot">
					<div
						:class="{
							selected: selectedColor.fg === dot.fg && selectedColor.bg === dot.bg,
						}"
						:style="{ 'background-color': dot.bg }"
						class="dot"
					/>
				</ion-col>
			</ion-row>
		</ion-grid>

		<ion-radio-group
			:value="selectedFont"
			@ionChange="selectedFont = $event.target.value"
			name="font-family"
		>
			<ion-item v-for="font in fonts" :key="font.name + font.weight">
				<ion-label :style="{ '--ion-font-family': font.name, 'font-weight': font.weight }">
					{{ font.displayName }}
				</ion-label>
				<ion-radio :value="font.displayName" />
			</ion-item>
		</ion-radio-group>
	</ion-list>
</template>

<script lang="ts">
import Actions from '@/store/actions';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class FontPopover extends Vue {
	dots = [
		{ bg: '#fff', fg: '#000' },
		{ bg: '#f9f1e4', fg: '#000' },
		{ bg: '#4c4b50', fg: '#fff' },
		{ bg: '#000', fg: '#fff' },
	];

	get fonts() {
		return this.$isIOS
			? [
					{ displayName: 'Athelas', name: 'Athelas' },
					{ displayName: 'Charter', name: 'Charter' },
					{ displayName: 'Georgia', name: 'Georgia' },
					{ displayName: 'Iowan', name: 'Iowan' },
					{ displayName: 'Palatino', name: 'Palatino' },
					{ displayName: 'San Francisco', name: '-apple-system' },
					{ displayName: 'Seravek', name: 'Seravek' },
					{ displayName: 'Times New Roman', name: 'Times New Roman' },
					{ displayName: 'Zilla Slab', name: 'Zilla Slab' },
					{ displayName: 'Zilla Slab Light', name: 'Zilla Slab', weight: 300 },
					{ displayName: 'Roboto', name: 'Roboto' },
					{ displayName: 'Open Sans', name: 'Open Sans' },
					{ displayName: 'Open Sans Light', name: 'Open Sans', weight: 300 },
			  ]
			: [
					{ displayName: 'Sans Serif', name: 'sans-serif' },
					{ displayName: 'Serif', name: 'serif' },
					{ displayName: 'Zilla Slab', name: 'Zilla Slab' },
					{ displayName: 'Zilla Slab Light', name: 'Zilla Slab', weight: 300 },
					{ displayName: 'Roboto', name: 'Roboto' },
					{ displayName: 'Open Sans', name: 'Open Sans' },
					{ displayName: 'Open Sans Light', name: 'Open Sans', weight: 300 },
			  ];
	}

	get selectedFont() {
		const { font } = this.$store.state;
		try {
			return this.fonts.find(
				({ name, weight }) => font.family === name && font.weight === weight
			)?.displayName;
		} catch (e) {
			return undefined;
		}
	}

	set selectedFont(name) {
		const font = this.fonts.find(({ displayName }) => displayName === name);
		if (!font) return;
		this.$store.dispatch(Actions.SET_FONT_NAME, font.name);
		this.$store.dispatch(Actions.SET_FONT_WEIGHT, font.weight);
	}

	get fontWeight() {
		return this.$store.state.font.weight;
	}

	set fontWeight(weight) {
		this.$store.dispatch(Actions.SET_FONT_WEIGHT, weight);
	}

	get fontSize() {
		return this.$store.state.font.size;
	}

	set fontSize(size) {
		this.$store.dispatch(Actions.SET_FONT_SIZE, size);
	}

	get selectedColor() {
		return { fg: this.$store.state.font.fg, bg: this.$store.state.font.bg };
	}

	set selectedColor({ fg, bg }) {
		this.$store.dispatch(Actions.SET_COLOR_FG, fg);
		this.$store.dispatch(Actions.SET_COLOR_BG, bg);
	}

	decreaseFont() {
		let newSize = this.fontSize - 2;
		if (newSize < 10) newSize = 10;
		this.fontSize = newSize;
	}

	increaseFont() {
		let newSize = this.fontSize + 2;
		if (newSize > 30) newSize = 30;
		this.fontSize = newSize;
	}
}
</script>

<style scoped>
ion-list {
	margin-bottom: 0;
}

ion-radio-group > ion-item:last-child {
	--border-width: 0 !important;
}

ion-grid {
	--ion-grid-padding: 0;
	--ion-grid-column-padding: 0;
}

/* TODO */
.text-button {
	padding-left: 0;
	text-align: center;
	min-height: 20px;
	line-height: 18px;
}

.text-button > div {
	justify-content: center;
	width: 100%;
	padding-right: calc(var(--padding-start) - var(--inner-padding-end));
}

.text-smaller {
	font-size: 12px;
}

.text-larger {
	font-size: 16px;
}

.text-smaller {
	border-right: 1px solid;
}

.row-dots {
	text-align: center;
}

.row-dots .dot {
	height: 30px;
	width: 30px;
	border-radius: 50%;
	margin: 10px auto;
	position: relative;
}

.dot.selected {
	border-width: 2px;
	border-color: #327eff;
}

.row-dots {
	border-bottom: 1px solid
		rgba(var(--ion-item-md-border-color-rgb, var(--ion-item-border-color-rgb, 0)), 0.13);
}

.dot {
	border: 1px solid
		rgba(var(--ion-item-md-border-color-rgb, var(--ion-item-border-color-rgb, 0)), 0.13);
}
</style>
