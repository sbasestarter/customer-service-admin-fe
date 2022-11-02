<template>
  <div class="talk-right talk4h">
    <TalkMessage position="left" at="顿如 2022-11-01 18:50:00" message="有一个姑娘，她有一些任性，她还有一些张狂"/>
    <TalkMessage at="顿如 2022-11-01 18:50:00" message="有一个姑娘，她有一些任性，她还有一些张狂.有一个姑娘，她有一些任性，她还有一些张狂.有一个姑娘，她有一些任性，她还有一些张狂.有一个姑娘，她有一些任性，她还有一些张狂"/>
    <TalkMessage position="left" at="顿如 2022-11-01 18:50:00" message="有一个姑娘，她有一些任性，她还有一些张狂"/>
    <TalkMessage position="left" at="顿如 2022-11-01 18:50:00" message="有一个姑娘，她有一些任性，她还有一些张狂"/>
    <TalkMessage position="left" at="顿如 2022-11-01 18:50:00" message="有一个姑娘，她有一些任性，她还有一些张狂"/>
    <TalkMessage position="left" at="顿如 2022-11-01 18:50:00" message="有一个姑娘，她有一些任性，她还有一些张狂"/>
    <TalkMessage position="left" at="顿如 2022-11-01 18:50:00" message="有一个姑娘，她有一些任性，她还有一些张狂"/>
    <TalkMessage position="left" at="顿如 2022-11-01 18:50:00" message="有一个姑娘，她有一些任性，她还有一些张狂"/>
    <TalkMessage v-for="message in messages"  :image="message.image" :key="message.image" position="left" at="顿如 2022-11-01 18:50:00" message="，，"></TalkMessage>

    <a-comment>
      <template #avatar>
        <a-avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />
      </template>
      <template #content>
        <a-form-item>
          <a-row>
            <a-col :xs="24" :sm="24" :md="18" :xl="18">
              <a-textarea class="message" v-model:value="value" :rows="4" @paste="fileChange" draggable="true" />
            </a-col>
            <a-col :xs="24" :sm="24" :md="6" :xl="6">
              <a-upload-dragger
                  name="file"
                  :before-upload="beforeUpload"
                  :show-upload-list="false"
              >
                <p class="ant-upload-drag-icon">
                  <inbox-outlined></inbox-outlined>
                </p>
                <p class="ant-upload-text">Click or drag file to this area to upload</p>
                <p class="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                  band files
                </p>
              </a-upload-dragger>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item>
          <a-button html-type="submit" :loading="submitting" type="primary" @click="handleSubmit">
            Add Comment
          </a-button>
        </a-form-item>
      </template>
    </a-comment>
  </div>
</template>

<script>
import TalkMessage from "@/components/TalkMessage";

import { ref } from 'vue';

export default {
  components: {
    TalkMessage,
  },
  setup() {
    const comments = ref([]);
    const submitting = ref(false);
    const value = ref('');

    const handleSubmit = () => {
      if (!value.value) {
        return;
      }

      submitting.value = true;
      setTimeout(() => {
        submitting.value = false;
        value.value = '';
      }, 1000);
    };

    let messages = ref([
      {
        image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      }
    ]);

    const readAndUpload = (file) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        console.log(e.target.result)
        console.log(messages.value.length)
        messages.value.push({
          image: e.target.result,
        })
      };
      reader.readAsDataURL(file);
    }

    const fileChange = (event) => {
      console.log(event);

      const items = event.clipboardData.items;
      if(items === undefined){
        return
      }

      for (let i = 0; i < items.length; i++) {
        console.log(items[i].type)
        if (items[i].type.indexOf("image") === -1 && items[i].type.indexOf("file") === -1) continue;
        readAndUpload(items[i].getAsFile())
      }
    }

    const beforeUpload = file => {
      readAndUpload(file)
    };

    return {
      comments,
      submitting,
      value,
      handleSubmit,
      fileChange,
      beforeUpload,
      messages,
    };
  }
}
</script>

<style scoped>
.message {
  height:100%;
}
</style>