var userList = [];

function findSoulmates(){
    var tableRows = $("#spreadsheet").contents().find("body").html();
    alert(JSON.stringify(tableRows));
}

function getCompatibilityScore(user1,user2) {
  var response="";
    $.get({
        url: "http://myanimelist.net/shared.php?u1="+user1+"&u2="+user2,
        success: function(data){
            response = data;
        }
    });
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
  return {user: user1, compatibility: calculateCompatibility(totalShared, averageUser1, averageUser2, meanDifference), shared: totalShared};
}

function calculateCompatibility(total, average1, average2, meanDif){
  //if(total<15){
  //  return null;
  //}
  if(meanDif==0){
    return 100;
  }
  return (1-(meanDif/4))*100;
}