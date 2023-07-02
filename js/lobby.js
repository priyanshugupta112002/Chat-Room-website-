let form =document.getElementById('lobby__form')

let displayName =sessionStorage.getItem('display_name')
if(displayName){
    form.name.value=displayName
} 


form.addEventListener('submit',(e)=>{

    sessionStorage.setItem('display_name',e.target.name.value)
    e.preventDefault()
    let inviteCode=e.target.room.value;
    if(!inviteCode){
        // console.log('aaya')
        inviteCode=String(Math.floor(Math.random() * 10000))
    }
    window.location=`room.html?room=${inviteCode}` 

})
