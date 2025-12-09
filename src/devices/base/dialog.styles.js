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
z-index:98;
//display: flex hidden;
display: none;
justify-content: center;
align-items: center;
}

#dialog{
border: 1px solid gray;
z-index:99;
position:absolute;
top:100px;
//margin-left:35%;
//margin-right:35%;
//min-height: 200px;
//min-width: 300px;
width:28%;
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
}

#dialog-submit{
//border: 1px solid green;
grid-column: 1/4;
grid-row: 3;
text-align:right;
}

`;
