import React from "react";
import { Layout, Menu, Button } from "antd";
import { Link } from "react-router-dom";
import logo from "../../assets/OpenYurt.png";
import { useSessionState } from "../../utils/hooks";
import {
  InfoCircleTwoTone,
  AppstoreTwoTone,
  GoldTwoTone,
} from "@ant-design/icons";
import { clearUserProfile } from "../../utils/utils";

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const MySider = () => {
  const [collapsed, setCollapse] = useSessionState("collapsed", false);
  const [openKeys, setOpenKeys] = useSessionState("openKeys", [
    "nodemanagement",
    "workload",
  ]);

  const onCollapse = (collapsed) => {
    setCollapse(collapsed);
  };

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <Sider
      theme="light"
      width="210"
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
    >
      <Menu
        openKeys={openKeys}
        selectedKeys={[window.location.pathname.slice(1)]}
        onOpenChange={onOpenChange}
        mode="inline"
      >
        <Menu.Item key="clusterInfo" icon={<InfoCircleTwoTone />}>
          <Link to="/clusterInfo">集群信息</Link>
        </Menu.Item>
        <SubMenu key="nodemanagement" icon={<GoldTwoTone />} title="节点管理">
          {/* <Menu.Item key="nodepool">
            <Link to="/nodepool">节点池</Link>
          </Menu.Item> */}
          <Menu.Item key="nodes">
            <Link to="/nodes">节点</Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu key="workload" icon={<AppstoreTwoTone />} title="工作负载">
          <Menu.Item key="pod">
            <Link to="/pod">容器组</Link>
          </Menu.Item>
          <Menu.Item key="deployment">
            <Link to="/deployment">无状态</Link>
          </Menu.Item>
          <Menu.Item key="statefulset">
            <Link to="/statefulset">有状态</Link>
          </Menu.Item>
          <Menu.Item key="job">
            <Link to="/job">任务</Link>
          </Menu.Item>
        </SubMenu>
      </Menu>
    </Sider>
  );
};

const ContentWithSider = ({ content, history }) => {
  return (
    <Layout>
      <Header className="header">
        <img src={logo} alt="logo" className="logo"></img>
        <Button
          type="text"
          style={{
            float: "right",
            color: "#1890FF",
            marginTop: 13,
            marginRight: 5,
          }}
          onClick={() => {
            clearUserProfile();
            history.push("/login");
          }}
        >
          Log Out
        </Button>
      </Header>
      <Layout>
        <MySider></MySider>
        <Layout>
          <Content style={{ padding: "1% 2%", backgroundColor: "#F0F2F5" }}>
            <div
              style={{
                padding: "20px 30px",
                backgroundColor: "white",
                height: "100%",
              }}
            >
              {content}
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>OpenYurt ©2021</Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

const ContentWithoutSider = ({ content }) => {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        justifyContent: "space-between",
      }}
    >
      {content}
      <Footer style={{ textAlign: "center" }}>OpenYurt ©2021</Footer>
    </Layout>
  );
};

export { ContentWithSider, ContentWithoutSider };
