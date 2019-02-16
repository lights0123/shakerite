<template>
<iframe :srcdoc="dino"></iframe>
</template>

<script>
import dino from '../components/dinosaur.html';

console.log(dino);
export default {
	data() {
		return {
			dino: dino,
		};
	},
	name: 'Dinosaur',
};
</script>

<style scoped>

</style>
