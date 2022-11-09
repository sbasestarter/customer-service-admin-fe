<template>
  <div>Hi, {{ userName }}</div>
  <div>
    <TalkRight v-if="userName !== null" :talk-id="talkId" :messages-in="messages" />
    <e-row v-else>
      <a-form>
        <a-form-item label="Username" name="username">
          <a-input v-model:value="formState.username" />
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

export default {
  name: 'HomeView',
  components: {
    TalkRight
  },
  setup() {
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
        url: "/api/createToken",
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
        url: "/api/checkToken",
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
          console.log("^^^^^^^^^^^^^^^^^^^^^^:", "checkTokenResp")
          startTalk()
        }
      }).catch(e => {
        console.log("eee:", e)
      })
    }

    const data = reactive({
      socketServe: SocketService.CustomerInstance,
    })
    //SocketService.Instance.connect();
    data.socketServe = SocketService.CustomerInstance;
    data.socketServe.registerCallBack('message', (message) => {
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
    });

    const startTalk = () => {
      _this.$axios({
        method: "get",
        headers: {
          'token': token.value,
        },
        url: "/api/listTalk",
      }).then((resp)=>{
        const pbResp = QueryTalksResponse.deserializeBinary(resp.data)
        const pbTalkList = pbResp.getTalksList();
        if (pbTalkList.length > 0) {
          talkId.value = pbTalkList[0].getTalkId();
          const open = new TalkOpenRequest();
          open.setTalkId(talkId.value);
          const req = new TalkRequest();
          req.setOpen(open);
          data.socketServe.send(req.serializeBinary().buffer)
          console.log('open ...')
        } else {
          const create = new TalkCreateRequest();
          create.setTitle(".");
          const req = new TalkRequest();
          req.setCreate(create);
          data.socketServe.send(req.serializeBinary().buffer)
          console.log('create ...')
        }
        console.log("***************************,", token.value)
        data.socketServe.connect('ws://localhost:13221/ws', token.value)
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

      data.socketServe.send(request.serializeBinary().buffer)
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