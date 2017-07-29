   //https://keithpblog.wordpress.com/2016/07/31/upgrading-d3-from-v3-to-v4/
   //https://github.com/d3/d3/blob/master/API.md
   //https://stackoverflow.com/questions/39695967/d3-js-ordinal-scale-version-3-to-version-4
   //https://stackoverflow.com/questions/39649525/how-do-i-generate-axis-tick-for-every-year-in-d3
   //Quantile, Quantize, Threshold Scales: http://bl.ocks.org/syntagmatic/29bccce80df0f253c97e
   //Months axis: https://bl.ocks.org/mbostock/1849162
   //Ordinal axis: https://bl.ocks.org/mbostock/3259783

    const colors = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; 
    
    var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

    d3.json(url, function (json) {
    var dataset = json;  
    const baseTemperature = dataset.baseTemperature;
    const monthlyVariance = dataset.monthlyVariance;
    const varianceData = monthlyVariance.map(function(d) {
      return d.variance;
    });
    const lowestVariance = d3.min(varianceData);
    const highestVariance = d3.max(varianceData);
    const length = dataset.monthlyVariance.length;    
    const firstYear = monthlyVariance[0].year;
    const lastYear = monthlyVariance[length-1].year;  
    const width = 1200;
    const height = 550;
    const xpadding = 100; 
    const ypadding = 100;
    const barWidth = (width-xpadding*2)/length*12;
    const barHeight = (height-ypadding*2)/12;    
    

    monthlyVariance.forEach(function(dataPoint, index) {
      //console.log(dataPoint);         
    });  


    //SCALES WITH DOMAINS AND RANGES

    const xScale = d3.scaleLinear()
                     .domain([firstYear, lastYear])                                           
                     .range([xpadding, width - xpadding]);     
    
    const yScale = d3.scaleBand()
                     .domain(months)                     
                     .range([ypadding, height - ypadding]);  

    const colorScale = d3.scaleQuantile()
                     .domain([lowestVariance + baseTemperature, highestVariance + baseTemperature])
                     .range(colors);                 
    
    //CHART WITH RECTANGLES

    const chart = d3.select(".content-container")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .attr("class", "chart");            
   
    var tooltip = d3.select(".content-container").append("p")
      .attr("class", "tooltip")
      .style("opacity", 0);

    chart.selectAll("rect")
      .data(monthlyVariance)
      .enter()
      .append("rect")  
      .attr("x", (d) => {
        return xScale(d.year);
      })  
      .attr("y", (d) => {             
        return yScale(months[d.month - 1]);
      })   
      .attr("width", barWidth)
      .attr("height", barHeight)
      .style("fill", (d) => {
        return colorScale(d.variance + baseTemperature);
      })

      /* see getColor() commented out below 

      .style("fill", (d) => {
        return getColor(d);        
      })

      */        
      
      //ON HOVER FUNCTIONS

      .on("mouseover", function(d){   
         d3.select(this).style("stroke", "black");                    
         var rect = d3.select(this);
         let year = d.year;
         let month = d.month;
         let variance = d.variance;
         let temperature = baseTemperature + variance;
         tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
         tooltip.html("<span class='year'>" + year + 
            ":</span><span class='month'> " + months[month-1] + 
            "</span><br><span class='variance'>Variance: " + variance + 
            "</span><span class='temperature'> Temperature: " + temperature.toFixed(3) + 
            "</span>")
          .style("left", (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY)+ "px");
      })

      .on("mouseout", function(d){ 
         d3.select(this).style("stroke", "none");  
         tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })      
   

    //AXES  
   
    const xAxis = d3.axisBottom(xScale).ticks(26);

    chart.append("g")
      .attr("transform", "translate(0," + (height - ypadding) + ")")
      .call(xAxis)
      .append("text")      
      .attr("x", width/2)
      .attr("y", 50)        
      .style("fill", "#000")
      .style("font-size", "15px")
      .style("font-weight", "bold")     
      .text("Years");  
    
    const yAxis = d3.axisLeft(yScale);
    
    chart.append("g")
      .attr("transform", "translate(" + xpadding + ", 0)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", - 250)
      .attr("y", - 70)        
      .style("fill", "#000")
      .style("font-size", "15px")
      .style("font-weight", "bold")     
      .text("Months");   

    //TITLE AND SUBTITLES  

    chart.append("text")
      .attr("x", (width/2))
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "25px")      
      .attr("font-weight", "bold")
      .text("Monthly Global Land-Surface Temperature");

    chart.append("text")
      .attr("x", (width/2))
      .attr("y", 60)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text("1753 - 2015");  

    chart.append("text")
      .attr("x", (width/2))
      .attr("y", 80)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average. Estimated Jan 1951-Dec 1980 absolute temperature ℃: 8.66 +/- 0.07"); 

    //LEGEND

    var legend = chart.selectAll(".legend")
            .data([0].concat(colorScale.quantiles()), (d) => d)
            .enter()
            .append("g")
            
    legend.append('rect')          
            .attr('x', (d, i) => width - xpadding - 35*colors.length + (i *35))
            .attr('y', height - ypadding/2 - 10)
            .attr('width', 30)
            .attr('height', 15)
            .attr('fill', (d, i) => colors[i]);

    legend.append("text")        
            .text((d) => Math.floor(d * 10) / 10)
            .attr("x", (d, i) => width - xpadding - 35*colors.length + (i *35))
            .attr("y", height - ypadding/4); 

    
}); //end d3.json()
 

/* getColor() function, alternative to quantile scale

var getColor = function(d) {      
      let currentVariance = d.variance;
      let temperature = baseTemperature + currentVariance;
      let thisColor;
      if(temperature < 2.7){                    
          thisColor = colors[0];
        }
        else if(temperature < 3.9 && temperature >= 2.7){
          thisColor = colors[1];
        }
        else if(temperature < 5 && temperature >= 3.9){
          thisColor = colors[2];
        }
        else if(temperature < 6.1 && temperature >= 5){
          thisColor = colors[3];
        }
        else if(temperature < 7.2 && temperature >= 6.1){
          thisColor = colors[4];
        }
        else if(temperature < 8.3 && temperature >= 7.2){
          thisColor = colors[5];
        }
        else if(temperature < 9.4 && temperature >= 8.3){
          thisColor = colors[6];
        }
        else if(temperature < 10.5 && temperature >= 9.4){
          thisColor = colors[7];
        }
        else if(temperature < 11.6 && temperature >= 10.5){
          thisColor = colors[8];
        }
        else if(temperature < 12.7 && temperature >= 11.6){
          thisColor = colors[9];
        }
        else if(temperature >= 12.7){
          thisColor = colors[10];
        }
        else{
          thisColor = colors[0];
        } 
        return thisColor;
    }

*/