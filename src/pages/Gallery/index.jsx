import { Col, Row, Typography, Card, FloatButton, Drawer, Form, Input, Button, notification, Popconfirm} from "antd";
import { useEffect, useState } from "react";
import {deleteData, getData, sendData} from "../../utils/api"
import { List } from "antd/lib";
import { PlusCircleOutlined, SearchOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';

const { Title, Text } = Typography;

const Gallery = () => {
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
    InputNatures.resetFields();
  };
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title, msg) => {
    api[type]({
      message: title,
      description: msg,
    });
  };

  const [InputNatures] = Form.useForm();
  const handleSubmit = () => {
    let nameNatures = InputNatures.getFieldValue("title");
    let descriptionOfNatures = InputNatures.getFieldValue("description");
    //mengirim data ke API
    let formData = new FormData();
    formData.append("name_natures", nameNatures);
    formData.append("description", descriptionOfNatures);
    let url = isEdit ? `/api/v1/natures/${idSelected}` : "/api/v1/natures";
    let msg = isEdit ? "Sukses memperbarui data" : "Sukses menambah data";
    sendData(url, formData)
      .then((resp) => {
        if(resp?.datas){
          openNotificationWithIcon("success", "Data Gallery", msg)
          getDataGallery();
          InputNatures.resetFields();
          onCloseDrawer();
        }
        else {
          openNotificationWithIcon("error", "Data Gallery", "Data gagal dikirim")
        }
      })
      .catch((err) => {
        console.log(err);
        alert("error", "Pengiriman Gagal", "Data tidak dapat dikirim!");
      });
  };



  useEffect(() => {
    getDataGallery();
  }, []);

  const getDataGallery = () => {
    setIsLoading(true)
    getData("/api/v1/natures")
      .then((resp) => {
        setIsLoading(false)
        if (resp) {
          setDataSources(resp);
        }else {
          console.log("something went wrong");
        }
      })
      .catch((err) => {
        setIsLoading(false)
        console.log(err)
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
    setIdSelected(record?.id);
    //sisipkan nilai nilai yang diselect ke form drawer
    InputNatures.setFieldValue("title", record?.name_natures);
    InputNatures.setFieldValue("description", record?.description);
  };

  // const [isDelete, setIsDelete] = useState(false);
  let namaDrawer = isEdit ? "Edit" : "Add";

  const confirmDelete = (record) => {
    //implementasi fungsi delete
    let url = `/api/v1/natures/${record?.id}`;
    let params = new URLSearchParams();
    params.append("id", record?.id);
    deleteData(url, params)
      .then((resp) => {
        if (resp?.status == 200) {
          getDataGallery();
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
  const handleSearch = (search) => {
    setSearchText(search.toLowerCase());
    // if (value.length > 0) {
    //   const filteredData = dataSources.filter((item) =>
    //     item?.name_natures.toLowerCase().includes(value.toLowerCase())
    //   );
    //   setDataSources(filteredData);
    // } else {
    //   getDataGallery();
    // }
  };

  let dataSourceFiltered = dataSources.filter((item) =>
    item?.name_natures.toLowerCase().includes(searchText)
  );

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
              <Form form={InputNatures} name="basic" layout="vertical" autoComplete="off">
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[{ required: true, message: "Please input your title!" }]}
                >
                  <Input placeholder="Name Nature" />
                </Form.Item>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[{ required: true, message: "Please input your description!" }]}
                >
                  <Input.TextArea rows={3} placeholder="Description" />
                </Form.Item>
              </Form>
             </Drawer>

            <Title>List of Nature</Title>
            <Text style={{ fontSize: "12pt" }}>Add content here..</Text>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search"
              className="header-search"
              allowClear
              size="large"
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isLoading ? (
              <div>Sedang menunggu data</div>
            ) : (
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 1,
                  md: 2,
                  lg: 3,
                  xl: 3,
                }}
                dataSource={dataSourceFiltered ?? []}
                renderItem={(item) => (
                  <List.Item key={item?.id}>
                    <Card
                      cover={
                        <img
                          src={`${item?.url_photo}`}
                          alt="categories-image"
                        />
                      }
                      actions={[
                      <EditOutlined key={item?.id} onClick={() => handleDrawerEdit(item)}/>, 
                      <SearchOutlined key={item?.id} />, 
                      <Popconfirm
                        key={item?.id}  
                        title="Hapus data"
                        description={`Apakah kamu yakin menghapus data ${item?.name_natures}?`}
                        onConfirm={() => confirmDelete(item)}
                        okText="Ya"
                        cancelText="Tidak"
                      >
                        <DeleteOutlined key={item?.id} />
                      </Popconfirm>]}
                    >
                      <Card.Meta
                        title={<Text>{item?.name_natures}</Text>}
                        description={<Text>{item?.description}</Text>}
                      />
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

export default Gallery;