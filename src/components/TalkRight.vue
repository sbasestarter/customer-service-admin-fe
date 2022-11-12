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
              <a-textarea class="message" v-model:value="message" :rows="4" @paste="fileChange" draggable="true" v-focus
                          @keydown.enter="handleEnter"
                          @keydown.alt.enter="handleAltEnter" />
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
                <p class="ant-upload-text">上传图片</p>
                <p class="ant-upload-hint">
                  点击或者拖动图片到此
                </p>
              </a-upload-dragger>
            </a-col>
          </a-row>
        </a-form-item>
      </template>
    </a-comment>
  </div>
</template>

<script>
import TalkMessage from "@/components/TalkMessage";

import {inject, ref, watch, nextTick, getCurrentInstance} from 'vue';

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

    const handleSubmit = () => {
      if (!message.value) {
        return;
      }

      fnSendMessage(props.talkId, message.value, "")
      message.value = ""
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

    const messagePosition = (message) => {
      if (props.customerMode) {
        return message.customerMessage ? "right" : "left";
      }

      return message.customerMessage ? "left" : "right"
    }

    const {proxy} = getCurrentInstance()

    const messageTitle = message => {
      return message.user + " " + proxy.$dateFormat(new Date(message.at * 1000))
    }

    watch(() => props.messagesIn, async () => {
      console.log("messagesIn chagned")
      await nextTick()
      messageContainer.value.scrollTo({top: messageContainer.value.scrollHeight, behavior: 'smooth'});
    }, {deep:true});


    const message = ref('');
    const isAltEnter = ref(false);


    const handleAltEnter = (e) => {
      const blurIndex = e.srcElement.selectionStart;
      message.value = message.value.substring(0, blurIndex) + '\n' + message.value.substring(blurIndex, message.value.length)
      isAltEnter.value = true
    }

    const handleEnter = (e) => {
      e.preventDefault()

      setTimeout(() => {
        if (isAltEnter.value) {
          isAltEnter.value = false
        }else{
          handleSubmit()
        }
      }, 100)
    }

    return {
      comments,
      submitting,
      message,
      handleAltEnter,
      handleEnter,
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
