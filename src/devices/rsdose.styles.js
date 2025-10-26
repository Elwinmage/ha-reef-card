import {css} from 'lit';

export default css`
.on_off{
flex: 0 0 auto;
 position: absolute;
//aspect-ratio: 1/1;
width: 22%;
height: 10%;
border-radius: 50%;
top: 25.8%;
left: 2%;
}

    .head{
    flex: 0 0 auto;
    width: 31%;
height: 100%;
    }

    #head_1{
     left: 1%;
     top: 0%;
//     border: 4px solid red;
     position: absolute;  
    }

    #head_2{
     left: 23%;
     top: 0%;
//border: 4px solid magenta;
position: absolute;
    }

    #head_3{
   left: 44%;
     top: 0%;
//border: 4px solid green;
position: absolute;
    }

    #head_4{
left: 65%;
     top: 0%;
//border: 4px solid blue;
position: absolute;
    }

    .container{
    flex: 0 0 auto;
    position: absolute;
    }

    .mask1{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 35%;
    left: 10%;
    }

    .mask2{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 36%;
    left: 28%;
    transform: scale(1.1);
    }

    .mask3{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 37%;
    left: 48%;
    transform: scale(1.2);
    }
    
    .mask4{
    flex: 0 0 auto;
    width: 17%;
    position: absolute;
    top: 38%;
    left: 69%;
    transform: scale(1.3);
    }

.button{
    flex: 0 0 auto;
    aspect-ratio: 1/1;
    position:absolute;
}

.button:hover{
background-color:rgba(250,0,0,0.5);
}


.sensor {
    flex: 0 0 auto;
position: absolute;
}


    p.RSDOSE4{
    color: red;
    }

    img.RSDOSE4 {
    width: 200px;
    }

    svg {
    stroke: black;
    }
`
