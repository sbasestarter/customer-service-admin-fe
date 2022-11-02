<template>
  <a-collapse class="talk-left talk4h">
    <a-collapse-panel key="1" header="处理中的会话">
      <a-list item-layout="horizontal" :data-source="data" style="text-align: left">
        <template #renderItem="{ item }">
          <a-list-item @click="selectTalk({ item })" :style="{ 'background': activatedTalkID === item.id ? '#ffff80': ''}">
            <template #actions>
              <a-button type="primary" shape="round" size="large" @click="releaseTalk(item, $event)">
                <template #icon>
                  <StopOutlined />
                </template>
                释放
              </a-button>
              <a-badge count="25" />
            </template>
            <a-list-item-meta
                description="Ant Design, a design language for background applications, is refined by Ant UED Team"
            >
              <template #title>
                <a href="https://www.antdv.com/">{{ item.title }}</a>
              </template>
              <template #avatar>
                <a-avatar src="https://joeschmoe.io/api/v1/random" />
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-collapse-panel>
    <a-collapse-panel key="2" header="等待处理的会话">
      <p>{{ text }}</p>
    </a-collapse-panel>
  </a-collapse>
</template>

<script>
import { defineComponent, ref, watch, getCurrentInstance } from 'vue';
export default defineComponent({
  setup() {
    const text = `A dog is a type of domesticated animal.Known for its loyalty and faithfulness,it can be found as a welcome guest in many households across the world.`;
    const activeKey = ref(['1']);
    watch(activeKey, val => {
      console.log(val);
    });

    const releaseTalk = (item, e) => {
      console.log("release:" + item.title)
      e.stopPropagation()
    }


    const instance = getCurrentInstance();
    const _this= instance.appContext.config.globalProperties;

    let activatedTalkID = ref('');

    const selectTalk = (item) => {
      activatedTalkID.value = item.item.id;
      console.log("---------------"+item.item.title)
      _this.$api.test();
    }

    return {
      text,
      activeKey,
      activatedTalkID,
      data: [{
        id: "1",
        title: 'Ant Design Title 1',
      }, {
        id: "2",
        title: 'Ant Design Title 2',
      }, {
        id: "3",
        title: 'Ant Design Title 3',
      }, {
        id: "4",
        title: 'Ant Design Title 4',
      },{
        id: "5",
        title: 'Ant Design Title 1',
      }, {
        id: "6",
        title: 'Ant Design Title 2',
      }],
      releaseTalk,
      selectTalk,
    };
  },

});
</script>
