<template>
	<div class="gui-scrollgroup" ref="scrollMain">
		<transition name="show-bar">
			<div class="gui-scrollgroup-bar" ref="scrollBar" v-show="barVisible"></div>
		</transition>
		<div class="gui-scrollgroup-content" ref="scrollContent">
			<slot></slot>
		</div>
	</div>
</template>
<script type="text/ecmascript-6">
	export default{
		name: "gui-scrollgroup",
		created(){
		},
		data(){
			return {
				barVisible: false,
				offset: 0,
				timer: 0
			}
		},
		mounted()
		{
			this.addEvent();
			this.initBar();
		},
		updated()
		{
			this.initBar();
		},
		methods: {
			addEvent()
			{
				var mainCon = this.$refs["scrollMain"];
				if (mainCon)
				{
					mainCon.addEventListener("mousewheel", this.onWheel_doc);
					mainCon.addEventListener("DOMMouseScroll", this.onWheel_doc);
				}
			},
			removeEvent(){
				var mainCon = this.$refs["scrollMain"];
				if (mainCon)
				{
					mainCon.removeEventListener("mousewheel", this.onWheel_doc);
					mainCon.removeEventListener("DOMMouseScroll", this.onWheel_doc);
				}
			},
			initBar()
			{
				var mainCon = this.$refs["scrollMain"];
				var parent = mainCon.parentNode;
				var bar = this.$refs["scrollBar"];
				var content = this.$refs["scrollContent"];
				if (mainCon)
				{
					if (parent.clientHeight >= content.scrollHeight)
					{
						this.barVisible = false;
						this.offset = 0;
						content.style.marginTop = this.offset + "px";
					}
					else
					{
						bar.style.height = parseInt(parent.clientHeight / content.scrollHeight * parent.clientHeight) + "px";

						if (this.offset < parent.clientHeight - content.scrollHeight)
						{
							this.offset = parent.clientHeight - content.scrollHeight
							content.style.marginTop = this.offset + "px";
						}
					}
				}
			},
			onWheel_doc(e){
				if (!isNaN(e.wheelDelta - 0))
				{
					this.offset += e.wheelDelta;
				}
				else
				{
					this.offset -= e.detail * 40;
				}
				this.updateContent();
			},
			refresh($scrollTop = -1)
			{
				if ($scrollTop >= 0)
				{
					this.offset = -$scrollTop;
				}
				else
				{
					this.initBar();
				}
				this.updateContent();
			},
			updateContent()
			{
				var content = this.$refs["scrollContent"];
				var bar = this.$refs["scrollBar"];
				if (content)
				{
					var parent = this.$refs["scrollMain"].parentNode;
					if (parent.clientHeight >= content.scrollHeight)
					{
						return;
					}

					this.offset = Math.min(0, this.offset);
					this.offset = Math.max(parent.clientHeight - content.scrollHeight, this.offset);
					content.style.marginTop = this.offset + "px";
					this.barVisible = true;
					bar.style.top = (-this.offset / (content.scrollHeight - parent.clientHeight) *
							(parent.clientHeight - parseInt(bar.style.height.replace("px", ""))))
							+ "px";
					this.$emit("change", this.offset);
					if (this.timer != 0)
					{
						clearTimeout(this.timer);
					}
					this.timer = setTimeout(()=>
					{
						this.barVisible = false;
					}, 1000);
				}
			}
		},
		destroyed() {
			this.removeEvent();
		}
	}
</script>
<style>
	.gui-scrollgroup {
		position: relative;
		display: block;
		overflow: hidden;
	}

	.gui-scrollgroup-bar {
		display: block;
		width: 6px;
		min-height: 10px;
		background-color: #bababa;
		position: absolute;
		opacity: 0.8;
		right: 0px;
		border-radius: 3px;
	}

	.gui-scrollgroup-content {
		display: flex;
		flex-direction: column;
	}

	.gui-scrollgroup-show-bar-enter-active {
		transition: all .9s ease;
	}

	.gui-scrollgroup-show-bar-leave-active {
		transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
	}

	.gui-scrollgroup-show-bar-enter {
		opacity: 0;
	}

	.gui-scrollgroup-show-bar-leave-active {
		opacity: 0;
	}
</style>