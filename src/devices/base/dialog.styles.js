import {css} from 'lit';


export default css`


#window-mask{
position: absolute;
top: 0px;
left: 0px;
width: 100%;
height: 100%;
//text-align:center;
background-color: rgba(175,175,175,0.8);
z-index:6;
//display: flex hidden;
display: none;
justify-content: center;
align-items: center;
}

#dialog{
border: 1px solid gray;
z-index:7;
position:absolute;
top:100px;
//margin-left:35%;
//margin-right:35%;
//min-height: 200px;
//min-width: 300px;
//width:28%;
padding-left:15px;
padding-right:15px;
padding-top: 20px;
padding-bottom: 10px;
background-color: rgba(255,255,255,1);
border-radius:15px;
justify-content: center;
align-items: center; 
display: grid;
grid-template-columns: 40px 90%;
//grid-template-rows: 3;
grid-gap: 10px;
}

#dialog-close{
//border: 1px solid green;
grid-column: 1;
grid-row: 1;
padding-left:5px;
padding-right:5px;
text-align:center;
}

#dialog-title{
//border: 1px solid green;
grid-column: 2/4;
grid-row: 1;
padding-left:5px;
padding-right:5px;
font-size: 1.5em;
font-weight: bold;
}

#dialog-content{
//border: 1px solid green;
grid-column: 1/4;
grid-row: 2;
padding-left:5px;
padding-right:5px;
width:90%;
margin-left: 5%;
}

#dialog-submit{
//border: 1px solid green;
grid-column: 2/4;
grid-row: 3;
text-align:right;
margin-right: 2%;
}
#dialog-cancel{
//border: 1px solid green;
grid-column: 1/3;
grid-row: 3;
text-align:left;
margin-left: 2%;
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
`;
