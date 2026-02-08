import {css} from 'lit';


export default css`


#window-mask{
position: absolute;
top: 0px;
left: 0px;
width: 100%;
height: 100%;
// text-align:center;background-color: rgba(175,175,175,0.8);
z-index:6;
// display: flex hidden;display: none;
justify-content: center;
align-items: center;
}

#dialog{
border: 1px solid gray;
z-index:7;
position:absolute;
top:100px;
// margin-left:35%;// margin-right:35%;// min-height: 200px;// min-width: 300px;// width:28%;padding-left:15px;
padding-right:15px;
padding-top: 20px;
padding-bottom: 10px;
background-color: rgba(255,255,255,1);
border-radius:15px;
justify-content: center;
align-items: center; 
display: grid;
grid-template-columns: 40px 90%;
// grid-template-rows: 3;grid-gap: 10px;
}

#dialog-close{
// border: 1px solid green;grid-column: 1;
grid-row: 1;
padding-left:5px;
padding-right:5px;
text-align:center;
}

#dialog-title{
// border: 1px solid green;grid-column: 2/4;
grid-row: 1;
padding-left:5px;
padding-right:5px;
font-size: 1.5em;
font-weight: bold;
}

#dialog-content{
// border: 1px solid green;grid-column: 1/4;
grid-row: 2;
padding-left:5px;
padding-right:5px;
width:90%;
margin-left: 5%;
}

#dialog-buttons {
  grid-column: 1/3;
  grid-row: 3;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  padding: 10px 5px;
  width: 90%;
margin-left: 5%;
min-width: 90%;
align-items: stretch;
}

#bt_left {
  grid-column: 1;
text-align: center;
min-height: 33.5%;
  display: flex;
  flex-direction: column;
justify-content: center;
border: 1px solid red;
}

#bt_center {
  grid-column: 2;
text-align: center;
min-height: 33%;
  display: flex;
  flex-direction: column;
justify-content: center;
border: 1px solid green;
}

#bt_right {
  grid-column: 3;
text-align: center;
min-width: 33.5%;
height: 100%;
  display: flex;
  flex-direction: column;
justify-content: center;
border: 1px solid blue;
}


form.schedule{
  margin-top:10px;
  padding-left:5px;
  padding-right: 5px;
  padding-top:5px;
  padding-bottom:5px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
}

p.schedule_header{
  font-weight: bold;
}

select{
}

.days{
    margin-left:0px;
    margin-right:0px;
    width: 2em;
    height: 2em;
    background-color: white;
    border-radius: 50%;
    vertical-align: middle;
    border: 1px solid #ddd;
    appearance: none;
    -webkit-appearance: none;
    outline: none;
    cursor: pointer;
}
.days:checked{
  background-color:#2196F3;
}

label.days{
  position: relative;
  left: 19px;
  top: 2px;
  background-color: rgba(0,0,0,0);
  border: none;
}

label.days:hover{
cursor:pointer;
}

.interval{
  font-weight: bolder;
  text-align: center;
  border-radius: 20px;
  display: flex;
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: aliceblue;
  border: 1px solid lightgray;
}

input {
  border-radius:20px;
  border: 1px solid #009ac7;
}

select{
  border-radius:20px;
  border: 1px solid #009ac7;
}

button{
  border-radius: 20px;
  background-color: #009ac7;
  color: white;
  font-weight: bold;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  display:inline-block;
  margin-top:5px;
  margin-bott: 5px;
  border:none;
}

button:hover{
cursor:pointer;
}

button.delete_button{
 background-color:red;
 background: url('/hacsfiles/ha-reef-card/img/trash.svg');
 background-position:center;
 background-repeat:no-repeat;
}

label{
margin-right: 5px;
}

input{
margin-right: 5px;
}

:disabled{
background-color: rgb(200,200,200);
}

`;
