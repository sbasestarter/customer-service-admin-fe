export default class SocketService {
  static servicerInstance = null;
  static get ServicerInstance() {
    if (!this.servicerInstance) {
      this.servicerInstance = new SocketService();
    }
    return this.servicerInstance;
  }
  static customerInstance = null;
  static get CustomerInstance() {
    if (!this.customerInstance) {
      this.customerInstance = new SocketService();
    }
    return this.customerInstance;
  }

  // 和服务端连接的socket对象
  ws = null;
  // 存储回调函数
  callBackMapping = {};
  // 标识是否连接成功
  connected = false;
  // 记录重试的次数
  sendRetryCount = 0;
  // 重新连接尝试的次数
  connectRetryCount = 0;
  //
  wsUrl = '';
  token = '';
  //  定义连接服务器的方法
  connect(wsUrl, token) {
    this.wsUrl = wsUrl;
    this.token = token;

    // 连接服务器
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket');
    }
    // let token = $.cookie('123');
    // let token = '4E6EF539AAF119D82AC4C2BC84FBA21F';
    // remove hey param?
    if (this.ws) {
      this.ws.close()
    }
    this.ws = new WebSocket(wsUrl); // https://stackoverflow.com/questions/58417479/sec-websocket-protocol-issues
    this.ws.binaryType = "arraybuffer";
    // 连接成功的事件
    this.ws.onopen = () => {
      console.log('连接服务端成功了');
      this.connected = true;
      // 重置重新连接的次数
      this.connectRetryCount = 0;
      const autoInfo = JSON.stringify({
        'token': this.token,
      });
      console.log("ws auth:", autoInfo)
      this.send(autoInfo)
    };
    // 1.连接服务端失败
    // 2.当连接成功之后, 服务器关闭的情况
    this.ws.onclose = () => {
      console.log('连接服务端失败');
      this.connected = false;
      this.connectRetryCount++;
      setTimeout(() => {
        this.connect(this.wsUrl);
      }, 500 * this.connectRetryCount);
    };
    // 得到服务端发送过来的数据
    this.ws.onmessage = msg => {
      const cb =  this.callBackMapping[msg.type];
      if (cb !== undefined) {
        cb(msg)
      }
      console.log(msg.data, '从服务端获取到了数据');
    };
  }
  // 回调函数的注册
  registerCallBack(socketType, callBack) {
    this.callBackMapping[socketType] = callBack;
  }
  // 取消某一个回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null;
  }
  // 发送数据的方法
  send(data) {
    // 判断此时此刻有没有连接成功
    if (this.connected) {
      this.sendRetryCount = 0;
      try {
        this.ws.send(data);
      } catch (e) {
        this.ws.send(data);
      }
    } else {
      this.sendRetryCount++;
      setTimeout(() => {
        this.send(data);
      }, this.sendRetryCount * 500);
    }
  }
}
