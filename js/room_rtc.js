const APP_ID = "e7fa35f7077b4390be7d2d0d5b1f78d5"

let uid = sessionStorage.getItem('uid')

//replace this with diana workflow number
if (!uid){
    uid = String(Math.floor(Math.random() * 10000))
    sessionStorage.setItem('uid', uid)
}
//end



let token = null; //pass in oauth2 token?
let client;

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')

if(!roomId){
    roomId ='main'
}

let localTracks = []
let remoteUsers = {}

let joinRoomInit = async() => {
    client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'})
    await client.join(APP_ID, roomId, token, uid)

    client.on('user-published', handleUserPublished)
    client.on('user-left', handleUserLeft)

    joinStream()
}

let joinStream = async () =>  {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let player = `<div class = "video__container" id="user-container-${uid}">
                     <div class = "video-player" id="user-${uid}"></div>
                  </div>`
    
    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[0], localTracks[1]])
}

let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user

    await client.subscribe(user, mediaType)

    let player = document.getElementById(`user-container-${user.uid}`)
    if (player === null) {
            player = `<div class = "video__container" id="user-container-${user.uid}">
                    <div class = "video-player" id="user-${user.uid}"></div>
                </div>`
                document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
    }

    if(mediaType === 'video') {
        user.videoTrack.play(`user-${user.uid}`)
    }

    if(mediaType==='audio') {
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

joinRoomInit()

