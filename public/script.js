// pass '/' because our server is running at the root path,
// so socket will connect to our application at the root path
const socket = io('/');
// what does this peer server does is take all the WebRTC information for a user and turns it into this pretty easy-to-use ID
// which we can pass in different places. And use with this peer library, we can connect other users on the network
const myPeer = new Peer(undefined,{
  host:'/',
  port: '9001'
})

const videoGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video');
// mute the video for ourselves so no to hear our microphone play back to us
myVideo.muted = true

navigator.mediaDevices.getUserMedia({
  video:true,
  audio:true
}).then((stream)=>{
  addVideoStream(myVideo,stream)

  myPeer.on('call', call => {
    console.log('on call')
    call.answer(stream)
  })

  // listen to the user-connected event
  socket.on('user-connected',(userId) => {
    console.log(myPeer,'myPeer')
    connectToNewUser(userId, stream)
  })
})

  // as soon as we connect to our peer server, we'll get our id
  // emit the handler on the server
  myPeer.on('open',id =>{
    socket.emit('join-room',Room_ID, id);
  })

const addVideoStream = (video,stream)=>{
  video.srcObject = stream
  video.addEventListener('loadedmetadata',()=>{
    video.play()
  })
  videoGrid.append(video)
}

function connectToNewUser(id, stream){
  console.log('connectToNewUser',id)
  // send our stream to the new user
  const call = myPeer.call(id,stream);
  const video = document.createElement('video')
  // recieve video stream of the new user
  call.on('stream', videoStream =>{
    console.log('on stream')
    addVideoStream(video, videoStream);
  })
  // revome the video when a user leaves
  call.on('close', () =>{
    video.remove()
  })
}