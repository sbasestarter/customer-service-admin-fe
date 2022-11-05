<template>
  <div class="home home4h">
    <a-row>
      <a-col :xs="24" :sm="24" :md="12" :xl="10">
        <TalkLeft :pending-talks="pendingTalks" :talks="talks" @activeTalkChanged="activeTalkChanged" />
      </a-col>
      <a-col :xs="24" :sm="24" :md="12" :xl="14">
        <TalkRight :talk-id="activatedTalkId" :messages-in="activatedTalkMessages" />
      </a-col>
    </a-row>

  </div>
</template>

<script>
// @ is an alias to /src
import TalkLeft from '@/components/TalkLeft.vue'
import TalkRight from '@/components/TalkRight.vue'
import {reactive, ref, provide } from 'vue'
import SocketService from "@/api/websocket";
import {
  ServiceRequest,
  ServiceResponse,
  ServiceAttachRequest,
  ServiceDetachRequest, ServicePostMessage, TalkMessageW
} from "../../js/customer_talk_service_pb";

export default {
  name: 'HomeView',
  components: {
    TalkLeft,
    TalkRight
  },
  setup() {
    let pendingTalks = ref([])
    let talks = ref([]);

    const talkLocked = (talkId, talkInfo) => {
      for (let idx = 0; idx < pendingTalks.value.length; idx++) {
        if (pendingTalks.value[idx].talkId === talkId) {
          pendingTalks.value.splice(idx, 1)
          break
        }
      }

      if (talkInfo === undefined || talkInfo === null) {
          return
      }

      for (let idx = 0; idx < talks.value.length; idx++) {
        if (talks.value[idx].talkId === talkInfo.talkId) {
          return
        }
      }

      talks.value.push(talkInfo)
    }

    const talkUnlocked = (talkInfo) => {
      for (let idx = 0; idx < talks.value.length; idx++) {
        if (talks.value[idx].talkId === talkInfo.talkId) {
          talks.value.splice(idx, 1)
          break
        }
      }

      for (let idx = 0; idx < pendingTalks.value.length; idx++) {
        if (pendingTalks.value[idx].talkId === talkInfo.talkId) {
          return
        }
      }

      pendingTalks.value.push(talkInfo)
    }

    const data = reactive({
      socketServe: SocketService.Instance,
    })
    //SocketService.Instance.connect();
    data.socketServe = SocketService.Instance;
    data.socketServe.connect()
    data.socketServe.registerCallBack('message', (message) => {
      const resp = ServiceResponse.deserializeBinary(message.data)
      if (resp.getTalks() != null) {
        talks.value = [];
        resp.getTalks().getTalksList().forEach(function (item) {
          let messages = []
          item.getMessagesList().forEach(function (message) {
            const messageObject = message.toObject();
            if (messageObject.image.length > 0) {
              messageObject.image = atob(String(messageObject.image))
            }
            messages.push(messageObject)
          })
          talks.value.push({
            ...item.getTalkInfo().toObject(),
            messages: messages,
          })
        })
      } else if (resp.getPendingTalks() != null) {
        pendingTalks.value = [];
        resp.getPendingTalks().getTalksList().forEach(function (talk) {
          pendingTalks.value.push(talk.toObject())
        })
      } else if (resp.getAttach() != null) {
        talkLocked(resp.getAttach().getTalk().getTalkId(), resp.getAttach().getTalk().toObject())
      } else if (resp.getDetach() != null) {
        talkUnlocked(resp.getDetach().getTalk().toObject())
      } else if (resp.getReload() != null) {
        for (let idx=0; idx<talks.value.length; idx++) {
          if (talks.value[idx].talkId === resp.getReload().getTalk().getTalkInfo().toObject().talkId) {
            let messages = []
            resp.getReload().getTalk().getMessagesList().forEach(function (message) {
              const messageObject = message.toObject();
              if (messageObject.image.length > 0) {
                messageObject.image = atob(String(messageObject.image))
              }
              messages.push(messageObject)
            })
            talks.value[idx].messages =  talks.value[idx].messages || [];
            talks.value[idx].messages = messages
            break
          }
        }
      } else if (resp.getMessage() != null) {
        for (let idx=0; idx<talks.value.length; idx++) {
          if (talks.value[idx].talkId === resp.getMessage().getTalkId()) {
            const messageObject = resp.getMessage().getMessage().toObject();
            if (messageObject.image.length > 0) {
              messageObject.image = atob(String(messageObject.image))
            }
            talks.value[idx].messages.push(messageObject)
          }
        }
      }

      console.log('resp:', resp.toObject())
    })

    const lockTalk = (item) => {
      const request = new ServiceRequest();
      const attach = new ServiceAttachRequest()
      attach.setTalkId(item.talkId);
      request.setAttach(attach);
      data.socketServe.send(request.serializeBinary().buffer)
    }

    provide('LockTalk', lockTalk)

    const unlockTalk =  (item) => {
      const request = new ServiceRequest();
      const detach = new ServiceDetachRequest()
      detach.setTalkId(item.talkId);
      request.setDetach(detach);
      data.socketServe.send(request.serializeBinary().buffer)
    }
    provide('UnlockTalk', unlockTalk)

    const activatedTalkMessages = ref([]);

    const activatedTalkId = ref('');

    const activeTalkChanged = (talkId) => {
      activatedTalkId.value = talkId;

      talks.value.forEach(function (item) {
        if (item.talkId === talkId) {
          activatedTalkMessages.value = item.messages;
        }
      })
    }

    const sendMessage = (talkId, text, image) => {
      const message = new TalkMessageW();
      message.setText(text);
      if (image) {
        message.setImage(new TextEncoder().encode(image));
      }
      message.setSeqId(0);

      const postMessage = new ServicePostMessage();
      postMessage.setTalkId(talkId);
      postMessage.setMessage(message);

      const request = new ServiceRequest();
      request.setMessage(postMessage);

      data.socketServe.send(request.serializeBinary().buffer)
    }
    provide('SendMessage', sendMessage)

    return {
      talks,
      pendingTalks,
      activeTalkChanged,
      activatedTalkId,
      activatedTalkMessages,
    }
  }
}
</script>
