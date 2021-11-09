import { baseURL } from "../config";
import { message } from "antd";
import { toPercentagePresentation, formatTime, getUserProfile } from "./utils";

export function sendRequest(path, data) {
  return fetch(baseURL + path, {
    body: JSON.stringify({ ...data }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  })
    .then((res) => res.json())
    .then((res) => {
      if ("status" in res && res.status === false) {
        // throw failed resp error
        throw new Error(res["msg"]);
      }
      return res;
    })

}

// send request as a use (add user token in request body)
export function sendUserRequest(path, data) {
  const userProfile = getUserProfile();
  if (!userProfile) {
    // if userProfile is empty, redirect to login page
    window.location.replace("/login");
  }
  return sendRequest(path, { ...data, ...userProfile.spec }).catch((err) => {
    // catch request error
    message.error(err.message);
    console.log(err)
  }).then((res) => {
    if (res && !("status" in res && res.status === false)) {
      return res;
    } else {
      // return empty obj to keep interface consistency
      return { items: [], filter: () => [], status: "error", some: () => true };
    }
  });
}

// transform common attributes of an object for presentation
const transformObject = (object, i) => ({
  key: i,
  title: object.metadata.name,
  tag: object.metadata.labels,
  createTime: formatTime(object.metadata.creationTimestamp),
  status: object.status,
  annotations: object.metadata.annotations,
});

export function getNodepools(paras) {
  const trasnform = (rawNodePool, i) => {
    return {
      ...transformObject(rawNodePool, i),
      type: rawNodePool.spec.type,
      nodeStatus: {
        ready: rawNodePool.status ? rawNodePool.status.readyNodeNum : 0,
        unready: rawNodePool.status ? rawNodePool.status.unreadyNodeNum : 0,
      },
    };
  };

  return sendUserRequest("/getNodepools", paras).then((nps) =>
    nps.items.map(trasnform)
  );
}

export function getNodes(paras) {
  const transform = (rawNode, i) => {
    const nodePoolKey = "apps.openyurt.io/nodepool";
    const nodeRoleKey = "node-role.kubernetes.io/master";
    const getNodeCondition = (rawNode) =>
      rawNode.status.conditions
        .filter((item) => item.status === "True")
        .map((item) => item.type)
        .join(",");

    return {
      ...transformObject(rawNode, i),
      // overwrite transformObject's title
      title: {
        Name: rawNode.metadata.name,
        IP: rawNode.status.addresses[0].address,
        uid: rawNode.metadata.uid,
      },
      nodePool:
        nodePoolKey in rawNode.metadata.labels
          ? rawNode.metadata.labels[nodePoolKey]
          : "无",
      role: {
        role: nodeRoleKey in rawNode.metadata.labels ? "master" : "node",
        condition: getNodeCondition(rawNode),
      },
      config: {
        CPU: rawNode.status.capacity.cpu,
        Mem: rawNode.status.capacity.memory,
        Storage: rawNode.status.capacity["ephemeral-storage"],
      },
      status: {
        CPU: toPercentagePresentation(
          parseFloat(rawNode.status.allocatable.cpu) /
          parseFloat(rawNode.status.capacity.cpu)
        ),
        Mem: toPercentagePresentation(
          parseFloat(rawNode.status.allocatable.memory) /
          parseFloat(rawNode.status.capacity.memory)
        ),
      },
      version: {
        Kubelet: rawNode.status.nodeInfo.kubeletVersion,
        Runtime: rawNode.status.nodeInfo.containerRuntimeVersion,
        OS: rawNode.status.nodeInfo.osImage,
      },
      operations: {
        NodeName: rawNode.metadata.name,
        Autonomy: "node.beta.alibabacloud.com/autonomy" in rawNode.metadata.annotations ?
          rawNode.metadata.annotations["node.beta.alibabacloud.com/autonomy"] : "false"
      }
    };
  };

  return sendUserRequest("/getNodes", paras).then((nodes) =>
    nodes.items.map(transform)
  );
}

// customized transform for workloads
const transformWorkload = (workload, i) => ({
  ...transformObject(workload, i),
  image: workload.spec.template.spec.containers.map(
    (container) => container.image
  ),
});

export function getDeployments(paras) {
  return sendUserRequest("/getDeployments", paras).then((dps) =>
    dps.items.map(transformWorkload)
  );
}

export function getStatefulSets(paras) {
  return sendUserRequest("/getStatefulsets", paras).then((ss) =>
    ss.items.map(transformWorkload)
  );
}

export function getJobs(paras) {
  const transform = (job, i) => {
    return {
      ...transformWorkload(job, i),
      completeTime: formatTime(job.status.completionTime),
      podStatus: {
        succeeded: job.status.succeeded,
        failed: job.status.failed,
        active: job.status.active,
      },
      jobStatus: job.status.failed === 0 ? "正常" : "异常",
    };
  };

  return sendUserRequest("/getJobs", paras).then((jobs) =>
    jobs.items.map(transform)
  );
}

export function getPods(paras) {
  const transform = (pod, i) => ({
    ...transformObject(pod, i),
    containers: pod.spec.containers.map((container) => container.image),
    node: {
      Name: pod.spec.nodeName,
      IP: pod.status.hostIP,
    },
    title: {
      Name: pod.metadata.name,
      IP: pod.status.podIP,
      uid: pod.metadata.uid,
    },
    podStatus: pod.status.phase,
  });

  return sendUserRequest("/getPods", paras).then((pods) =>
    pods.items.map(transform)
  );
}
