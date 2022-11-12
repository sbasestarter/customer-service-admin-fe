<template>
  <div>Hi, {{ userName }}</div>
  <div>
    <TalkRight v-if="userName !== null" :talk-id="talkId" :messages-in="messages" :customer-mode="true" />
    <e-row v-else>
      <a-form>
        <a-form-item label="您的称呼" name="username">
          <a-input v-model:value="formState.username" />
        </a-form-item>
        <a-form-item label="问题描述" name="title">
          <a-input v-model:value="formState.title" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="createToken">Submit</a-button>
        </a-form-item>
      </a-form>
    </e-row>

  </div>

</template>

<script>
import TalkRight from '@/components/TalkRight.vue'
import {getCurrentInstance, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref} from "vue";
import {
  CheckTokenResponse,
  CreateTokenRequest,
  CreateTokenResponse,
  QueryTalksResponse,
  TalkCreateRequest, TalkMessageW,
  TalkOpenRequest,
  TalkRequest,
  TalkResponse,
} from "../../js/customer_talk_service_pb";
import SocketService from "@/api/websocket";
import {notification} from "ant-design-vue";

export default {
  name: 'HomeView',
  components: {
    TalkRight
  },
  setup() {
    const socketNotificationKey = 'wsNotification';
    const openNotification = (message) => {
      notification.open({
        socketNotificationKey,
        message: '会话通道状态改变',
        description: message,
      });
    };

    let token = ref('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MTg1MjI3MTAxOTQxNTMwNjI0MCwiVXNlck5hbWUiOiJoaCIsImV4cCI6MTY3MDY1MzY3M30.clrY5X8b5aIgX-wjAORqnEJu8U50pI-n37FKvnAdJes');
    const userName = ref(null);
    const talkId = ref('');
    let messages = ref([]);

    const instance = getCurrentInstance();
    const _this= instance.appContext.config.globalProperties;

    const parentMessage = (e) => {
      if (e.data['target'] === 'customer') {
        if (e.data['token']) {
          token.value = e.data['token']
        }
        queryToken()
      }
    }

    onMounted(() => {
      console.log("..", userName.value)
      nextTick(() => {
        window.addEventListener('message', parentMessage);
      });
    });


    onBeforeUnmount(() => {
      window.removeEventListener('message', parentMessage);
    });


    const createToken = () => {
      if (formState.username === "") {
        alert("null username");

        return
      }

      const req = new CreateTokenRequest();
      req.setUserName(formState.username);
      _this.$axios({
        method: "post",
        url: process.env.VUE_APP_URL_BASE_CUSTOMER+"/createToken",
        data: req.serializeBinary().buffer,
      }).then((resp)=> {
        const pbResp = CreateTokenResponse.deserializeBinary(resp.data)
        token.value = pbResp.getToken()
        userName.value = pbResp.getUserName()
        window.parent.postMessage({
          'token': pbResp.getToken(),
          target: 'customer',
        }, '*')
        startTalk()
      })
    }

    const queryToken = () => {
      _this.$axios({
        method: "get",
        headers: {
          'token': token.value,
        },
        url: process.env.VUE_APP_URL_BASE_CUSTOMER+"/checkToken",
      }).then((resp)=>{
        const pbResp = CheckTokenResponse.deserializeBinary(resp.data)
        console.log("checkToken:", pbResp.getNewToken(), pbResp.getUserName(), pbResp.getValid())
        if (pbResp.getValid()) {
          token.value = pbResp.getNewToken();
          userName.value = pbResp.getUserName()
          window.parent.postMessage({
            'token': pbResp.getNewToken(),
            target: 'customer',
          }, '*')
          startTalk()
        }
      }).catch(e => {
        console.log("eee:", e)
      })
    }

    const talkStartRequest = new TalkRequest();

    const ws = reactive(new SocketService(process.env.VUE_APP_WS_CUSTOMER, ''));

    ws.registerCallBack('open', () => {
      openNotification('通道打开')
      ws.send(talkStartRequest.serializeBinary().buffer)
    })

    ws.registerCallBack('close', () => {
      openNotification('通道关闭')
    })

    ws.registerCallBack('message', (message) => {
      const resp = TalkResponse.deserializeBinary(message.data);
      if (resp.getMessages() != null) {
        talkId.value = resp.getMessages().getTalkId();

        messages.value= [];
        resp.getMessages().getMessagesList().forEach(function (message) {
          const messageObject = message.toObject();
          if (messageObject.image.length > 0) {
            messageObject.image = atob(String(messageObject.image))
          }
          messages.value.push(messageObject)
        })
      } else if (resp.getMessage() != null) {
        const messageObject = resp.getMessage().toObject();
        if (messageObject.image.length > 0) {
          messageObject.image = atob(String(messageObject.image))
        }
        messages.value.push(messageObject)
      }
      console.log("resp:", resp.toObject())
    })

    const formState = reactive({
      username: '',
      title: '',
    });

    const startTalk = () => {
      _this.$axios({
        method: "get",
        headers: {
          'token': token.value,
        },
        url: process.env.VUE_APP_URL_BASE_CUSTOMER+"/listTalk",
      }).then((resp)=>{
        const pbResp = QueryTalksResponse.deserializeBinary(resp.data)
        const pbTalkList = pbResp.getTalksList();
        if (pbTalkList.length > 0) {
          talkId.value = pbTalkList[0].getTalkId();
          const open = new TalkOpenRequest();
          open.setTalkId(talkId.value);
          talkStartRequest.setOpen(open);
          console.log('open ...')
        } else {
          const create = new TalkCreateRequest();
          create.setTitle(formState.title);
          talkStartRequest.setCreate(create);
          console.log('create ...')
        }

        ws.connect(token.value)
      }).catch(e => {
        console.log("eee:", e)
      })
    }

    const sendMessage = (talkId, text, image) => {
      const message = new TalkMessageW();
      message.setText(text);
      if (image) {
        message.setImage(new TextEncoder().encode(image));
      }
      message.setSeqId(0);

      const request = new TalkRequest();
      request.setMessage(message);

      ws.send(request.serializeBinary().buffer)
    }
    provide('SendMessage', sendMessage)

    return {
      formState,
      queryToken,
      createToken,
      userName,
      startTalk,
      talkId,
      messages,
      parentMessage
    }
  }
}

</script>