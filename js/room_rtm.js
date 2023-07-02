let handleMemberJoined =async(MemberId)=>{
    // console.log('join')
    addMemberToDom(MemberId)

    let members =await channel.getMembers()
    udateTotal(members)

    let {name} =await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    addBotMessageToDom(`Welcome To The Room ${name}!`)

    
}

let addMemberToDom =async(MemberId)=>{
    let {name} =await rtmClient.getUserAttributesByKeys(MemberId, ['name'])

    let memberWrapper = document.getElementById('member__list')
    let memberItem= `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`
    memberWrapper.insertAdjacentHTML('beforeend',memberItem)
}
let udateTotal=async(members)=>{
    let total=document.getElementById('members__count')
    total.innerText=members.length

}


let handleMemberLeft=async(MemberId)=>{
    
    // let {name} =await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    //not working give error
    // addBotMessageToDom(`${name}! Has Left The Room`)

    removeMemberFRomDom(MemberId)

    let members =await channel.getMembers()
    udateTotal(members)

}

let removeMemberFRomDom =async(MemberId)=>{
    let memberWrapper=document.getElementById(`member__${MemberId}__wrapper`)

    let name=memberWrapper.getElementsByClassName('member_name')[0].textContent
    memberWrapper.remove()

    addBotMessageToDom(`${name}! Has Left The Room`)



} 

let getMember =async()=>{
    let members =await channel.getMembers() //this getMember is a inbuit method and return a list of members
    udateTotal(members)

    for(let i=0;members.length>i;i++){
        addMemberToDom(members[i])
    }
}
 
let handleChannelMessage=async(messageData,MemberId)=>{
    console.log('A new message was received')
    let data=JSON.parse(messageData.text)
    if(data.type === 'chat'){
        addMessageToDom(data.displayName,data.message)
    }
    
    // console.log('message:',messageData)
}

let sendMessage=async(e)=>{
    e.preventDefault()
    let message=e.target.message.value
    channel.sendMessage({text:JSON.stringify({'type':'chat','message':message,'displayName':displayName})})
    addMessageToDom(displayName,message)
    e.target.reset()

}
 
let addMessageToDom=async(name,message)=>{
    let messageWrapper=document.getElementById('messages')

    let newMessage=`<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>  
                            <p class="message__text"> ${message}</p>
                        </div>
                    </div>`
    messageWrapper.insertAdjacentHTML('beforeend',newMessage)

    let lastMessage=document.querySelector('#messages .message__wrapper:last-child')
    // if(lastMessage){
        lastMessage.scrollIntoView()
    // }
}
let addBotMessageToDom=async(Botmessage)=>{
    let messageWrapper=document.getElementById('messages')

    let newMessage=`<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 Mumble Bot</strong>
                            <p class="message__text__bot">${Botmessage}<p>
                        </div>
                    </div>`
    messageWrapper.insertAdjacentHTML('beforeend',newMessage)

    let lastMessage=document.querySelector('#messages .message__wrapper:last-child')
    // if(lastMessage){
        lastMessage.scrollIntoView()
    // }
}

let leaveChannel=async()=>{
    await channel.leave()
    await rtmClient.logout()
    //this will trigger memberleft and handleMemberLeft called
}
window.addEventListener('beforeunload',leaveChannel);
let messageForm=document.getElementById('message__form')
messageForm.addEventListener('submit',sendMessage)