import React, { useState, useEffect } from "react";
import Head from 'next/head';
import axios from "axios";
import Icon from '@ant-design/icons';
import "antd/dist/reset.css";
import { Button, message, Switch,Col, Row,Image,Divider,Space} from 'antd';
import {SoundCall} from '../../lib/sound';
const config = require('../../lib/config').default;


//
const ipAddress = config.ipAddress;
const switchStatusApiUrl = `http://${ipAddress}/api/switch/status?switch=2`;
const switchControlApiUrl = `http://${ipAddress}/api/switch/ctrl`;
const CallInStatus = `http://${ipAddress}/api/call/status`;
const OpenDoorAPIUrl = `http://${ipAddress}/api/switch/ctrl?switch=3&action=on`;
// SVG porte
const DoorSvg = () => (
  <svg viewBox="0 0 494.237 494.237" idth="1em" height="1em" fill="#000000">
<polygon points="85.211,457.685 180.89,457.851 180.89,36.024 85.211,36.024 		"/>
  <path d="M199.726,0v494.237l209.084-37.554l0.216-418.867L199.726,0z M385.829,437.447l-163.104,29.288V27.528L386.007,57.03
    L385.829,437.447z"/>
  <ellipse cx="247.119" cy="247.119" rx="12.715" ry="16.545"/></svg>
);
const DoorIcon = (props) => <Icon component={DoorSvg} {...props} />;
// Notification ouverture porte
const OpenDoorNotif = () => {
  const notificationTitle = "Vivalink EyesIp 🔔";
    new Notification(notificationTitle, {
    body: "Vous venez d'ouvrir la porte",
    renotify: true,
    tag: "Ouverture porte",
    timeoutType: 'never',
    urgency: 'critical',
    closeButtonText: 'Fermer',
    
  }).onclick = () => console.log("Notification Clicked");
};
//

// Appel entrant
const CallinNotif = () => {
  
    const notificationTitle = "Appel en cours";
    new Notification(notificationTitle, {
    body: "Vous avez un appel",
    renotify: true,
    tag: "Appel en cours",
    timeoutType: 'never',
    urgency: 'critical',
    closeButtonText: 'Fermer',
  }).onclick = () => openDoor() , Soundoor();
 
  
};
const Soundoor = () => {
  SoundCall(); // Remplacez 1000 par la durée de votre son en millisecondes
};
// APP
const Veyesip = () => {
  //const apiBaseUrl = process.env.API_BASE_URL;

  const [sessions, setSessions] = useState([]);
  const [switchStatus, setSwitchStatus] = useState(false);
  const [loadings, setLoadings] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  
  //loading du bouton
  const enterLoading = (index) => {
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });
    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
    }, 2000);
  };
  // notification ouverture porte
  const successdooropen = () => {
    messageApi.open({
      type: 'success',
      content: 'Ouverture porte réussi!',
    });
  };
  const successdoorclose = () => {
    messageApi.open({
      type: 'error',
      content: 'Ouverture porte échoué !',
    });
  };
  /// notification activationn switch
  const successswitch = () => {
    messageApi.open({
      type: 'success',
      content: 'Mode fermeture controlé Activé !',
    });
  };

  const errorswitch = () => {
    messageApi.open({
      type: 'error',
      content: 'Mode fermeture controlé Désactivé !',
    });
  };
//appel entrant
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(CallInStatus);
          console.log(CallInStatus);
        if (response.status === 200) {
          const data = response.data;
  
          if (data.success) {
            setSessions(data.result.sessions);
  
            if (data.result.sessions.length > 0) {
              CallinNotif(data.result.sessions.length);
            }
          }
        } else {
          console.error("Erreur lors de la récupération des données de l'API :", response.statusText);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données de l'API :", error);
      }
    };
    fetchData();

    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [CallInStatus]);
// etat du switch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(switchStatusApiUrl);
        if (response.status === 200) {
          setSwitchStatus(response.data.result.switches[0].active);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du statut du switch :", error);
      }
    };
    fetchData();

    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [switchStatusApiUrl]);

  const toggleSwitch = async () => {
    try {
      const action = switchStatus ? "?switch=2&action=off" : "?switch=2&action=on";
      await axios.post(`${switchControlApiUrl}${action}`);
      setSwitchStatus(!switchStatus);
      successswitch();
    } catch (error) {
      errorswitch();
      console.error("Erreur lors du basculement du switch :", error);
    }
  };
/// ouverture porte
  const openDoor = async () => {
    try {
      const response = await axios.post(OpenDoorAPIUrl);
      if (response.status === 200) {
        OpenDoorNotif();
        successdooropen();
        console.log(OpenDoorAPIUrl);
      }
    } catch (error) {
      successdoorclose();
      console.error("Erreur lors de l'ouverture de la porte :", error);
    }
  };
// debut jou son


// debut UI
  return (

    <React.Fragment>
      
      <Head>
        <title>⚡ Vivalink Eyes Ip⚡ </title>
      </Head>
       <Row>
      <Col span={24}>
      
        <Image style={{ boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)' }} id="live_preview" width="100%" height="280" alt="Video live" src="http://192.168.2.5/api/camera/snapshot?width=640&height=480&fps=10&source=internal" fallback="data:image/png;base64,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" />
        
      </Col>
    </Row>
    {contextHolder}
    <Row>
    <Col span={24}>
      <p></p>
    </Col></Row>
    <Divider />
    <Row>
    <Col span={2}></Col>
      <Col span={10}>
      
    <div className="space-align-block" style={{ boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)' }}>
    <Space.Compact direction="vertical" align="center">Fermeture controlé<p><Switch
      align="center"
      checked={switchStatus}
      options={"center"}
      onChange={(checked) => setSwitchStatus(checked)}
      onClick={() => toggleSwitch() }
    /></p></Space.Compact>
    </div>
    </Col>
    <Col span={2}></Col>
      <Col span={10}><div className="space-align-block" style={{ boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)' }}><Space.Compact direction="vertical" align="center"><Button
          type="primary"
          align="center"
          icon={<DoorIcon />}
          loading={loadings[1]}
          onClick={() => openDoor() & enterLoading(1)}
        >Ouvrir</Button></Space.Compact></div>
        </Col>
    </Row>
    <Row>
    <Col span={24}>
      <p> </p>
    </Col></Row>
  </React.Fragment>
  );
};

export default Veyesip;
