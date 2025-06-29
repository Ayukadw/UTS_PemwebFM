import { Col, Row, Typography, Card, FloatButton, Drawer, Form, Input, Button, notification, Popconfirm, Select} from "antd";
import { useEffect, useState } from "react";
import {deleteData, getData, sendData} from "../../utils/api"
import { List } from "antd/lib";
import { PlusCircleOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined} from '@ant-design/icons';
import "./styles.css";

const { Title, Text } = Typography;

const Education = () => {
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
    if (isAddToPlaylist) {
      setIsAddToPlaylist(false);
      setSelectedPlaylist("");
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

     // Fungsi untuk membersihkan deskripsi dari info playlist
  const cleanDescription = (description) => {
    if (!description) return "-";
    
    // Hapus semua pattern playlist (global flag untuk menghapus semua kemunculan)
    let cleanedDescription = description
      // Hapus pattern "| Playlist nama" (bisa berulang)
      .replace(/\s*\|\s*Playlist\s+\w+/gi, '')
      // Hapus pattern "Added to All Playlists" di awal atau setelah |
      .replace(/^Added to All Playlists/i, '')
      .replace(/\s*\|\s*Added to All Playlists/gi, '')
      // Hapus pipe (|) yang tersisa di awal atau akhir
      .replace(/^\s*\|\s*/, '')
      .replace(/\s*\|\s*$/, '')
      // Hapus multiple pipes yang berdekatan
      .replace(/\s*\|\s*\|\s*/g, ' | ')
      .trim();
    
    return cleanedDescription || "-";
  };

  const [InputPlaylist] = Form.useForm();
  const handleSubmit = () => {
    const play_name = InputPlaylist.getFieldValue("play_title");
    const play_url = InputPlaylist.getFieldValue("play_url");
    const play_genre = InputPlaylist.getFieldValue("play_genre");
    const play_thumbnail = InputPlaylist.getFieldValue("play_thumbnail");
    let play_description = InputPlaylist.getFieldValue("play_description");

    // Jika mode add to playlist, tambahkan info playlist ke description
    if (isAddToPlaylist && selectedPlaylist) {
      const playlistInfo = selectedPlaylist === "all" ? "Added to All Playlists" : `Playlist ${selectedPlaylist}`;
      play_description = play_description ? `${play_description} | ${playlistInfo}` : playlistInfo;
    }

  const formData = new FormData();
  formData.append("play_name", play_name);
  formData.append("play_url", play_url);
  formData.append("play_thumbnail", play_thumbnail);
  formData.append("play_genre", play_genre);
  formData.append("play_description", play_description);

const url = isEdit || isAddToPlaylist ? `/api/playlist/update/${idSelected}` : "/api/playlist/43";
  const msg = isEdit ? "Sukses memperbarui data" : isAddToPlaylist ? "Sukses menambahkan ke playlist" : "Sukses menambah data";

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
          (item) => item?.play_genre?.toLowerCase() === "education"
        );
  
        setDataSources(filtered);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
    });
  };


  const [isEdit, setIsEdit] = useState(false);
  const [isAddToPlaylist, setIsAddToPlaylist] = useState(false);
  const [idSelected, setIdSelected] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");

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
  let namaDrawer = isEdit ? "Edit" : isAddToPlaylist ? "Add to My Playlist" : "Add";

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

  const handleAddToPlaylist = (record) => {
    //buka drawer
    setIsOpenDrawer(true);
    //buat isAddToPlaylist menjadi true, menandakan kita sedang mode add to playlist
    setIsAddToPlaylist(true);
    setIsEdit(false);
    //ambil id yang telah diselect sesuai dengan card yang di click
    setIdSelected(record?.id_play);
    //sisipkan nilai nilai yang diselect ke form drawer
    InputPlaylist.setFieldValue("play_title", record?.play_name);
    InputPlaylist.setFieldValue("play_url", record?.play_url);
    InputPlaylist.setFieldValue("play_genre", record?.play_genre);
    InputPlaylist.setFieldValue("play_thumbnail", record?.play_thumbnail);
    InputPlaylist.setFieldValue("play_description", record?.play_description || "");
  };

  const [filterDescription, setFilterDescription] = useState("semua");

  const[searchText, setSearchText] = useState("");
  let dataSourceFiltered = Array.isArray(dataSources)
    ? dataSources.filter((item) => {
        // Filter berdasarkan search text (judul)
        const matchesSearch = (item?.play_name || "").toLowerCase().includes(searchText.toLowerCase());
        
        // Filter berdasarkan deskripsi yang dipilih
        let matchesFilter = true; // Default true untuk "semua"
        if (filterDescription !== "semua") {
          const description = item?.play_description || "";
          matchesFilter = description.toLowerCase().includes(filterDescription.toLowerCase());
        }
        // Kedua kondisi harus terpenuhi
        return matchesSearch && matchesFilter;
      })
    : [];

  const { Option } = Select;

  return (
    <div className="layout-content">
      {contextHolder}
      <Row gutter={[24, 0]}>
        <Col xs={23} className="mb-24">
          <Card bordered={false} className="circlebox h-full w-full">
            <div className="header-section">
              <Title level={2} className="gradient-text">Daftar Education</Title>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Cari judul education"
                allowClear
                size="large"
                className="search-input"
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <FloatButton
              shape="circle"
              type="primary"
              style={{ insetInlineEnd: 94 }}
              icon={<PlusCircleOutlined />}
              onClick={() => {
                handleDrawer()
              }}
              className="add-button"
            />
             <Drawer title={`${namaDrawer} Data`} onClose={onCloseDrawer} open={isOpenDrawer} extra={
              <Button type="primary" onClick={()=> handleSubmit()}>
                {isEdit ? "Update" : isAddToPlaylist ? "Add to Playlist" : "Add"}
              </Button>}>
              {/* Form Add to My Playlist - hanya muncul jika mode add to playlist */}
                {isAddToPlaylist && (
                  <>
                    <Title level={5}>Add to My Playlist</Title>
                    <Form.Item
                      label="Pilih Playlist"
                      name="my_playlist"
                      rules={[{ required: true, message: 'Pilih playlist terlebih dahulu!' }]}
                    >
                      <Select 
                        placeholder="Pilih playlist tujuan"
                        value={selectedPlaylist}
                        onChange={(value) => setSelectedPlaylist(value)}
                      >
                        <Option value="adi">Adi</Option>
                        <Option value="ardo">Ardo</Option>
                        <Option value="ayuk">Ayuk</Option>
                        <Option value="ega">Ega</Option>
                      </Select>
                    </Form.Item>
                  </>
                )}
              <Form form={InputPlaylist} name="basic" layout="vertical" autoComplete="off">
                <Form.Item
                  label="Judul"
                  name="play_title"
                  rules={[{ required: true }]}
                >
                  <Input 
                    placeholder="Masukkan judul playlist" 
                    disabled={isAddToPlaylist}
                  />
                </Form.Item>
                <Form.Item
                  label="URL Video"
                  name="play_url"
                  rules={[{ required: true }]}
                >
                  <Input 
                    placeholder="https://youtube.com/..." 
                    disabled={isAddToPlaylist}
                  />
                </Form.Item>
                <Form.Item
                  label="Genre"
                  name="play_genre"
                  rules={[{ required: true }]}
                  initialValue={"Education"}
                >
                  <Select placeholder="Pilih genre" disabled={isAddToPlaylist}>
                    <Option value="education">Education</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Thumbnail URL"
                  name="play_thumbnail"
                  rules={[{ required: true }]}
                >
                  <Input 
                    placeholder="https://link-to-thumbnail.jpg" 
                    disabled={isAddToPlaylist}
                  />
                </Form.Item>
                <Form.Item
                  label="Deskripsi"
                  name="play_description"
                >
                  <Input.TextArea 
                    placeholder="Tulis deskripsi playlist" 
                    disabled={isAddToPlaylist}
                  />
                </Form.Item>
                
              </Form>
             </Drawer>

            <div style={{ marginBottom: 16 }}> </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <Text>Sedang memuat data...</Text>
              </div>
            ) : (
              <List
                grid={{
                  gutter: 24,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 3,
                  xl: 3,
                }}
                dataSource={dataSourceFiltered ?? []}
                renderItem={(item) => (
                  <List.Item key={item?.id_play}>
                    <Card
                      hoverable
                      className="education-card"
                      cover={
                        <div className="image-container">
                          <img
                            src={
                              item?.play_thumbnail ||
                              "https://via.placeholder.com/300x150.png?text=No+Image"
                            }
                            alt="Thumbnail"
                            className="education-thumbnail"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/300x150.png?text=Broken";
                            }}
                          />
                          <div className="genre-tag">{item?.play_genre}</div>
                          <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            className="play-button"
                            onClick={() => window.open(item?.play_url, '_blank')}
                          >
                            Tonton
                          </Button>
                        </div>
                      }
                      actions={[
                        <EditOutlined key="edit" onClick={() => handleDrawerEdit(item)} />,
                        <Popconfirm
                          key="popconfirm-delete"
                          title="Hapus education ini?"
                          description={`Apakah Anda yakin ingin menghapus ${item?.play_name}?`}
                          onConfirm={() => confirmDelete(item)}
                          okText="Ya"
                          cancelText="Tidak"
                        >
                          <DeleteOutlined key="delete" />
                        </Popconfirm>,
                        <PlusCircleOutlined key="add-to-playlist" onClick={() => handleAddToPlaylist(item)} />
                      ]}
                    >
                      <Card.Meta
                        title={item?.play_name}
                        description={
                          <div className="description-container">
                            <Text ellipsis={{ rows: 2 }}>{cleanDescription(item?.play_description)}</Text>
                          </div>
                        }
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

export default Education;