<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. -->
<template>
	<div>
		<ion-slides pager="true">
			<ion-slide v-for="picture in media" :key="picture.id">
				<div>
					<media :media="picture" caption />
					<br />
				</div>
			</ion-slide>
		</ion-slides>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import MediaComponent from '@/components/Media.vue';
import { Media } from '@/helpers/api';

@Component({
	components: { Media: MediaComponent },
})
export default class Gallery extends Vue {
	@Prop() pictures!: number[];
	media: Media[] = [];

	@Watch('pictures', { immediate: true })
	updatePictures() {
		this.media = this.pictures.map((id) => new Media(id));
	}

	@Inject() readonly API!: any;
}
</script>

<style scoped lang="scss"></style>
