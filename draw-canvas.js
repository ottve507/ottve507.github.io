function drawCanvas(countryArray, option_line) {
    var data = new google.visualization.arrayToDataTable(countryArray);
    var chart = new google.visualization.LineChart(document.getElementById('canvas'));
	
	var latestChange = (countryArray[countryArray.length-1][1]-countryArray[countryArray.length-2][1])
	var previousChange = (countryArray[countryArray.length-2][1]-countryArray[countryArray.length-3][1])
	
	if (latestChange == 0) {
		latestChange = (countryArray[countryArray.length-1][1]-countryArray[countryArray.length-3][1])
	}
	
	if (previousChange == 0) {
		previousChange = (countryArray[countryArray.length-2][1]-countryArray[countryArray.length-4][1])
	}
	
	var growthFactor = latestChange/previousChange
	
	if (growthFactor>1){
		document.getElementById("growth-factor").innerHTML = '<b>Growth rate: </b>' + '<p style="color: red; display: inline;"> ' +  (latestChange/previousChange).toFixed(2).toString() + ' (increasing number of cases per day)</p>';
	} else {
		document.getElementById("growth-factor").innerHTML = '<b>Growth rate: </b>' + '<p style="color: green; display: inline;"> ' + (latestChange/previousChange).toFixed(2).toString() + ' (decreasing number of cases per day)</p>';
	}
	
	document.getElementById("learn-more").innerHTML = 'Learn more about exponential curves and growth rates in <a href="https://www.youtube.com/embed/Kas0tIxDvrg">this video</a>';
    chart.draw(data, option_line);
	
}