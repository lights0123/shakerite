<template>
	<div>
		<img alt="Shakerite logo" class="logo logo-light" src="../images/shakerite.png" />
		<img alt="Shakerite logo" class="logo logo-dark" src="../images/shakerite-dark.png" />
	</div>
</template>

<script>
export default {
	name: 'Logo',
};
</script>

<style lang="scss" scoped>
.logo {
	max-height: 1.5rem;
}

body:not(.dark) {
	.logo-dark {
		display: none;
	}
}

.dark {
	.logo-light {
		display: none;
	}
}
</style>
