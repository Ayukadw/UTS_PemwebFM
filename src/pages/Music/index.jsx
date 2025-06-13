import { Col, Row, Typography, Card, FloatButton, Drawer, Form, Input, Button, notification, Popconfirm, Select, Tooltip} from "antd";
import { useEffect, useState } from "react";
import {deleteData, getData, sendData} from "../../utils/api"
import { List } from "antd/lib";
import { PlusCircleOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlayCircleFilled} from '@ant-design/icons';

const { Text, Title } = Typography;

const Music = () => {
   const [dataSources, setDataSources] = useState([]);
  const [isLoading, setIsLoading] = useState([]);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const handleDrawer = () => {
  setIsOpenDrawer(true);
  };
  const onCloseDrawer = () => {
    if (isEdit) {
      setIsEdit(false);
      setIdSelected(null);
    }
    setIsOpenDrawer(false);
    InputPlaylist.resetFields();
  };
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title, msg) => {
    api[type]({
      message: title,
      description: msg,
    });
  };

const [InputPlaylist] = Form.useForm();
const handleSubmit = () => {
  const play_name = InputPlaylist.getFieldValue("play_title");
  const play_url = InputPlaylist.getFieldValue("play_url");
  const play_genre = InputPlaylist.getFieldValue("play_genre");
  const play_thumbnail = InputPlaylist.getFieldValue("play_thumbnail");
  const play_description = InputPlaylist.getFieldValue("play_description");

  const formData = new FormData();
  formData.append("play_name", play_name);
  formData.append("play_url", play_url);
  formData.append("play_thumbnail", play_thumbnail);
  formData.append("play_genre", play_genre);
  formData.append("play_description", play_description);

  const url = isEdit ? `/api/playlist/update/${idSelected}` : "/api/playlist/43";
  const msg = isEdit ? "Sukses memperbarui data" : "Sukses menambah data";

  sendData(url, formData)
    .then((resp) => {
      if (resp?.datas) {
        openNotificationWithIcon("success", "Data Playlist", msg);
        getDataPlaylist();
        InputPlaylist.resetFields();
        onCloseDrawer();
      } else {
        openNotificationWithIcon("error", "Data Playlist", "Data gagal dikirim");
      }
    })
    .catch((err) => {
      console.error(err);
      openNotificationWithIcon("error", "Server Error", "Gagal mengirim data");
    });
};


  useEffect(() => {
    getDataPlaylist();
  }, []);

  const getDataPlaylist = () => {
    setIsLoading(true);
    getData("/api/playlist/43")
      .then((resp) => {
        setIsLoading(false);
  
        let playlists = [];
  
        if (Array.isArray(resp)) {
          playlists = resp;
        } else if (Array.isArray(resp?.datas)) {
          playlists = resp.datas;
        }
  
        const filtered = playlists.filter(
          (item) => item?.play_genre?.toLowerCase() === "music"
        );
  
        setDataSources(filtered);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
    });
  };


  const [isEdit, setIsEdit] = useState(false);
  const [idSelected, setIdSelected] = useState(null);

  const handleDrawerEdit = (record) => {
    //buka drawer
    setIsOpenDrawer(true);
    //buat isEdit menjadi true, menandakan kita sedang mode edit pada Drawer
    setIsEdit(true);
    //ambil id yang telah diselect sesuai dengan card yang di click
    setIdSelected(record?.id_play);
    //sisipkan nilai nilai yang diselect ke form drawer
    InputPlaylist.setFieldValue("play_title", record?.play_name);
    InputPlaylist.setFieldValue("play_url", record?.play_url);
    InputPlaylist.setFieldValue("play_genre", record?.play_genre);
    InputPlaylist.setFieldValue("play_thumbnail", record?.play_thumbnail);
    InputPlaylist.setFieldValue("play_description", record?.play_description || "");

  };

  // const [isDelete, setIsDelete] = useState(false);
  let namaDrawer = isEdit ? "Edit" : "Add";

  const confirmDelete = (record) => {
    //implementasi fungsi delete
    let url = `/api/playlist/${record?.id_play}`;
    let params = new URLSearchParams();
    params.append("id", record?.id_play);
    deleteData(url, params)
      .then((resp) => {
        if (resp?.status == 200) {
          getDataPlaylist();
          openNotificationWithIcon("success", "Hapus Data", "Sukses menghapus data")
        } else {
          openNotificationWithIcon("error", "Hapus Data", "Gagal menghapus data")
        }
      })
      .catch((err) => {
        console.log(err);
        openNotificationWithIcon("error", "Hapus Data", "Gagal menghapus data")
      });
  }

  const[searchText, setSearchText] = useState("");

  const musicCount = dataSources.filter(
  (item) => item?.play_genre?.toLowerCase() === "music"
  ).length;

  let dataSourceFiltered = Array.isArray(dataSources)
    ? dataSources.filter((item) =>
        (item?.play_name || "").toLowerCase().includes(searchText.toLowerCase())
      )
    : [];
  const { Option } = Select;

  return (
    <div className="layout-content">
      {contextHolder}
      <Row gutter={[24, 0]}>
        <Col xs={23} className="mb-24">
          <Card bordered={false} className="circlebox h-full w-full">
            <FloatButton
              shape="circle"
              type="primary"
              style={{ insetInlineEnd: 94 }}
              icon={<PlusCircleOutlined />}
              onClick={() => {
                handleDrawer()
              }}
            />
            <Drawer title={`${namaDrawer} Data`} onClose={onCloseDrawer} open={isOpenDrawer} extra={
              <Button type="primary" onClick={()=> handleSubmit()}>
                {isEdit ? "Update" : "Add"}
              </Button>}>
              <Form form={InputPlaylist} name="basic" layout="vertical" autoComplete="off">
                <Form.Item
                  label="Judul"
                  name="play_title"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Masukkan judul playlist" />
                </Form.Item>
                <Form.Item
                  label="URL Video"
                  name="play_url"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="https://youtube.com/..." />
                </Form.Item>
                <Form.Item
                  label="Genre"
                  name="play_genre"
                  rules={[{ required: true }]}
                  initialValue={"music"}
                >
                  <Select placeholder="Pilih genre">
                    <Option value="music">Music</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Thumbnail URL"
                  name="play_thumbnail"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="https://link-to-thumbnail.jpg" />
                </Form.Item>
                <Form.Item
                  label="Deskripsi"
                  name="play_description"
                >
                  <Input.TextArea placeholder="Tulis deskripsi playlist" />
                </Form.Item>
              </Form>
             </Drawer>

            <Title>Daftar Music</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              Jumlah Playlist music : {musicCount}
            </Text>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Cari judul Music"
              allowClear
              size="large"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div style={{ marginBottom: 16 }}> </div>

            < divider style={{ margin: "16px 0" }} />
            {isLoading ? (
              <div>Sedang menunggu data</div>
            ) : (
           <List
  grid={{
    gutter: 16,
    xs: 1,
    sm: 1,
    md: 2,
    lg: 2,
    xl: 2,
  }}
                dataSource={dataSourceFiltered ?? []}
                pagination={{
                  pageSize: 6, 
                  showSizeChanger: false,
                }}
                renderItem={(item) => (
                  <List.Item key={item?.id_play}>
  <Card
    style={{
      padding: 0,
      borderRadius: 12,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}
    bodyStyle={{ padding: 0, width: "100%" }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Thumbnail */}
      <div style={{ flex: "0 0 126px" }}>
        <img
          src={
            item?.play_thumbnail ||
            "https://via.placeholder.com/126x126.png?text=No+Image"
          }
          alt="Thumbnail"
          style={{
            width: 126,
            height: 126,
            objectFit: "cover",
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/126x126.png?text=Broken";
          }}
        />
      </div>

      {/* Judul & info */}
      <div
        style={{
          flex: 1,
          padding: "12px 24px",
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          {item?.play_name || "Tanpa Judul"}
        </Title>
        <Text type="secondary">
        {item?.play_description || "-"}
        </Text>
        {/* Ikon aksi */}
        <div style={{ marginTop: 12 }}>
          <Tooltip>
            <EditOutlined
              style={{ fontSize: 18, marginRight: 16 }}
              onClick={() => handleDrawerEdit(item)}
            />
          </Tooltip>
          <Tooltip>
            <a
              href={item?.play_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: 16, fontSize: 18, }}
            >
              <SearchOutlined/>
            </a>
          </Tooltip>
          <Tooltip>
            <Popconfirm
              title="Hapus data"
              description={`Apakah kamu yakin menghapus data ${item?.play_name}?`}
              onConfirm={() => confirmDelete(item)}
              okText="Ya"
              cancelText="Tidak"
            >
              <DeleteOutlined
              style={{ fontSize: 18, marginRight: 16}}
              />
            </Popconfirm>
          </Tooltip>
        </div>
      </div>

      {/* Tombol Play */}
      <div
  onClick={() => window.open(item?.play_url, "_blank")}
>
  <PlayCircleFilled style={{ fontSize: 36}} />
</div>
<div 
style={{
    flex: "0 0 40px",
  }}>

  </div>
    </div>
  </Card>
</List.Item>

                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>

  );
};
export default Music;