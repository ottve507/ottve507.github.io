//Import/setup
google.load('visualization', '1', {
    packages: ['corechart', 'geochart']
});

//Call function to draw chart
google.setOnLoadCallback(startVisualization);

//Function for adding values to table
function addRow(country, population, number_of_cases) {
    if (!document.getElementsByTagName) return;

    tabBody = document.getElementsByTagName("tbody").item(0);
    row = document.createElement("tr");
    cell1 = document.createElement("td");
    cell2 = document.createElement("td");
    cell3 = document.createElement("td");
    cell4 = document.createElement("td");
    textnode1 = document.createTextNode(country);
    textnode2 = document.createTextNode(numberWithSpaces(population));
    textnode3 = document.createTextNode(numberWithSpaces(number_of_cases));
    textnode4 = document.createTextNode(((parseInt(number_of_cases) / population) * 100000).toFixed(3));
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
function startVisualization() {
    //Getting CSV-file with population virus

    countryPopulations = $.get("https://raw.githubusercontent.com/ottve507/Corona-Virus-Dashboard/master/populations.csv", function(csv_in) {

        //Parsing John Hopkins' CSV to array
        var countryPopulations = $.csv.toArrays(csv_in, {
            onParseValue: $.csv.hooks.castToScalar
        });

        var country_totals = [];

        for (var i = 0; i < countryPopulations.length; i++) {
            country_totals[countryPopulations[i][0]] = {
                population: parseInt(countryPopulations[i][1]),
                casesToday: 0,
                casesYesterday: 0
            }
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


        //Setup empty help-array (transforming raw data)
        var all = [];
        var fr = new Array(arrayData[0].length-4).fill(0);
        var fr_n = [];
        var se = [];
        var it = [];
		var sk = [];
		var jp = [];
		var us = new Array(arrayData[0].length-4).fill(0);
		var us_n = [];
		var dk = [];
		var cn = new Array(arrayData[0].length-4).fill(0);
		var cn_n = [];
		var ch = [];
		var no = [];
		var fi = [];
		var de = [];
		var es = [];
		var totalInfected = 0.00;
		var totalInfectedYesterday = 0.00;


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
                fr_n.push(country.concat(days));
				cn_n.push(country.concat(days));
				us_n.push(country.concat(days));
				sk.push(country.concat(days));
				jp.push(country.concat(days));
				dk.push(country.concat(days));
				ch.push(country.concat(days));
				no.push(country.concat(days));
				fi.push(country.concat(days));
				de.push(country.concat(days));
				es.push(country.concat(days));
            } else if (country[0] == "France") {
                days = arrayData[i].slice(4, arrayData[i].length);
				for (var j = 0; j < fr.length; j++) {
					fr[j] = fr[j] + days[j];
				}
            } else if (country[0] == "Italy") {
                days = arrayData[i].slice(4, arrayData[i].length);
                it.push(country.concat(days));
            } else if (country[0] == "Mainland China") {
                days = arrayData[i].slice(5, arrayData[i].length);
				for (var j = 0; j < cn.length; j++) {
					cn[j] = cn[j] + days[j];
				}
            } else if (country[0] == "US") {
                days = arrayData[i].slice(5, arrayData[i].length);
				for (var j = 0; j < us.length; j++) {
					us[j] = us[j] + days[j];
				}
            } else if (country[0] == "Korea, South") {
                days = arrayData[i].slice(4, arrayData[i].length);
                sk.push(country.concat(days));
            } else if (country[0] == "Japan") {
                days = arrayData[i].slice(4, arrayData[i].length);
                jp.push(country.concat(days));
            } else if (country[0] == "Denmark") {
                days = arrayData[i].slice(4, arrayData[i].length);
                dk.push(country.concat(days));
            } else if (country[0] == "Switzerland") {
                days = arrayData[i].slice(4, arrayData[i].length);
                ch.push(country.concat(days));
            } else if (country[0] == "Norway") {
                days = arrayData[i].slice(4, arrayData[i].length);
                no.push(country.concat(days));
            } else if (country[0] == "Finland") {
                days = arrayData[i].slice(4, arrayData[i].length);
                fi.push(country.concat(days));
            } else if (country[0] == "Germany") {
                days = arrayData[i].slice(4, arrayData[i].length);
                de.push(country.concat(days));
            } else if (country[0] == "Spain") {
                days = arrayData[i].slice(4, arrayData[i].length);
                es.push(country.concat(days));
            }
			

            //Creating the "total infected" per country. Some countries have multiple entries, so I had to add them up.
            if (i != 0) {
                if (country_totals[country[0]] == undefined) {
                    country_totals[country[0]] = {
                        casesToday: parseInt(arrayData[i].slice(arrayData[i].length - 1, arrayData[i].length))
                    };
                } else {
                    country_totals[country[0]]["casesToday"] += parseInt(arrayData[i].slice(arrayData[i].length - 1, arrayData[i].length));
                }
				totalInfected += parseInt(arrayData[i].slice(arrayData[i].length - 1, arrayData[i].length))
				totalInfectedYesterday += parseInt(arrayData[i].slice(arrayData[i].length - 2, arrayData[i].length-1))
            }
        }
		
		document.getElementById('totalNumbers').innerHTML = numberWithSpaces(totalInfected)
		document.getElementById('changeYesterday').innerHTML = ((totalInfected/totalInfectedYesterday-1)*100).toFixed(1) + "%";
		

        //The data needs to be transposed in order to be plotted on a line graph
		cn_n.push(["China"].concat(cn));
		us_n.push(["US"].concat(us));
		fr_n.push(["France"].concat(fr));
		
		all.push(["France"].concat(fr));
        
        //The data needs to be transposed in order to be plotted on a line graph
        all = all[0].map((col, i) => all.map(row => row[i]));
        se = se[0].map((col, i) => se.map(row => row[i]));
        fr_n = fr_n[0].map((col, i) => fr_n.map(row => row[i]));
        it = it[0].map((col, i) => it.map(row => row[i]));
		cn_n = cn_n[0].map((col, i) => cn_n.map(row => row[i]));
		us_n = us_n[0].map((col, i) => us_n.map(row => row[i]));
		sk = sk[0].map((col, i) => sk.map(row => row[i]));
		jp = jp[0].map((col, i) => jp.map(row => row[i]));
		dk = dk[0].map((col, i) => dk.map(row => row[i]));
		ch = ch[0].map((col, i) => ch.map(row => row[i]));
		no = no[0].map((col, i) => no.map(row => row[i]));
		fi = fi[0].map((col, i) => fi.map(row => row[i]));
		de = de[0].map((col, i) => de.map(row => row[i]));
		es = es[0].map((col, i) => es.map(row => row[i]));
		
		
		//document.getElementById("container").innerHTML = fr_n;
		
        country_totals['China']['casesToday'] = country_totals['Mainland China']['casesToday']
        country_totals['United Kingdom']['casesToday'] = country_totals['United Kingdom']['casesToday']
		country_totals['South Korea']['casesToday'] = country_totals['Korea, South']['casesToday']
		//country_totals['Russia']['casesToday'] = country_totals['Russian Federation']['casesToday']

        //Prepare data for world map (some data have wrong country name)
        geoArray = [
            ['Country', 'Infected per 100 000', 'Infected']
        ] // Headers 
        for (const [key, value] of Object.entries(country_totals)) {
			try {
			  geoArray.push([key, 100000*(parseInt(value["casesToday"])/value["population"]), value["casesToday"]])
			}
			catch(err) {
			  geoArray.push([key, 0])
			}
        }
		
		for (var i = 0; i < geoArray.length; i++) {
			geoArray[i][0] = geoArray[i][0] || 0
			geoArray[i][1] = geoArray[i][1] || 0
			if (geoArray[i][0] == "Others") {
				geoArray[i][1] = geoArray[i][1] = 0
			} else if (geoArray[i][0] == "San Marino") {
				geoArray[i][1] = geoArray[i][1] = 0
			}
		}
		
		
	    //document.getElementById("container").innerHTML = geoArray;
		
        var geodata = google.visualization.arrayToDataTable(geoArray); //Now the data has been loaded for map.

        //Draw line chart
        var options_line = {
            lineWidth: 2,
            pointSize: 5,
            animation: {
                startup: true,
                duration: 1200,
                easing: 'in'
            }
        };
        var data = new google.visualization.arrayToDataTable(all);
        var chart = new google.visualization.LineChart(document.getElementById('canvas'));
        chart.draw(data, options_line);
		
		var mySelect = document.getElementById('mySelect');

		mySelect.onchange = function() {
		   var x = document.getElementById("mySelect").value;
           switch (x) {
               case 'all':
                   var data = new google.visualization.arrayToDataTable(all);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'it':
                   var data = new google.visualization.arrayToDataTable(it);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'fr':
                   var data = new google.visualization.arrayToDataTable(fr_n);
				   console.log(fr_n)
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'se':
                   var data = new google.visualization.arrayToDataTable(se);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'sk':
                   var data = new google.visualization.arrayToDataTable(sk);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'cn_n':
                   var data = new google.visualization.arrayToDataTable(cn_n);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'us_n':
                   var data = new google.visualization.arrayToDataTable(us_n);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'jp':
                   var data = new google.visualization.arrayToDataTable(jp);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'dk':
                   var data = new google.visualization.arrayToDataTable(dk);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'ch':
                   var data = new google.visualization.arrayToDataTable(ch);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'no':
                   var data = new google.visualization.arrayToDataTable(no);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'fi':
                   var data = new google.visualization.arrayToDataTable(fi);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'de':
                   var data = new google.visualization.arrayToDataTable(de);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
               case 'es':
                   var data = new google.visualization.arrayToDataTable(es);
                   var chart = new google.visualization.LineChart(document.getElementById('canvas'));
                   chart.draw(data, options_line);
                   break;
			   }
			   
		 }

        //Draw geograph
        var options_geograph = {
            colorAxis: {
                colors: ['orange', 'red']
            },
			sizeAxis: {minValue: 2, maxValue: 20}
        }
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
            addRow(key, value["population"], value["casesToday"])
        }

    });
}