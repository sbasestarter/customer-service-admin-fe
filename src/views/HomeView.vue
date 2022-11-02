<template>
  <div class="home home4h">
    <a-row>
      <a-col :xs="24" :sm="24" :md="12" :xl="10">
        <TalkLeft />
      </a-col>
      <a-col :xs="24" :sm="24" :md="12" :xl="14">
        <TalkRight />
      </a-col>
    </a-row>

  </div>
</template>

<script>
// @ is an alias to /src
import TalkLeft from '@/components/TalkLeft.vue'
import TalkRight from '@/components/TalkRight.vue'

export default {
  name: 'HomeView',
  components: {
    TalkLeft,
    TalkRight
  }
}
</script>
