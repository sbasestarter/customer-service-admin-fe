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

  ws = null;
  callBackMapping = {};
  connected = false;
  sendRetryCount = 0;
  connectRetryCount = 0;

  //
  wsUrl = '';
  token = '';

  connect(wsUrl, token) {
    this.wsUrl = wsUrl;
    this.token = token;

    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket');
    }

    if (this.ws) {
      return
    }

    this.ws = new WebSocket(wsUrl); // https://stackoverflow.com/questions/58417479/sec-websocket-protocol-issues
    this.ws.binaryType = "arraybuffer";

    console.log('开始连接服务端');
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

    this.ws.onclose = () => {
      console.log('连接服务端失败了');
      this.connected = false;
      this.connectRetryCount++;
      this.ws.close();
      this.ws = null;
      setTimeout(() => {
        this.connect(this.wsUrl, this.token);
      }, 500 * this.connectRetryCount);
    };

    this.ws.onerror = () => {
      console.log('连接服务端失败了222444444444444');
    }
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
