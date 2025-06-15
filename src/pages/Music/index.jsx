import { Col, Row, Typography, Card, FloatButton, Drawer, Form, Input, Button, notification, Popconfirm, Select} from "antd";
import { useEffect, useState } from "react";
import {deleteData, getData, sendData} from "../../utils/api"
import { List } from "antd/lib";
import { PlusCircleOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined} from '@ant-design/icons';
import "./styles.css";

const { Text, Title } = Typography;
const { Option } = Select;

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

  // Fungsi untuk membersihkan deskripsi dari info playlist dan song type
  const cleanDescription = (description) => {
    if (!description) return "-";
    
    let cleanedDescription = description
      // Hapus pattern "| Playlist nama" (bisa berulang)
      .replace(/\s*\|\s*Playlist\s+\w+/gi, '')
      // Hapus pattern "Added to All Playlists"
      .replace(/^Added to All Playlists/i, '')
      .replace(/\s*\|\s*Added to All Playlists/gi, '')
      // Hapus pattern "Song Type: namatype" (bisa berulang)
      .replace(/\s*\|\s*Song Type:\s*\w+/gi, '')
      .replace(/^Song Type:\s*\w+/i, '')
      // Hapus pipe (|) yang tersisa di awal atau akhir
      .replace(/^\s*\|\s*/, '')
      .replace(/\s*\|\s*$/, '')
      // Hapus multiple pipes yang berdekatan
      .replace(/\s*\|\s*\|\s*/g, ' | ')
      .trim();
    
    return cleanedDescription || "-";
  };

  // Fungsi untuk mengekstrak SEMUA song types dari deskripsi
  const extractAllSongTypes = (description) => {
    if (!description) return [];
    
    // Cari semua pattern "Song Type: namatype" menggunakan regex global
    const matches = description.match(/Song Type:\s*(\w+)/gi);
    if (!matches) return [];
    
    // Extract semua song types dan convert ke lowercase untuk konsistensi
    return matches.map(match => {
      const songType = match.replace(/Song Type:\s*/i, '').trim();
      return songType.toLowerCase();
    });
  };

  // Fungsi untuk mengekstrak song type pertama dari deskripsi (untuk backward compatibility)
  const extractSongType = (description) => {
    const allTypes = extractAllSongTypes(description);
    return allTypes.length > 0 ? allTypes[0] : null;
  };

  // Fungsi untuk mengekstrak playlist info dari deskripsi
  const extractPlaylistInfo = (description) => {
    if (!description) return null;
    
    if (description.includes("Added to All Playlists")) {
      return "Added to All Playlists";
    }
    
    const match = description.match(/Playlist\s+(\w+)/i);
    return match ? `Playlist ${match[1]}` : null;
  };

  const [InputPlaylist] = Form.useForm();
  
  const handleSubmit = () => {
    const play_name = InputPlaylist.getFieldValue("play_title");
    const play_url = InputPlaylist.getFieldValue("play_url");
    const play_genre = InputPlaylist.getFieldValue("play_genre");
    const play_thumbnail = InputPlaylist.getFieldValue("play_thumbnail");
    const play_song_type = InputPlaylist.getFieldValue("play_song_type");
    let play_description = InputPlaylist.getFieldValue("play_description") || "";

    // Array untuk menyimpan informasi tambahan
    let additionalInfo = [];

    // Tambahkan song type ke deskripsi jika dipilih
    if (play_song_type) {
      additionalInfo.push(`Song Type: ${play_song_type}`);
    }

    // Jika mode add to playlist, tambahkan info playlist
    if (isAddToPlaylist && selectedPlaylist) {
      const playlistInfo = selectedPlaylist === "all" ? "Added to All Playlists" : `Playlist ${selectedPlaylist}`;
      additionalInfo.push(playlistInfo);
    }

    // Gabungkan deskripsi dengan informasi tambahan
    if (additionalInfo.length > 0) {
      play_description = play_description 
        ? `${play_description} | ${additionalInfo.join(' | ')}` 
        : additionalInfo.join(' | ');
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
        // Ubah filter untuk menampilkan music dan song saja
        const filtered = playlists.filter(
          (item) => item?.play_genre?.toLowerCase() === "music" || item?.play_genre?.toLowerCase() === "song"
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
    setIsOpenDrawer(true);
    setIsEdit(true);
    setIsAddToPlaylist(false);
    setIdSelected(record?.id_play);
    
    // Ekstrak song type dari deskripsi
    const songType = extractSongType(record?.play_description);
    
    InputPlaylist.setFieldValue("play_title", record?.play_name);
    InputPlaylist.setFieldValue("play_url", record?.play_url);
    InputPlaylist.setFieldValue("play_genre", record?.play_genre);
    InputPlaylist.setFieldValue("play_thumbnail", record?.play_thumbnail);
    InputPlaylist.setFieldValue("play_description", record?.play_description);
    InputPlaylist.setFieldValue("play_song_type", songType);
  };

  let namaDrawer = isEdit ? "Edit" : isAddToPlaylist ? "Add to My Playlist" : "Add";

  const confirmDelete = (record) => {
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
    setIsOpenDrawer(true);
    setIsAddToPlaylist(true);
    setIsEdit(false);
    setIdSelected(record?.id_play);
    
    // Ekstrak song type dari deskripsi
    const songType = extractSongType(record?.play_description);
    
    InputPlaylist.setFieldValue("play_title", record?.play_name);
    InputPlaylist.setFieldValue("play_url", record?.play_url);
    InputPlaylist.setFieldValue("play_genre", record?.play_genre);
    InputPlaylist.setFieldValue("play_thumbnail", record?.play_thumbnail);
    InputPlaylist.setFieldValue("play_description", record?.play_description);
    InputPlaylist.setFieldValue("play_song_type", songType);
  };

  const [filterDescription, setFilterDescription] = useState("semua");
  const [filterSongType, setFilterSongType] = useState("semua");
  const [filterGenre, setFilterGenre] = useState("semua"); // Filter genre baru
  const [searchText, setSearchText] = useState("");
  
  let dataSourceFiltered = Array.isArray(dataSources)
    ? dataSources.filter((item) => {
        // Filter berdasarkan search text (judul)
        const matchesSearch = (item?.play_name || "").toLowerCase().includes(searchText.toLowerCase());
        
        // Filter berdasarkan deskripsi yang dipilih
        let matchesFilter = true;
        if (filterDescription !== "semua") {
          const description = item?.play_description || "";
          matchesFilter = description.toLowerCase().includes(filterDescription.toLowerCase());
        }
        
        // Filter berdasarkan song type - DIPERBAIKI UNTUK MULTIPLE SONG TYPES
        let matchesSongType = true;
        if (filterSongType !== "semua") {
          const allSongTypes = extractAllSongTypes(item?.play_description);
          // Cek apakah filterSongType ada dalam array allSongTypes
          matchesSongType = allSongTypes.includes(filterSongType.toLowerCase());
        }

        // Filter berdasarkan genre - FILTER BARU
        let matchesGenre = true;
        if (filterGenre !== "semua") {
          const itemGenre = (item?.play_genre || "").toLowerCase();
          matchesGenre = itemGenre === filterGenre.toLowerCase();
        }
        
        return matchesSearch && matchesFilter && matchesSongType && matchesGenre;
      })
    : [];

  // Daftar jenis musik yang tersedia
  const songTypes = [
    { value: "pop", label: "Pop" },
    { value: "kpop", label: "K-Pop" },
    { value: "chill", label: "Chill" },
    { value: "anime", label: "Anime" },
    { value: "fokus", label: "Fokus" },
    { value: "perjalanan", label: "Perjalanan" },
    { value: "rock", label: "Rock" },
    { value: "jazz", label: "Jazz" },
    { value: "blues", label: "Blues" },
    { value: "country", label: "Country" },
    { value: "electronic", label: "Electronic" },
    { value: "hiphop", label: "Hip Hop" },
    { value: "rnb", label: "R&B" },
  ];
  

  return (
    <div className="layout-content">
      {contextHolder}
      <Row gutter={[10, 0]}>
        <Col xs={23} className="mb-24">
          <Card bordered={false} className="circlebox h-full w-full">
            <div className="header-section">
              <Title level={2} className="gradient-text">Daftar Music & Song</Title>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder="Cari judul music"
                    allowClear
                    size="large"
                    className="search-input"
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
            </div>

                <div style={{ minWidth: '200px',  marginBottom: '16px',}}>
                  <Select
                    value={filterGenre}
                    onChange={(value) => setFilterGenre(value)}
                    size="large"
                    style={{ width: '15%'}}
                    placeholder="Pilih Genre"
                  >
                    <Option value="semua">Music & Song</Option>
                    <Option value="music">Music</Option>
                    <Option value="song">Song</Option>
                  </Select>
                </div>

            {/* Filter Song Type Buttons */}
            <div 
              className="scroll-on-hover"
              style={{ 
                display: 'flex',
                gap: '10px',
                marginBottom: '8px',
              }}
            >
              <Button 
                type={filterSongType === "semua" ? "primary" : "default"}
                size="small"
                onClick={() => setFilterSongType("semua")}
                style={{
                  borderRadius: '4px',
                  fontSize: '14px',
                  height: '28px',
                  minWidth: '60px',
                  whiteSpace: 'nowrap',
                  background: filterSongType === "semua" ? '#1890ff' : '#f5f5f5',
                  borderColor: filterSongType === "semua" ? '#1890ff' : '#d9d9d9',
                  color: filterSongType === "semua" ? '#fff' : '#666'
                }}
              >
                Semua
              </Button>
              {songTypes.map(type => (
                <Button 
                  key={type.value}
                  type={filterSongType === type.value ? "primary" : "default"}
                  size="small"
                  onClick={() => setFilterSongType(type.value)}
                  style={{
                    borderRadius: '4px',
                    fontSize: '14px',
                    height: '28px',
                    minWidth: 'fit-content',
                    whiteSpace: 'nowrap',
                    background: filterSongType === type.value ? '#1890ff' : '#f5f5f5',
                    borderColor: filterSongType === type.value ? '#1890ff' : '#d9d9d9',
                    color: filterSongType === type.value ? '#fff' : '#666'
                  }}
                >
                  {type.label}
                </Button>
              ))}
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
                  initialValue={"music"}
                >
                  <Select placeholder="Pilih genre" disabled={isAddToPlaylist}>
                    <Option value="music">Music</Option>
                    <Option value="song">Song</Option>
                  </Select>
                </Form.Item>
                
                {/* Form Song Type - Field Baru */}
                <Form.Item
                  label="Jenis"
                  name="play_song_type"
                  rules={[{ required: true, message: 'Pilih jenis musik!' }]}
                >
                  <Select 
                    placeholder="Pilih jenis musik" 
                    disabled={isAddToPlaylist}
                    allowClear
                  >
                    {songTypes.map(type => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
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

                pagination={{
                  pageSize: 6, 
                  showSizeChanger: false,
                }}

                renderItem={(item) => {
                  const allSongTypes = extractAllSongTypes(item?.play_description);
                  const songTypeLabels = allSongTypes.map(type => {
                    return songTypes.find(st => st.value === type)?.label || type;
                  });
                  
                  return (
                    <List.Item key={item?.id_play}>
                      <Card
                        hoverable
                        className="music-card"
                        cover={
                          <div className="image-container">
                            <img
                              src={
                                item?.play_thumbnail ||
                                "https://via.placeholder.com/300x150.png?text=No+Image"
                              }
                              alt="Thumbnail"
                              className="music-thumbnail"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/300x150.png?text=Broken";
                              }}
                            />
                            <div className="genre-tag">{item?.play_genre}</div>
                            {/* Tampilkan semua song types sebagai tags */}
                            {songTypeLabels.length > 0 && (
                              <div className="song-type-tags">
                                {songTypeLabels.map((label, index) => (
                                  <span key={index} className="song-type-tag">
                                    {label}
                                  </span>
                                ))}
                              </div>
                            )}
                            <Button
                              type="primary"
                              icon={<PlayCircleOutlined />}
                              className="play-button"
                              onClick={() => window.open(item?.play_url, '_blank')}
                            >
                              Dengarkan
                            </Button>
                          </div>
                        }
                        actions={[
                          <EditOutlined key="edit" onClick={() => handleDrawerEdit(item)} />,
                          <Popconfirm
                            key="delete-popconfirm"
                            title="Hapus music ini?"
                            description={`Apakah Anda yakin ingin menghapus ${item?.play_name}?`}
                            onConfirm={() => confirmDelete(item)}
                            okText="Ya"
                            cancelText="Tidak"
                          >
                            <DeleteOutlined />
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
                  );
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Music;