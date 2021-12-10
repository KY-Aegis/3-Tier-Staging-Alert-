function main(parameter){
    output=[];
    var fpyData = parameter[1];
    var cond=parameter[2];
    var checkArr=parameter[4];
    var ctr=0;//counter for nested loop 
    var outArr=[];//array to store data that matches
    var indexUpd=[];//array that store index of value that matches that holds postgres data
    var indexUpd1=[];//array to store index of value that doesn't match
    var notArr=[];//array to store data that doesnt match
    var update=[];//array to store value if sql data is empty
    var idIndex=0;//value that stores the indexUpd value later on
    
    //array for sql data
    var checkAll=[];
    var stage1=[];
    var stage2=[];
    var stage3=[];
    //array for sql data
    
    //array for postgres data
    var ID = [];
    var Desc = [];
    var Raised = [];
    var Active = [];
    var Stats = [];
    //array for postgres data
    
    //loop to retrieve sql data
    checkArr.data.forEach(function(z){
       checkAll.push(z.Ticket_ID);
       stage1.push(z.Stage1);
       stage2.push(z.Stage2);
       stage3.push(z.Stage3);
    });
    //loop to retrieve sql data
    
    //array to retrieve postgres data
    fpyData.data.forEach(function(v){
        if (v.field3==1 && v.Duration>=cond){
        ID.push(Number(v.id));
        Desc.push(v.Reason);
        Raised.push(v.created);
        Active.push(v.Duration);
        Stats.push(v.status); 
        }
    });
    //array to retrieve postgres data
    
    ctr=checkAll.length-1;//set counter to checkAll length-1 because array loop < not ==
    
    //nested loop for getting same and different value
    if (checkAll.length>0){//check if sql data is empty or not
    	for (var a=0;a<ID.length;a++){//outerloop=postgres data as it gets the latest data
        	for (var j=0;j<checkAll.length;j++){//innerloop=sql data
            	if (ID[a]==checkAll[j]){//if innerloop equals to outerloop
                	if (cond==4 && stage3[j]!=1 && cond==4 && stage2[j]==1 ){
                    //if condition is 4 and stage3 is not 1 and stage 2 is 1
                    //stage[j] because need to follow the stage 2 is located in sql which is checkALl    
                        outArr.push({"ID":ID[a]});//push data that matches in 1 array 
                        indexUpd.push(a);//push the index number in an array
                		break;//break the loop to avoid duplicate
                    }
                    if (cond==1 && stage2[j]!=1 && cond==1 && stage1[j]==1 ){
                        //if condition is 1 and stage 2 is not 1 and stage 1 is 1
                        outArr.push({"ID":ID[a]});
                        indexUpd.push(a);
                		break;
                    }
                    if (cond==0.5){//if condition is 0.5
                        outArr.push({"ID":ID[a]});
                        indexUpd.push(a);
                		break;
                    } 
                }
                else{//if each run does not match
                    if(ID[a]!=checkAll[j] && j==ctr){
                    //if id from postgres and sql doesnt match and current value = ctr
                        notArr.push({"ID":ID[a]});//push all the non matching in an array
                    	indexUpd1.push(a);//push index of id where it doesnt match with checkAll
                        //usually happens when its a new unregistered ticket
                    }
                }
            }	    
        }    
    }
    else{//if sql data is empty
    	for (var r=0;r<ID.length;r++){//loop ID length number of times
        	update.push({"ID":ID[r]}); //push all the variable in one array   	        
        }    
    }
    //nested loop for getting same and different value
    
    //if statement to generate email body
    if (outArr.length!=0 && cond==4 ||outArr.length!=0 && cond==1){//if array that store the similar value is not empty and condition is 1 or 4 because 0.5 has its own statement later on
        //message body to pass to email component
    	msgbody='<p>The following is the list of all unattended Alert Ticket for more than '+cond+' Hours:</p><br><table border="1" style="border-collapse: collapse"><tr><th style="padding: 7px 15px;font-weight:bold;">ID</th><th style="padding: 7px 15px;font-weight:bold;">Alert Description</th><th style="padding: 7px 15px;font-weight:bold;">Ticket Raised</th><th style="padding: 7px 15px;font-weight:bold;">Total Active Duration</th><th style="padding: 7px 15px;font-weight:bold;">Status</th></tr>';	    
    	for (var i=0;i<indexUpd.length;i++){//loop for index number of times
        	idIndex=Number(indexUpd[i]);//pass the value of indexUpd to idIndex
            //msgbody value like ID[idIndex] is because we are choosing specific position within the array that was passed to indexUpd
            msgbody+='<tr><td style="padding: 7px 15px;" align="center">'+ID[idIndex]+'</td><td style="padding: 7px 15px;" align="center">'+Desc[idIndex]+'</td><td style="padding: 7px 15px;" align="center">'+Raised[idIndex]+'</td><td style="padding: 7px 15px;" align="center">'+Active[idIndex]+' Hours</td><td style="padding: 7px 15px;" align="center">'+Stats[idIndex]+'</td></tr>';
        }
        //send out email
        output[1]=msgbody;//to template
   		output[2]=1;//to data
        output[3]=parameter[3];//to subject
        //send out email
    }
    else if(cond==0.5 && notArr.length!=0){
    	msgbody='<p>The following is the list of all unattended Alert Ticket for more than '+cond+' Hours:</p><br><table border="1" style="border-collapse: collapse"><tr><th style="padding: 7px 15px;font-weight:bold;">ID</th><th style="padding: 7px 15px;font-weight:bold;">Alert Description</th><th style="padding: 7px 15px;font-weight:bold;">Ticket Raised</th><th style="padding: 7px 15px;font-weight:bold;">Total Active Duration</th><th style="padding: 7px 15px;font-weight:bold;">Status</th></tr>';	    
    	for (var e=0;e<indexUpd1.length;e++){//loop for index number of times
        	idIndex=Number(indexUpd1[e]);
            msgbody+='<tr><td style="padding: 7px 15px;" align="center">'+ID[idIndex]+'</td><td style="padding: 7px 15px;" align="center">'+Desc[idIndex]+'</td><td style="padding: 7px 15px;" align="center">'+Raised[idIndex]+'</td><td style="padding: 7px 15px;" align="center">'+Active[idIndex]+' Hours</td><td style="padding: 7px 15px;" align="center">'+Stats[idIndex]+'</td></tr>';
        }
        //send out email
        output[1]=msgbody;//to template
   		output[2]=1;//to data
        output[3]=parameter[3];//to subject    
    }
    else{//set everything to null if none of the condition applies
        output[1]=null;//set to null
   		output[2]=null;//set to null
        output[3]=null;//set to null 
    }
    //if statement to generate email body
    
    //if statement to insert into esql if condition is 0.5 and value does not exist in the existing array
    if (notArr.length!=0 && cond==0.5){
    	output[4]=JSON.stringify(notArr);//pass unmatching data into esql
    	output[5]=null;//set to null
    	output[6]=null;//set to null    
    }
    //if statement to insert esql if condition is 0.5 and value does not exist in the existing array
    
    //if statement to update esql if condition is 1 and value does not exist in the existing array
    else if (outArr.length!=0 && cond==1){
    	output[4]=null;//set to null
    	output[5]=JSON.stringify(outArr);//pass matching data into esql
    	output[6]=null;//set to null    
    }
    //if statement to update esql if condition is 1 and value does not exist in the existing array
    
    //if statement to update esql if condition is 4 and value does not exist in the existing array
    else if (outArr.length!=0 && cond==4){
    	output[4]=null;//set to null
    	output[5]=null;//set to null
    	output[6]=JSON.stringify(outArr);//pass matching data into esql    
    }
    //if statement to update esql if condition is 4 and value does not exist in the existing array
    else{//if none of that applies set everything to null
        output[4]=null;//set to null
    	output[5]=null;//set to null
    	output[6]=null;//set to null  
    }
    if (checkAll.length==0 && update.length!=0){
        output[7]=JSON.stringify(update);//copy paste all value
    }
    else{
        output[7]=null;//set to null 
    }
    return output;
}