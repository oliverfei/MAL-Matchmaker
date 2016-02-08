var numProcessed = 0;
var numUsers = 0;

function findSoulmates(){
    var thisUser = $('#malUsername').val();
    $.get({
       url: "http://myanimelist.net/profile/"+thisUser,
       success: function(data){
           if(data.responseText!="")
               generateTable();
           else
               alert("That username does not exist!");
       },
    });
}

function generateTable(){
    $.get({
        url: "https://docs.google.com/spreadsheets/d/14sOjj8_pFvMm_ekbR9a8P_gsjDx4ONaO5fYDB02_Asw/pubhtml?gid=1282985650",
        success: function(data){
            var tableData = $(data.responseText).find('td');
            var userList = [];
            var thisUser = $('#malUsername').val();
            $.each(tableData,function(i,data){
                if(i>1){
                    var user = $(data).text().trim();
                    var index = userList.indexOf(user);
                    if(index==-1)
                        userList.push(user);
                }
            });
            $('#results > tbody').html("");
            $('#results').show();
            $('#counter').html("0/"+userList.length + " users processed.");
            $('#counter').show();
            numUsers = userList.length;
            numProcessed = 0;
            $.each(userList,function(i,user){
                getCompatibilityScore(user, thisUser);
            });        
        }
    });
}

function getCompatibilityScore(user1,user2) {
    if(user1!=user2)
        $.get({
            url: "http://myanimelist.net/shared.php?u1="+user1+"&u2="+user2,
            success: function(data){
                var response = data.responseText;
                var index = response.indexOf(">Mean Value");
                var extracted = response.substring(index+12, index+270); //section containing the relevant values
                /*
                Sample response after substring:
                            (34 total)</td>
                            <td align="center" class="borderClass"><span style=" color: #FF0000;">9.5</span></td>
                            <td align="center" class="borderClass"><span style=" color: #0000FF;">8.8</span></td>
                            <td align="center" class="borderClass">0.83</td>
                */
                var totalShared = extracted.substring(2,extracted.indexOf(" total"));
                extracted = extracted.substring(extracted.indexOf(";")+3);//get rid of useless part
                                                
                var averageUser1 = extracted.substring(0,extracted.indexOf("<"));//get first number
                extracted = extracted.substring(extracted.indexOf(";")+3);//get rid of useless part
                                                
                var averageUser2 = extracted.substring(0,extracted.indexOf("<"));//get second number
                extracted = extracted.substring(extracted.indexOf("border")+13);//get rid of useless part
                var meanDifference = extracted.substring(0,extracted.indexOf("<"));//get last number
                
                var compatibility = calculateCompatibility(totalShared, averageUser1, averageUser2, meanDifference);
                if(isNaN(totalShared)){
                    totalShared = 0;
                    compatibility = -666;
                }
                $('#results > tbody:last-child').append('<tr><td><a target="_blank" href = "http://myanimelist.net/profile/' + user1 + '">' + user1 + '</a>' + '</td><td>' + 
                                                            compatibility + '</td><td>' + 
                                                            totalShared + '</td>');
                numProcessed++;
                $('#counter').html(numProcessed + "/" + numUsers + " users have been processed.");
                if(numProcessed==numUsers){
                    $('#results').DataTable();
                    $('#counter').hide();
                }
            },
            error: function(xhr, status, error) {
                numProcessed++;
                console.log(user1);
            }
        });
    else
        numProcessed++;
}

function calculateCompatibility(total, average1, average2, meanDif){
  if(total<5){
    return -666;
  }
  if(meanDif==null||average1=="-"){
      return -666;
  }
  if(meanDif==0){
    return 100;
  }
  return Number(((1-(meanDif/4))*100).toFixed(2));
}