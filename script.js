//Import/setup
google.load('visualization', '1', {
    packages: ['corechart', 'geochart']
});

//Call function to draw chart
google.setOnLoadCallback(startVisualization);

//Function for adding values to table
function addRow(country,population, number_of_cases)
{
         if (!document.getElementsByTagName) return;
         
		 tabBody=document.getElementsByTagName("tbody").item(0);
         row=document.createElement("tr");
         cell1 = document.createElement("td");
         cell2 = document.createElement("td");
		 cell3 = document.createElement("td");
		 cell4 = document.createElement("td");
         textnode1=document.createTextNode(country);
         textnode2=document.createTextNode(numberWithSpaces(population));
		 textnode3=document.createTextNode(numberWithSpaces(number_of_cases));
		 textnode4=document.createTextNode(((parseInt(number_of_cases)/ population)*100000).toFixed(3));
         cell1.appendChild(textnode1);
         cell2.appendChild(textnode2);
		 cell3.appendChild(textnode3);
		 cell4.appendChild(textnode4);
         row.appendChild(cell1);
         row.appendChild(cell2);
		 row.appendChild(cell3);
		 row.appendChild(cell4);
         tabBody.appendChild(row);
}

//First step. Due to nested function we first fetch the data from the populations CSV
function startVisualization(){
    //Getting CSV-file with population virus
	
    countryPopulations = $.get("https://raw.githubusercontent.com/ottve507/Corona-Virus-Dashboard/master/populations.csv", function(csv_in) {

        //Parsing John Hopkins' CSV to array
        var countryPopulations = $.csv.toArrays(csv_in, {
            onParseValue: $.csv.hooks.castToScalar
        });
		
		var country_totals = [];
		
		for (var i = 0; i < countryPopulations.length; i++) {
			country_totals[countryPopulations[i][0]] = {population: parseInt(countryPopulations[i][1]), casesToday: 0, casesYesterday:0}
		}
		continue_visualization(country_totals);

	});	
}



//Function to draw different charts
function continue_visualization(country_totals) {

    //Getting CSV-file about Corona virus (change to local CSV if offline)
    $.get("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv", function(csv_in) {

        //Parsing John Hopkins' CSV to array
        var arrayData = $.csv.toArrays(csv_in, {
            onParseValue: $.csv.hooks.castToScalar
        });
		
		console.log(country_totals);

        //Setup empty help-array (transforming raw data)
        var all = [];
        var fr = [];
        var se = [];
        var it = [];
        

        //Loop through data in order to clean the data and creating different data sets
        for (var i = 0; i < arrayData.length; i++) {

            //Get the country column from CSV file
            country = arrayData[i].slice(1, 2)
			
			//Populating subsets
            if (country[0] == "Sweden") {
                days = arrayData[i].slice(4, arrayData[i].length); //Taking number of infected for that day
                all.push(country.concat(days)); //Adding data to data set
                se.push(country.concat(days));
            } else if (i == 0) {
                days = arrayData[i].slice(4, arrayData[i].length); //first row, taken for its headers
                all.push(country.concat(days));
                se.push(country.concat(days));
                it.push(country.concat(days));
                fr.push(country.concat(days));
            } else if (country[0] == "France") {
                days = arrayData[i].slice(4, arrayData[i].length);
                all.push(country.concat(days));
                fr.push(country.concat(days));
            } else if (country[0] == "Italy") {
                days = arrayData[i].slice(4, arrayData[i].length);
                all.push(country.concat(days));
                it.push(country.concat(days));
            }

            //Creating the "total infected" per country. Some countries have multiple entries, so I had to add them up.
            if (i != 0) {
                if (country_totals[country[0]] == undefined) {
					country_totals[country[0]] = {casesToday: parseInt(arrayData[i].slice(arrayData[i].length - 1, arrayData[i].length))};
                    //country_totals[country[0]] = parseInt(arrayData[i].slice(arrayData[i].length - 1, arrayData[i].length));
                }else {
                    country_totals[country[0]]["casesToday"] += parseInt(arrayData[i].slice(arrayData[i].length - 1, arrayData[i].length));
                }
            }
        }

        //The data needs to be transposed in order to be plotted on a line graph
        all = all[0].map((col, i) => all.map(row => row[i]));
        se = se[0].map((col, i) => se.map(row => row[i]));
        fr = fr[0].map((col, i) => fr.map(row => row[i]));
        it = it[0].map((col, i) => it.map(row => row[i]));
				
        country_totals['China']['casesToday'] = country_totals['Mainland China']['casesToday']
        country_totals['United Kingdom']['casesToday'] = country_totals['UK']['casesToday']
		
        //Prepare data for world map (some data have wrong country name)
        geoArray = [['Country', 'Infected']] // Headers 
        for (const [key, value] of Object.entries(country_totals)) {
            geoArray.push([key, value["casesToday"]])
        }
		
        var geodata = google.visualization.arrayToDataTable(geoArray); //Now the data has been loaded for map.

        //Draw line chart
		var options_line = {
			lineWidth: 2,
			pointSize: 5,
			animation:{
			        startup: true,
			        duration: 1200,
			        easing: 'in'
			      }
		};
        var data = new google.visualization.arrayToDataTable(all);
        var chart = new google.visualization.LineChart(document.getElementById('canvas'));
        chart.draw(data, options_line);

        //Draw geograph
		var options_geograph = {colorAxis: {colors: ['orange', 'red']}}
        var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
        chart.draw(geodata, options_geograph);
		
		//Populate table, but first delete wierd countries
		delete country_totals['Mainland China'];
		delete country_totals['UK'];
		delete country_totals['Others'];
		delete country_totals['Vatican City'];
		delete country_totals['Macau'];
		delete country_totals['Monaco'];
		delete country_totals['San Marino'];
		delete country_totals['Saint Barthelemy'];
		
		
        for (const [key, value] of Object.entries(country_totals)) {
			addRow(key,value["population"], value["casesToday"])
        }
		
        ///Listening to what happens with radio buttons
        $('input[type=radio][name=country]').on('change', function() {
            switch ($(this).val()) {
                case 'all':
                    var data = new google.visualization.arrayToDataTable(all);
                    var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                    chart.draw(data,options_line);
                    break;
                case 'it':
                    var data = new google.visualization.arrayToDataTable(it);
                    var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                    chart.draw(data, options_line);
                    break;

                case 'fr':
                    var data = new google.visualization.arrayToDataTable(fr);
                    var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                    chart.draw(data, options_line);
                    break;

                case 'se':
                    var data = new google.visualization.arrayToDataTable(se);
                    var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                    chart.draw(data, options_line);
                    break;
            }
        });
    });
}



