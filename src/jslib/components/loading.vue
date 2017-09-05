<template>
	<transition name="gui-loading">
		<div class="gui-loading" v-show="visible">
			<div class="gui-loading-wrapper" :style="{ 'padding': text ? '20px' : '15px' }">
				<spinner class="gui-loading-spin" :type="convertedSpinnerType" :size="32"></spinner>
				<span class="gui-loading-text" v-show="text">{{ text }}</span>
			</div>
			<div class="gui-loading-mask" @touchmove.stop.prevent></div>
		</div>
	</transition>
</template>

<style>
	.gui-loading {
		transition: opacity .2s linear;
	}

	.gui-loading-wrapper {
		position: fixed;
		top: 50%;
		left: 50;
		transform: translate(-50%, -50%);
		border-radius: 5px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		box-sizing: border-box;
		text-align: center;
	}

	.gui-loading-text {
		display: block;
		color: #ffffff;
		text-align: center;
		margin-top: 10px;
		font-size: 16px;
	}

	.gui-loading-spin {
		display: inline-block;
		text-align: center;
	}

	.gui-loading-mask {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		background: transparent;
	}

	.gui-loading-enter, .gui-loading-leave-active {
		opacity: 0;
	}
</style>

<script type="text/babel">
	import Spinner from 'mint-ui/packages/spinner/index.js';
	if (process.env.NODE_ENV === 'component')
	{
		require('mint-ui/packages/spinner/style.css');
	}

	export default {
		data() {
			return {
				visible: false
			};
		},

		components: {
			Spinner
		},

		computed: {
			convertedSpinnerType() {
				switch (this.spinnerType)
				{
					case 'double-bounce':
						return 1;
					case 'triple-bounce':
						return 2;
					case 'fading-circle':
						return 3;
					default:
						return 0;
				}
			}
		},

		props: {
			text: String,
			spinnerType: {
				type: String,
				default: 'snake'
			}
		}
	};
</script>
