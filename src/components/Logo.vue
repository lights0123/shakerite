<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. -->
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
