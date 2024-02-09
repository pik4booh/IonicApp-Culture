import { IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonPage, IonSearchbar, IonTitle } from "@ionic/react";
import React,{useEffect, useState} from "react";
import HeaderApp from "../components/CHeader/HeaderApp";
import FieldCard from "../components/FieldCard/FieldCard";
import { add } from 'ionicons/icons';

import FloatingButton from "../components/FloatingButton";
import { collection, addDoc, getDocs, doc, getDoc, where, query} from "@firebase/firestore";
import { PushNotificationSchema, PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Toast } from "@capacitor/toast";
import '../../firebaseConfig';
import {getFirestore} from "@firebase/firestore";
import Cookies from "js-cookie";

const Home: React.FC = () => {

    interface UserAuthenticated {
        name: string;
        email: string;
    }

  

  const nullEntry: any[] = []
  const [notifications, setnotifications] = useState(nullEntry);
  const db = getFirestore();
  useEffect(()=>{
    PushNotifications.checkPermissions().then((res) => {
        if (res.receive !== 'granted') {
          PushNotifications.requestPermissions().then((res) => {
            if (res.receive === 'denied') {
              showToast('Push Notification permission denied');
            }
            else {
              showToast('Push Notification permission granted');
              register();
            }
          });
        }
        else {
          register();
        }
      });
      
},[]);

const register = () => {
    console.log('Initializing HomePage');

    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
        async (token: Token) => {
            showToast('Push registration success');
            await getData();
            console.log('test Adding data '+ token.value);

             // Check if the token is already registered
            const querySnapshot =  getDocs(
              query(collection(db, 'fcmtoken'), where('token', '==', token.value))
            );
            if((await(querySnapshot)).empty){
              try {
                const docRef =  addDoc(collection(db, "fcmtoken"), {
                    idUser: Cookies.get('userId'),
                    token: token.value,
                });
            } catch (e) {
                console.error("Error adding document: ", e);
            }
            }
            
        }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
        (error: any) => {
            alert('Error on registration: ' + JSON.stringify(error));
        }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
        (notification: PushNotificationSchema) => {
            setnotifications(notifications => [...notifications, { id: notification.id, title: notification.title, body: notification.body, type: 'foreground' }])
        }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
            setnotifications(notifications => [...notifications, { id: notification.notification.data.id, title: notification.notification.data.title, body: notification.notification.data.body, type: 'action' }])
        }
    );
    
    }
    const showToast = async (msg: string) => {
        await Toast.show({
            text: msg
        })
    }

    async function getData() {
        console.log("Hello hello dedsec");
        const querySnapshot = await getDocs(collection(db, "fcmtoken"));
        console.log(querySnapshot);
        querySnapshot.forEach((doc) => {
        console.log("coucou");
            console.log(doc.data());
            console.log('doc', doc);
        }
        ); 
    }



    return (
        <IonPage>
            <IonContent>
                <HeaderApp notifications={notifications}></HeaderApp>
                <h1 className="ctitle">
                    Bonjour, {Cookies.get('username')}
                </h1>
                <h2 className="ctitle">
                    Welcome! 🌽 Dive in and explore! If you need help, we're here for you.
                </h2>
                <div className="searchbar">
                    <IonInput></IonInput>
                    <IonImg className="searchbar-icon" src="/assets/icons/SearchIcon.png"></IonImg>
                </div>
                
                <div className="Field-Scroll">
                    <div className="fieldList">
                        <FieldCard
                            fieldAreaText="451,156 km²"
                            locationText="452RH+, Analamanga, Antananarivo"
                        />
                        <FieldCard
                            fieldAreaText="451,156 km²"
                            locationText="452RH+, Analamanga, Antananarivo"
                        />
                        <FieldCard
                            fieldAreaText="451,156 km²"
                            locationText="452RH+, Analamanga, Antananarivo"
                        />
                    </div>
                </div>
                <IonFab>
                    <IonFabButton href="/addfield">
                    <IonIcon icon={add}></IonIcon>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );

}

export default Home;