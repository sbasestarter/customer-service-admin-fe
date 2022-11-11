<template>
  <div class="talk-right talk4h" ref="messageContainer">
    <TalkMessage v-for="message in messagesIn" :key="message.at" :position="messagePosition(message)" :at="messageTitle(message)"
                 :message="message.text" :image="message.image" />

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
          <a-button type="primary" @click="handleSubmit">
            Add Comment
          </a-button>
        </a-form-item>
      </template>
    </a-comment>
  </div>
</template>

<script>
import TalkMessage from "@/components/TalkMessage";

import {inject, ref, watch, nextTick } from 'vue';

export default {
  components: {
    TalkMessage,
  },
  props: {
    talkId: String,
    messagesIn: {
      type:Array,
      default:()=> []
    },
    customerMode: Boolean,
  },
  setup(props) {
    const messageContainer = ref()

    const fnSendMessage = inject('SendMessage')

    const comments = ref([]);
    const submitting = ref(false);
    const value = ref('');

    const handleSubmit = () => {
      if (!value.value) {
        return;
      }

      fnSendMessage(props.talkId, value.value, "")
      value.value = ""
    };


    const readAndUpload = (file) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        fnSendMessage(props.talkId, "", e.target.result)
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
    }

    const messagePosition = message => {
      if (props.customerMode) {
        return message.customerMessage ? "right" : "left";
      }

      return message.customerMessage ? "left" : "right"
    }

    const messageTitle = message => {
      return message.user + " " + new Date(message.at * 1000)
    }

    watch(() => props.messagesIn, async () => {
      console.log("messagesIn chagned")
      await nextTick()
      messageContainer.value.scrollTo({top: messageContainer.value.scrollHeight, behavior: 'smooth'});
    }, {deep:true});

    return {
      comments,
      submitting,
      value,
      handleSubmit,
      fileChange,
      beforeUpload,
      messagePosition,
      messageTitle,
      messageContainer,
    };
  }
}
</script>

<style scoped>
.message {
  height:100%;
}
</style>
