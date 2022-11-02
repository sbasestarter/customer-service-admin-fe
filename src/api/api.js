import {TalkInfo} from "../../js/customer_talk_service_pb";

export function test() {
  const req = new TalkInfo();
  req.setTitle("title1");
  req.setTalkId("1");
  const d = req.serializeBinary();
  console.log(d)
}
