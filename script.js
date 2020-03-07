//Import/setup
google.load('visualization', '1', {
    packages: ['corechart', 'geochart']
});

//Call function to draw chart
google.setOnLoadCallback(drawVisualizations);

//Function to draw different charts
function drawVisualizations() {

    //Getting CSV-file about Corona virus (change to local CSV if offline)
    $.get("https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv", function(csv_in) {

        //Parsing John Hopkins' CSV to array
        var arrayData = $.csv.toArrays(csv_in, {
            onParseValue: $.csv.hooks.castToScalar
        });

        //Setup empty help-array (transforming raw data)
        var all = [];
        var fr = [];
        var se = [];
        var it = [];
        var country_totals = [];

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
                    country_totals[country[0]] = parseInt(arrayData[i].slice(arrayData[i].length - 1, arrayData[i].length));
                } else {
                    country_totals[country[0]] += parseInt(arrayData[i].slice(arrayData[i].length - 1, arrayData[i].length));
                }
            }
        }

        //The data needs to be transposed in order to be plotted on a line graph
        all = all[0].map((col, i) => all.map(row => row[i]));
        se = se[0].map((col, i) => se.map(row => row[i]));
        fr = fr[0].map((col, i) => fr.map(row => row[i]));
        it = it[0].map((col, i) => it.map(row => row[i]));

        //Prepare data for world map (some data have wrong country name)
        country_totals['China'] = country_totals['Mainland China']
        country_totals['United Kingdom'] = country_totals['UK']
        geoArray = [['Country', 'Infected']] // Headers 
        for (const [key, value] of Object.entries(country_totals)) {
            geoArray.push([key, value])
        }
        var geodata = google.visualization.arrayToDataTable(geoArray); //Now the data has been loaded.

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
        var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
        chart.draw(geodata);

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