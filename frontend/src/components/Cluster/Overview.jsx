import { message, Select } from "antd";
import "./cluster.css";
import { Dashboard } from "./Dashborad";
// import { EventTable } from "./EventTable";
import { Status } from "../Utils/Status";
import { useCallback, useState } from "react";
import { getUserProfile } from "../../utils/utils";

const { Option } = Select;

export default function ClusterOverview() {
  const [connStatus, setStatus] = useState("Loading");
  const setConnStatus = useCallback((res) => {
    // if any res item is in False Status
    if (res && res.some((item) => "Status" in item && item.Status === false)) {
      message.error("request cluster overview has some problems!");
      setStatus("Fail");
    } else setStatus("Ready");
  }, []);

  const userProfile = getUserProfile(true);
  const namespace = userProfile ? userProfile.metadata.namespace : "NULL";

  return (
    <div>
      <div>
        命名空间
        <Select
          defaultValue={namespace}
          style={{ width: 200, margin: "0 5px" }}
          disabled
        >
          <Option value={namespace}>{namespace}</Option>
        </Select>
        <div style={{ float: "right", display: "inline-block" }}>
          <Status status={connStatus}></Status>
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        <Dashboard setConnStatus={setConnStatus} />
        {/* <EventTable /> */}
      </div>
    </div>
  );
}
