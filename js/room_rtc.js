const APP_ID="d9c43fa6959146fdaa4c57b054136287"


let  uid=sessionStorage.getItem('uid')

//this is not wotrk when we scale the project at high level
if(!uid){
    uid=String(Math.floor(Math.random()*1000))
    sessionStorage.setItem('uid',uid)
}
let displayName =sessionStorage.getItem('display_name')
if(!displayName){
    window.location='lobby.html'
}

let token =null;
let client

let rtmClient;
let channel

//room.html>room=134
const queryString= window.location.search
const urlParams=new URLSearchParams(queryString)
let roomID=urlParams.get('room')
//by thuis we go in a specific room of a cretain id


//new user who go in room 1st time or crreate that room
if(!roomID){
    roomID='main'
}

let localTracks =[] //this conatin audio and video stram or track of local syastem
let remoteUSer = {} //contain info(audio and video stram and id) about remote user in a form of array of a object like{'52':{audio}...etc}

let localScreenTrack;
let SharingScreen = false;


let joinRoom = async () =>{
    rtmClient =await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({uid,token})

    await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName})

    channel=await rtmClient.createChannel(roomID)
    await channel.join()
     
    channel.on('MemberJoined',handleMemberJoined)
    channel.on('MemberLeft',handleMemberLeft)
    channel.on('ChannelMessage',handleChannelMessage)

    getMember()
    addBotMessageToDom(`Welcome To The Room ${displayName}!`)

    //client object
    client =AgoraRTC.createClient({mode:'rtc',codec:'vp8'})  //mode is optimistaion tech used by agora and code is used by browser for encoding
    await client.join(APP_ID,roomID,token,uid)

    client.on('user-published',handleUserPublish)
    client.on('user-left',handleUserLeft)
    joinStram()

}
let joinStram =async()=>{
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({},{encoderConfig:{
        width:{min:640,ideal :1920,max:1920},
        height:{min:480,ideal:1080,max:1080}
    }})
     
    let player =`<div class="video_container" id="use_container-${uid}">
                    <div class="video_player" id="user-${uid}"></div>
                </div>`
    document.getElementById('streams_container').insertAdjacentHTML('beforeend',player)
    document.getElementById(`use_container-${uid}`).addEventListener('click',expandVideoFrame)

    //[1] is vidoe and [0] is audio track
    localTracks[1].play(`user-${uid}`)

    await client.publish([localTracks[0],localTracks[1]]) //this call user-published function and every user call the function hqandleuserpublish
}




let handleUserPublish =async(user,mediaType)=>{
    remoteUSer[user.uid]=user

    await client.subscribe(user,mediaType)

    let player=document.getElementById(`use_container-${user.uid}`)
    if(player === null){   
        player =`<div class="video_container" id="use_container-${user.uid}">
        <div class="video_player" id="user-${user.uid}"></div>
        </div>`
        
        document.getElementById('streams_container').insertAdjacentHTML('beforeend',player)
        document.getElementById(`use_container-${user.uid}`).addEventListener('click',expandVideoFrame)

    }
    if(displayFrame.style.display){
        player.style.height='100px'
        player.style.width='100px'
    }
    if(mediaType ==='video'){
        user.videoTrack.play(`user-${user.uid}`)
    }
    if(mediaType ==='audio'){
        user.audioTrack.play()
    }
}
let handleUserLeft=async(user)=>{
    delete remoteUSer[user.uid]
    document.getElementById(`use_container-${user.uid}`).remove()

    if(userIdInDisplayFrame ===`use_container-${user.uid}` ){
        displayFrame.style.display= null

        for(let i=0 ;i<videoFrame.length ;i++){
            videoFrame[i].style.height='300px'
            videoFrame[i].style.width='300px'
        }
    }
}

let toggleCamera =async(e)=>{
    let cameraButton =e.currentTarget

    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        cameraButton.classList.add('active')
    }else{
        await localTracks[1].setMuted(true)
        cameraButton.classList.remove('active')
    }
}
let toggleMic =async(e)=>{
    console.log('cklick')
    let MicButton =e.currentTarget

    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        MicButton.classList.add('active')
    }else{
        await localTracks[0].setMuted(true)
        MicButton.classList.remove('active')
    }
}

let switchToCamera=async()=>{
    let player =`<div class="video_container" id="use_container-${uid}">
                <div class="video_player" id="user-${uid}"></div>
                </div>`

    document.getElementById('streams_container').insertAdjacentHTML('beforeend',player)
    // displayFrame.insertAdjacentHTML('beforeend',player)

    await localTracks[0].setMuted(true)
    await localTracks[1].setMuted(true)

    document.getElementById('mic-btn').classList.remove('active')
    document.getElementById('camera-btn').classList.remove('active')

    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[1]])

}

let toggleScreen = async(e)=>{
    let screenButton =e.currentTarget
    let cameraButton=document.getElementById('camera-btn')
    
    if(!SharingScreen){
        SharingScreen=true
        screenButton.classList.add('active')
        cameraButton.classList.remove('active')
        cameraButton.style.display='none'

        localScreenTrack =await AgoraRTC.createScreenVideoTrack()
        document.getElementById(`use_container-${uid}`).remove()
        displayFrame.style.display='block'

        let player =`<div class="video_container" id="use_container-${uid}">
        <div class="video_player" id="user-${uid}"></div>
        </div>`

        displayFrame.insertAdjacentHTML('beforeend',player)
        document.getElementById(`use_container-${uid}`).addEventListener('click',expandVideoFrame)

        userIdInDisplayFrame=`use_container-${uid}`

        localScreenTrack.play(`user-${uid}`)
        

        await client.unpublish([localTracks[1]])  //we can only publish or unublish one track at a time
        await client.publish([localScreenTrack])

        let vidroFrame=document.getElementsByClassName('video_container')
        for(let i=0;i<videoFrame.length;i++){
            vidroFrame[i].style.height='100px'
            vidroFrame[i].style.width='100px'
        }


    }else{
        SharingScreen=false
        cameraButton.style.display='block'
        screenButton.classList.remove('active')
        displayFrame.style.display='none'
        document.getElementById(`use_container-${uid}`).remove()

        

        // userIdInDisplayFrame = 'none'
        await client.unpublish([localScreenTrack])

        switchToCamera()
    }

}

document.getElementById('camera-btn').addEventListener('click',toggleCamera)
document.getElementById('mic-btn').addEventListener('click',toggleMic)
document.getElementById('screen-btn').addEventListener('click',toggleScreen)



joinRoom()