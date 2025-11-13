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
border: 1px solid green;
z-index:98;
//display: flex hidden;
display: none;
justify-content: center;
align-items: center;

}


#moreinfo{
border: 1px solid gray;
z-index:99;
//position:absolute;
//margin-top:15%;
//margin-left:35%;
//margin-right:35%;
//min-height: 200px;
//min-width: 300px;
//width:30%;
background-color: rgba(255,255,255,1);
border-radius:30px;

justify-content: center;
align-items: center; 
}

#moreinfo-title{
height: 50px;
text-align: center;
}

#moreinfo-content{
text-align: center;
}

`;
