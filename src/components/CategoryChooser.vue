<template>
<ion-toolbar>
	<div>
		<ion-button v-for="category in cat" :key="category.id" @click="$emit('input', category.category)" fill="clear"
		            :color="category.selected ? 'primary' : 'medium'" :strong="category.selected"
		            :style="{selected: category.selected}">
			<span>{{category.category.name}}</span>
		</ion-button>
	</div>
</ion-toolbar>
</template>

<script>
export default {
	name: 'CategoryChooser',
	props: ['categories', 'value'],
	methods: {
		clicked(category) {
			this.$emit('input', category);
		},
	},
	computed: {
		cat() {
			return this.categories.map(category => ({ category, selected: this.value.id === category.id }));
		},
	},
};
</script>

<style scoped>
ion-toolbar {
	--min-height: 0;
	--padding-top: 0;
	--padding-bottom: 0;
}

ion-button {
	margin-top: 0;
	margin-bottom: 0;
	padding-top: 0;
	padding-bottom: 0;
	height: calc(1.2em + 7px);
	--opacity: 1;
}

div {
	display: flex;
	flex-wrap: nowrap;
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
	margin-bottom: 0;
	white-space: nowrap;
	padding-left: 8px;
	margin-top: 0;
	/*justify-content: center;*/
}

::-webkit-scrollbar {
	display: none;
}

.button-strong span {
	padding-bottom: 5px;
	border-bottom: 2px;
	border-bottom-style: solid;
}

span {
	padding-bottom: 7px;
}
</style>
