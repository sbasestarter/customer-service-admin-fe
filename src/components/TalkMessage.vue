<template>
  <div :style="style">
    <div class="tm">{{ at }}</div>
    <div :class="panel_class">
      <a-row>
        <a-col :xs="4" v-if="right_align"></a-col>
        <a-col :xs="20">
          <div class="message">{{ message }}</div>
        </a-col>
        <a-col :xs="4" v-if="!right_align"></a-col>
      </a-row>
      <a-image :width="200" :src="talk_image"></a-image>
    </div>

  </div>
</template>

<script>
export default {
  props: {
    position: {
      type: String,
      default: "right",
    },
    at: String,
    message: String,
    image: {
      type: String,
      default: "",
    },
  },
  setup(props){
    const style = "text-align: " + props.position;
    const panel_class = props.position + "-panel";
    const right_align = props.position === "right";
    const talk_image = props.image === "" ? "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" : props.image;

    return { style, panel_class, right_align, talk_image };
  }
}
</script>

<style scoped>
.tm {
  color: green;
}

.left-panel {
  margin-left: 20px;
}

.right-panel {
  margin-right: 20px;
}

.message {

}
</style>